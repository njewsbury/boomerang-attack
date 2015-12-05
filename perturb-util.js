
var ca;

if (!ca) {
  ca = {};
}
if (!ca.crypto) {
  ca.crypto = {};
}
if (!ca.crypto.research) {
  ca.crypto.research = {};
}

ca.crypto.research.PerturbationUtils = (function () {
  'use strict';
  
  /**
   * Given a thirty-two bit word, rotate it the given amount.
   *
   * @param thirtyTwoBitWord {int} The word to rotate
   * @param rotationAmount {int} The amount to rotate
   *
   * @return {int} The rotation of the word given.
   */
  function rotateWord(thirtyTwoBitWord, rotationAmount) {
      if (!rotationAmount) {
        return thirtyTwoBitWord >>> 0;
      }
      return ( 
        ((thirtyTwoBitWord << rotationAmount) >>> 0)
        |
        (thirtyTwoBitWord >>> (32 - rotationAmount))
      ) >>> 0;
  }
  
  return {
    /**
     * Convert the given bit string into an array of single bits.
     * 
     * @param bitString {string} The bit string to convert to an array.
     * @param startIndex {int (optional)} The index to start the array at.
     * @param expectedLength {int (optional)} The expected length of the bitString.
     *
     * @return {array[int]} Array of single bit elements.
     */
    convertBitStringToBitArray: function(bitString, startIndex, expectedLength) {
      var singleBit, bitArray, i, length, elements;
      if (!startIndex) {
        startIndex = 0;
      }
      if (!bitString || typeof bitString !== 'string' || !(bitString.trim()).length) {
        throw new Error('Malformed input!');
      }
      bitString = bitString.replace(/\s/g, '');
      if (expectedLength && bitString.length !== expectedLength) {
        console.log(
          'Expected length was: ' 
          + expectedLength 
          + ' but string length was: ' 
          + bitString.length
        );
        throw new Error('Bit String length doesn\'t match expected length!');
      }
      bitArray = [];
      for (i = 0, length = bitString.length; i < length; i++) {
        singleBit = parseInt(bitString.substring(i, i+1), 2);
        bitArray[i+startIndex] = singleBit | 0;
      }   
      return bitArray;
    },
    /**
     * Convert the given bit array into a string of single bits.
     * 
     * @param bitString {array[int]} The bit array to convert to a string.
     * @param startIndex {int (optional)} The index to start the array at.
     * @param expectedLength {int (optional)} The expected length of the bitString.
     *
     * @return {string} String of single bit elements.
     */
    convertBitArrayToBitString: function(bitArray, startIndex, expectedLength) {
      var bitString, i, length;
      if (!startIndex) {
        startIndex = 0;
      }
      if (!bitArray || !bitArray.length) {
        throw new Error('Malformed input!');
      }
      bitString = '';
      for (i = startIndex, length = bitArray.length; i < length; i++) {
        if (!bitArray[i]) {
          bitString += '0';
        } else {
          bitString += (bitArray[i]).toString(2);
        }
      }
      if (expectedLength && (bitString.length !== expectedLength)) {
        console.log(
          'Expected length was: '
          + expectedLength
          + ' but string length was: '
          + bitString.length
        );
        throw new Error('Bit string length doesn\'t match expected length!');
      }
      return bitString;
    },
    
    /**
     *  Construct the initial Perturbation Mask from the disturbance vector.
     *  <p>
     *  The perturbation mask is defined by the following relation:
     *
     *  PM := { PM[-5], ..., PM[-1], PM[0], PM[1], ..., PM[79] }
     *  PM[i] = 0x00000002 for all 0 <= i < 80 && disturbanceArray[i] === 1
     *  PM[i] = 0x00000000 for all i < 0 or i < 80 && disturbanceArray[i] !== 1
     *
     *  The use of negative indices simplify relationships later on.
     *
     *  @param disturbanceArray {array[int]} Binary array constructed from the disturbance vector.
     *  @param startIndex {int (optional)} The index to start reading the array from.
     *
     *  @returns {array[int]} The initial perturbation mask.
     */
    constructInitialPerturbationMask: function(disturbanceArray, startIndex) {
      var i, 
          max,
          perturbationMask = [],
          selfRef = ca.crypto.research.PerturbationUtils;
      if (!startIndex) {
        startIndex = 0;
      }
      for (i = startIndex, max = disturbanceArray.length; i < max; i++) {
        if (i < 0) {
          perturbationMask[i] = selfRef.ZERO_MASK;
        } else {
          if (disturbanceArray[i] === 1) {
            perturbationMask[i] = selfRef.FLIP_MASK;
          } else {
            perturbationMask[i] = selfRef.ZERO_MASK;
          }
        }
      }
      return perturbationMask;
    },
    
    /**
     *  Tests the correctness of the initial perturbation mask. The perturbation mask
     *  MUST satisfy the SHA-0 word expansion function for the resulting global differential
     *  to also satisfy the expansion function.
     *
     *  The expansion function to be satisfied is defined as follows:
     *    f(i) := f(i-3) ^ f(i-8) ^ f(i-14) ^ f(i-16)
     *  For all i such that: 11 <= i < 80
     *  The values extend up to 80 because the expansion function generates 80 words.
     *  
     *  @param perturbationMask {array[int]} The perturbation mask to test correctness.
     *  @param startIndex {int (optional)} The index to start testing the condition at.
     *
     *  @return {boolean} True if the entire perturbation mask satisfies the expansion function.
     */
    isPerturbationMaskCorrect: function(perturbationMask, startIndex) {
      var i, iSub3, iSub8, iSub14, iSub16, tempXor;
      
      if (!perturbationMask || !perturbationMask.length) {
        console.log('Perturbation mask is invalid!');
        return false;
      }
      if (!startIndex) {
        startIndex = 11;
      }
      
      for (i = startIndex; i < 80; i++) {
        iSub3 = perturbationMask[i-3];
        iSub8 = perturbationMask[i-8];
        iSub14 = perturbationMask[i-14];
        iSub16 = perturbationMask[i-16];
        tempXor = (iSub3 ^ iSub8 ^ iSub14 ^ iSub16) >>> 0;
        
        if (perturbationMask[i] !== tempXor) {
          console.log('Perturbation mask failed expansion satisfaction at element: ' + i);
          return false;
        }
      }      
      return true;
    },
    
    /**
     *  From the initial perturbation mask construct the remaining corrective masks.
     *  <p>
     *  The corrective masks are specific bit flips to create local collisions given
     *  the perturbation mask. There are five corrective masks and they are defined as follows:
     *
     *  CM0[i] = PM[i]; // Corrective mask 0 -IS- the perturbation mask.
     *  CM1[i] = ROL_5(PM[i-1]);
     *  CM2[i] = PM[i-2];
     *  CM3[i] = ROL_30(PM[i-3]);
     *  CM4[i] = ROL_30(PM[i-4]);
     *  CM5[i] = ROL_30(PM[i-5]);
     *
     *  [i] defines the i-th word of the given mask, PM being the perturbationMask and CMn being 
     *  the n-th corrective masks. ROL_n defines a left rotation by n-bits.
     *
     *  @param perturbationMask {array[int]} The 80-word perturbation mask.
     *  @param startIndex {int} The index the perturbationMask starts at.
     *
     *  @return {object} An object containing all 'n' corrective masks.     
     *
     */
    constructCorrectiveMasks: function(perturbationMask, startIndex) {
      var i,
          max,
          correctiveMasks = {};
      
      correctiveMasks[0] = [];
      correctiveMasks[1] = [];
      correctiveMasks[2] = [];
      correctiveMasks[3] = [];
      correctiveMasks[4] = [];
      correctiveMasks[5] = [];
      
      for (i = 0, max = perturbationMask.length; i < max; i++) {
        correctiveMasks[0][i] = rotateWord(perturbationMask[i], 0);
        correctiveMasks[1][i] = rotateWord(perturbationMask[i-1], 5);
        correctiveMasks[2][i] = rotateWord(perturbationMask[i-2], 0);
        correctiveMasks[3][i] = rotateWord(perturbationMask[i-3], 30);
        correctiveMasks[4][i] = rotateWord(perturbationMask[i-4], 30);
        correctiveMasks[5][i] = rotateWord(perturbationMask[i-5], 30);
      }      
      return correctiveMasks;
    },

    /**
     *  Given two word arrays return a new array created by XORing each array element
     *  together.
     *
     *  @param wordArrayOne {array[int]} The first array.
     *  @param wordArrayTwo {array[int]} The second array.
     *
     *  @return {array[int]} The array created by XORing each element from the two arrays.
     */
    xorWordArrays: function(wordArrayOne, wordArrayTwo, startIndex) {
      var i, max, xorArray;
      if ((!wordArrayOne && !wordArrayTwo) || (!wordArrayOne.length && !wordArrayTwo.length)) {
        console.log('Both input arrays are invalid.');
        return [];
      }
      if (!startIndex) {
        startIndex = 0;
      }
      xorArray = [];
      max = Math.max(wordArrayOne.length, wordArrayTwo.length)
      for (i = startIndex; i < max; i++) {
        if (i > wordArrayOne.length) {
          // We've exceeded WordArrayOne, but still in range of WordArrayTwo
          xorArray[i] = wordArrayTwo[i] >>> 0;
        } else if (i > wordArrayTwo.length) {
          // We've exceeded WordArrayTwo, but still in range of WordArrayOne.
          xorArray[i] = wordArrayOne[i] >>> 0;
        } else {
          // We're still in range of both word arrays.
          xorArray[i] = (wordArrayOne[i] ^ wordArrayTwo[i]) >>> 0;
        }
      }
      return xorArray;
    },
    
    /**
     * Given the full list of corrective masks, construct the global differential mask
     * that is to be applied to the input messages. The global differential is defined
     * as the combination of all the corrective masks. Described as:
     *
     * GDM := CM0 ^ CM1 ^ CM2 ^ CM3 ^ CM4 ^ CM5
     *
     * @param correctiveMasks {object} Object containing ALL corrective masks.
     *
     * @return {array[int]} The global 80-word differential mask.
     */
    constructGlobalDifferentialMask: function(correctiveMasks) {
      var i, max, globalDifferential = [];
      
      if (!correctiveMasks || !correctiveMasks[0] && !correctiveMasks[5]) {
        console.log('Invalid corrective masks given to global differential!');
        return [];
      }
      
      for (i = 0, max = correctiveMasks[0].length; i < max; i++) {
        globalDifferential[i] = (
          0x00000000
          ^ correctiveMasks[0][i]
          ^ correctiveMasks[1][i]
          ^ correctiveMasks[2][i]
          ^ correctiveMasks[3][i]
          ^ correctiveMasks[4][i]
          ^ correctiveMasks[5][i]
        ) >>> 0;
      }
      return globalDifferential;
    },
    
    /**
     *  Wrapper method for constructing the entire Global Differential Mask.
     *  <p>
     *  Simply a convenience method for building the entire global differential
     *  that gets applied to messages. The global differential is constructed
     *  by created a perturbation mask using the given disturbance vector.
     *  Then from the perturbation mask creating a series of corrective masks
     *  that cause local collisions in the expansion function.
     *  Lastly all corrective masks are XOR'd together to create the global
     *  differential.
     *
     *  @param disturbanceVector {string} A bit-string representation of the disturbance vector.
     *  @param conditionStartIndex {int (optional)} The index to start testing the globalDifferential.
     *  @param blockCount {int (optional)} How many blocks of repeated global differential mask.
     *
     *  @return {array[int]} a 16 word array representing the global differential.
     */
    getGlobalDifferentialMask: function(disturbanceVector, conditionStartIndex, blockCount) {
      var disturbanceArray,
          perturbationMask,
          correctiveMasks,
          globalDifferential,
          duplicatedGlobalDifferential,
          i;
          
      disturbanceArray = this.convertBitStringToBitArray(disturbanceVector, -5, 85);
      perturbationMask = this.constructInitialPerturbationMask(disturbanceArray, -5);
      if (!this.isPerturbationMaskCorrect(perturbationMask, conditionStartIndex)) {
        console.log('The initial perturbation mask is incorrect! It won\'t create ANY collisions.');
        throw new Error('The initial perturbation mask did not pass the correctness test.');
      }
      // Past this point - assume a correct perturbation mask.
      correctiveMasks = this.constructCorrectiveMasks(perturbationMask, -5);
      globalDifferential = this.constructGlobalDifferentialMask(correctiveMasks);
      globalDifferential = globalDifferential.splice(0, 16);
      
      if (!blockCount) {
        return globalDifferential;
      }
      duplicatedGlobalDifferential = [];
      for (i = 0; i < blockCount; i++) {
        duplicatedGlobalDifferential.push.apply(
          duplicatedGlobalDifferential,
          globalDifferential
        );
      }
      return duplicatedGlobalDifferential;
    },
    
    /**
     *  Iterate through all the words of a given word array and sum the value.
     *  <p> 
     *  Useful for determining if an entire word array is zero.
     *
     *  @param wordArray {array[int]} The word array to sum.
     *  @param startindex {int} The index to start the sum from.
     *
     *  @return {int} The sum of the given word array.
     */
    sumWordArray: function(wordArray, startIndex) {
      var i, max, sum;
      if (!wordArray || !wordArray.length) {
        console.log('[SumWordArray] Invalid word array provided!');
        return -1;
      }
      if (!startIndex) {
        startIndex = 0;
      }
      
      sum = 0;
      for (i = startIndex, max = wordArray.length; i < max; i++) {
        sum += (wordArray[i] >>> 0);
      }
      return sum;
    }
  };
}());

