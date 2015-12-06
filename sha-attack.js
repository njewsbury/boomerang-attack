/* global CryptoJS, console */
/**
 *  SHA-0 Collision Search
 *  <p>
 *  An attempt to find collisions in SHA-0, using techniques
 *  developed between 1998 by Chabaud and Joux to 2008 by
 *  Manuel and Peyrin.
 *  By finding a global differential mask to try and maximize
 *  local collisions in the SHA-0 functions, the probability of
 *  success of finding collisions is reduced from the theoretical
 *  maximum of (2^-80).
 *
 *
 *  @for COMP 4140 - Research Project
 *  @author Tim Sands
 *  @author Nathan Jewsbury
 *  @date December 4 2015
 */
var ca = {};
ca.crypto = {};
ca.crypto.research = {};

ca.crypto.research.ShaAttack = (function () {
    'use strict';
    /**
     * Begins the SHA-0 attack given a precomputed message string. With this message
     * we apply the global differential. Comparing the two message hashes to determine
     * if a collision has occured.
     *
     * @param {string} precomputedMessage Hexadecimal string of the message
     * @param {Function} logger Log function to display information to the user
     * @param {int} numRounds (optional) Number of rounds to run SHA-0 hash operation
     *
     * @returns {boolean} If a collision was found.
     */
    /* eslint no-extra-parens: 0*/
    function precomputedMessageAttack(precomputedMessage, logger, numRounds) {
      var stringHexArray = precomputedMessage.match(/.{1,8}/g),
          hexArray = [],
          PerturbationUtils = ca.crypto.research.PerturbationUtils,
          globalDifferential = PerturbationUtils
            .getGlobalDifferentialMask(PerturbationUtils.DIST_VECTOR_FOUR),
          oneBlockMessage,
          oneBlockMessagePrime,
          hashOne,
          hashOnePrime,
          hashDiff,
          hashDiffVal,
          i;

      // Ensure our message is valid
      if (!stringHexArray) {
        logger('Invalid precomputed message. The message should be a hexadecimal string.');
        return false;
      }

      // Convert the message to a hex array
      for (i in stringHexArray) {
        hexArray.push(parseInt(stringHexArray[i], 16));
      }

      // Generate a  message: M
      oneBlockMessage = CryptoJS.lib.WordArray.create(hexArray);
      // Generate M' := M XOR DELTA
      oneBlockMessagePrime = PerturbationUtils.xorWordArrays(
        oneBlockMessage.words,
        globalDifferential
      );

      // Set the number of hash rounds
      CryptoJS.SHA0.setRounds(numRounds || 80);

      // Generate H and H'
      hashOne = CryptoJS.SHA0(oneBlockMessage);
      hashOnePrime = CryptoJS.SHA0(CryptoJS.lib.WordArray.create(oneBlockMessagePrime));

      // Test if hashes collide.
      hashDiff = PerturbationUtils.xorWordArrays(hashOne.words, hashOnePrime.words);
      hashDiffVal = PerturbationUtils.sumWordArray(hashDiff);

      if (hashDiffVal === 0) {
        console.log('Message One');
        console.logWordArray(oneBlockMessage.words, 0, 4, 16);
        console.log('Message One Prime');
        console.logWordArray(oneBlockMessagePrime, 0, 4, 16);
        console.log('Global Differential Mask');
        console.logWordArray(globalDifferential, 0, 4, 16);
        logger('Resulting Hash:      ' + hashOne.toString());
        logger('Resulting HashPrime: ' + hashOnePrime.toString());
        logger('Found collision for predetermined message: "' + precomputedMessage + '"');
        return true;
      } else {
        logger('Did not find any collisions for predetermined message: "' + precomputedMessage + '"');
      }
      return false;
    }

    /**
     * Begin the SHA-0 Attack. Calculate a random message and apply the
     * computed global differential. Comparing these two messages hashes
     * to determine if a collision has occured.
     *
     * @param {int} exponent The number of collisions to calculate as a function of 2^exponent
     * @param {int} blockCount (optional) How many blocks the messages should be,
     *  default to one.
     * @param {Function} logger Function to use to log results
     * @param {int} numRounds (optional) The number of rounds to use in SHA-0
     *
     * @returns {boolean} If a collision was found.
     */
    /* eslint no-extra-parens: 0*/
    function beginAttack(exponent, blockCount, logger, numRounds) {
      // Get the global differential mask: DELTA
      var PerturbationUtils = ca.crypto.research.PerturbationUtils,

          globalDifferential = PerturbationUtils
            .getGlobalDifferentialMask(PerturbationUtils.DIST_VECTOR_THREE, 79, 2),

          oneBlockMessage,
          oneBlockMessagePrime,
          hashOne,
          hashOnePrime,
          hashDiff,
          hashDiffVal,
          hashes,
          foundCollision,
          maxHashes,
          printMod,
          // Timing
          startTotalHash = Date.now(),
          startChunkHash,
          totalDiff,
          chunkDiff,
          totalChunkDiff;

      hashes = 0;
      foundCollision = false;
      CryptoJS.SHA0.setRounds(numRounds || 80);

      if (exponent > 31) {
        maxHashes = Math.pow(2, exponent);
        printMod = 1 << 19;
      } else {
        maxHashes = 1 << exponent >>> 0;
        printMod = maxHashes >>> (Math.round(exponent/2));
      }
      console.log('Calculating [' + maxHashes + ' ] Print every: ' + printMod);
      startChunkHash = Date.now();

      do {
        // Generate a random message: M
        oneBlockMessage = CryptoJS.lib.WordArray.random(64*blockCount);
        // Generate M' := M XOR DELTA
        oneBlockMessagePrime = PerturbationUtils.xorWordArrays(
          oneBlockMessage.words,
          globalDifferential
        );
        // Calculate hashes H, H'
        hashOne = CryptoJS.SHA0(oneBlockMessage);
        hashOnePrime = CryptoJS.SHA0(CryptoJS.lib.WordArray.create(oneBlockMessagePrime));
        hashes += 2;
        // Test if hashes collide.
        hashDiff = PerturbationUtils.xorWordArrays(hashOne.words, hashOnePrime.words);
        hashDiffVal = PerturbationUtils.sumWordArray(hashDiff);
        if (hashDiffVal === 0) {
          logger('Found a collision!');
          foundCollision = true;
        } else if (hashes % printMod === 0) {
          // in seconds.
          chunkDiff = (Date.now() - startChunkHash)/1000;
          totalChunkDiff = (Date.now() - startTotalHash)/1000;
          logger(
            'Calculated '
            + hashes + ' of ' + maxHashes
            + ' hashes in '
            + Math.floor(totalChunkDiff/60) + ' mins '
            + (totalChunkDiff%60).toPrecision(5) + ' sec.'
            + ' [' + ((chunkDiff/printMod)*1000).toPrecision(5) + ' millisec/hash] '
            + Math.floor((hashes/maxHashes)*100) + '%'
          );
          startChunkHash = Date.now();
        }
      } while (hashes < maxHashes && !foundCollision);
      // Timing
      totalDiff = (Date.now() - startTotalHash)/1000;
      logger(
        'Calculated '
        + hashes
        + ' hashes in '
        + Math.floor(totalDiff/60/60) + ' hours '
        + Math.floor(totalDiff/60) + ' mins '
        + totalDiff%60 + ' sec'
        + ' RAW: ' + totalDiff
      );
      //
      if (foundCollision) {
        console.log('Message One');
        console.logWordArray(oneBlockMessage, 0, 4, 16);
        console.log('Message One Prime');
        console.logWordArray(oneBlockMessagePrime, 0, 4, 16);
        console.log('Global Differential Mask');
        console.logWordArray(globalDifferential, 0, 4, 16);
        logger('Resulting Hash:      ' + hashOne.toString());
        logger('Resulting HashPrime: ' + hashOnePrime.toString());
      } else {
        console.log('Did not find any collisions.');
      }
      logger(
        '2^' + exponent + ', '
        + hashes + ', '
        + totalDiff + ', '
        + foundCollision
      );
      return foundCollision;
    }

  return {
    doAttack: function(countExponent, logFunction, numRounds, precomputedMessage) {
      if (precomputedMessage && precomputedMessage.trim().length) {
        return precomputedMessageAttack(precomputedMessage.trim(), logFunction, numRounds);
      }
      return beginAttack(countExponent, 1, logFunction, numRounds);
    },
    /**
     * Test if the provided SHA-0 implemention is correct. Uses two KNOWN
     * plaintext-ciphertext SHA-0 pairs.
     *
     * @return {boolean} If the SHA-0 implementation is correct.
     */
    testShaImplementation: function() {
        var hashResult,
            hashes = ca.crypto.research.ShaAttack.KNOWN_SHA0_HASHES,
            index;
        try {
          for (index in hashes) {
            hashResult = CryptoJS.SHA0(hashes[index].message).toString();
            if (hashResult !== hashes[index].hash) {
              throw new Error('SHA-0 Implementation deviates from known hashes. Please correct implementation');
            }
          }
          console.log('Implementation is correct. SHA-0 lives!');
          return true;
        } catch (Error) {
          console.log(Error);
          return false;
        }
    }
  };
})();

ca.crypto.research.ShaAttack.KNOWN_SHA0_HASHES = [
  {
    'message': 'abc',
    'hash': '0164b8a914cd2a5e74c4f7ff082c4d97f1edf880'
  },
  {
    'message': 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
    'hash': 'd2516ee1acfa5baf33dfc1c471e438449ef134c8'
  }
];