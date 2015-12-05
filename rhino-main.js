/**
 *  COMP 4140 - RESESARCH PROJECT
 *  Analyzing Vulnerabilities in SHA-0
 *
 *  This main program is meant to be run via
 *  Mozilla's Rhino JavaScript interpreter
 *  through a command line interface.
 *
 *  It accepts 1 integer argument that defines
 *  the exponent of the maximum number of hashes to
 *  calculate before ending.
 *  IE input argument of 20 will calculate 2^20 hashes.
 *
 *  Data has been included to show the number of hashes
 *  previously calculated.
 *
 *
 *  @for COMP 4140 - Research Project
 *  @author Tim Sands
 *  @author Nathan Jewsbury
 *  @date December 4 2015
 */


var ConsoleUtils = load('./console-utils.js'),
    CryptoCore = load('./core.js'),
    SHA0 = load('./sha0.js'),
    ShaAttack = load('./sha-attack.js'),
    testing = load('./perturb-util.js'),
    initialized = true;

if (!CryptoJS || (!ca && !ca.crypto && !ca.crypto.research && !ca.crypto.research.ShaAttack)) {
  console.log('Required libraries not yet loaded!');
  initialized = false;
}

function main(args) {
  var attack = ca.crypto.research.ShaAttack,
      inputString,
      roundsString,
      predeterminedMessage;
  
  if (args && args.length > 3) {
    throw new Error('Input only allows upto two strings arguments: <exponent> <number of rounds> <predetermined hex string message');
  } else if (args && args.length === 1) {
    inputString = args[0];
  } else if (args && args.length === 2) {
    inputString = args[0];
    roundsString = args[1];
  } else if (args && args.length === 3) {
    inputString = args[0];
    roundsString = args[1];
    predeterminedMessage = args[2];
  } else if (!args || !args.length) {
    // If the user doesn't provide an input string.
    inputString = '20';
    roundsString = '80';
  }
  
  if (!attack.testShaImplementation()) {
    throw new Error('SHA-0 Implementation isn\'t correct. Please investigate.');
  }
  
  console.log('COMP 4140 - RESEARCH PROJECT');
  console.log('By: Nathan Jewsbury & Tim Sands');
  console.log('-------------------------------');
  console.log('Accepted HashCount: 2^' + inputString);
  console.log('Number of hash rounds: ' + roundsString);
  console.log('');
  attack.doAttack(parseInt(inputString), console.log, parseInt(roundsString), predeterminedMessage);
}

if (initialized) {
  main(arguments);
}