ca.crypto.research.PerturbationUtils.FLIP_MASK = 0x00000002;
ca.crypto.research.PerturbationUtils.ZERO_MASK = 0x00000000;

ca.crypto.research.PerturbationUtils.DIST_VECTOR_NOT = ''
  + '00000'
  + '11111111111111111111'
  + '11111111111111111111'
  + '11111111111111111111'
  + '11111111111111111111';

ca.crypto.research.PerturbationUtils.DIST_VECTOR_ONE = ''
  + '00000'
  + '00010000000100100000'
  + '00100001101101111110'
  + '11010010000101010010'
  + '10100010111001100000';
  
ca.crypto.research.PerturbationUtils.DIST_VECTOR_TWO = ''
  + '10110'
  + '11110101101110001000'
  + '10101000000000100100'
  + '00100000100001001011'
  + '00000010001000010000';
  
ca.crypto.research.PerturbationUtils.DIST_VECTOR_THREE = ''
  + '00000'
  + '10010000000100100000'
  + '00100001101101111110'
  + '11010010000101010010'
  + '10100010111001100000';

ca.crypto.research.PerturbationUtils.DIST_VECTOR_FOUR = ''
  + '00000'
  + '00100010000000101111'
  + '01100011100000010100'
  + '01000100100100111011'
  + '00110000111110000000';