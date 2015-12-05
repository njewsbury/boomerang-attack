/**
  CONSOLE-UTILS JS - A Variety of useful printing/console functions.
  <p>
  A series of functions to aid in printing out a variety of
  objects utilized throughout the project.
  Mainly used to allow compatibility with browser environments.
  
  For COMP 4140 Research Project - Finding Collisions in SHA0
  By Tim Sands & Nathan Jewsbury
  Fall 2015
*/
var console;

if (!console) {
  console = {};
}

if (!console.log) {
  console.log = function(str) {
    print(str);
  };
}

/**
 *  Given an array of undefined elements, print their string
 *  representations. If the defined parameters are set, allows
 *  for nice console formatting.
 *
 *  @param arr {array<T>} Array to print.
 *  @param startIndex {int (optional)} The index to start printing the array from.
 *  @param printModulus {int (optional)} The number of elements to print before a new line.
 */
console.logArray = function(arr, startIndex, printModulus) {
  var str, i, max, element;
  if (!arr || !arr.length) {
    console.log('Empty or undefined array.');
    return;
  }
  element = 1;
  str = '';
  for (i = startIndex, max = arr.length; i < max; i++) {
    str += arr[i] + ' ';
    if (printModulus && (element % printModulus === 0)) {
      console.log(str);
      str = '';
    }
    element++;
  }
  console.log(str);
}

/**
 * Returns a Hex String of the specified length. Useful for keeping everything consistent
 * if leading zeroes appear.
 *
 * @param hexNumber {int} The number to print in hex format.
 * @param length {int} The minimum length the hex number must be. Default is 0.
 */
console.getHexString = function(hexNumber, length) {
  var i, chr, str;
  if (typeof hexNumber !== 'number') {
    console.log('Unable to logHex for type: ' + typeof hexNumber);
    return;
  }
  if (!length) {
    length = 0;
  }
  if (!hexNumber) {
    chr = '0';
  } else {
    chr = (hexNumber >>> 0).toString(16);
  }
  str = '';
  if (chr.length < length) {
    for (i = chr.length; i < length; i++) {
      str += '0';
    }
  }
  str += chr;
  str = '0x' + str.toUpperCase();
  return str;
}

/**
 * Log a hex character of specified length.
 *
 * @param hexNumber {int} The hex number to print
 * @param length {int} The minimum length the hex number must be.
 */
console.logHex = function(hexNumber, length) {
  console.log(console.getHexString(hexNumber, length));  
}

/**
 * Log a 32-bit word as an 8 character hex string.
 *
 * @param word {int} The 32-bit word to print out as hex.
 */
console.logWord = function(word) {
  console.logHex(word, 8);
}

/**
 * Pretty-print an array of words.
 *
 * @param wordArray {array[int]} The array of words.
 * @param startIndex {int (optional)} The start index for printing.
 * @param modulus {int (optional)} The number of elements to print before a new line.
 * @param wordChunk {int (optional)} The number of elements to print before a word-spacer (new line)
 */
console.logWordArray = function(wordArray, startIndex, modulus, wordChunk) {
  var i, max, elements, str;

  if (!wordArray || !wordArray.length) {
    console.log('Word array is invalid.');
    return;
  }
  if (!startIndex) {
    startIndex = 0;
  }
  
  elements = 1;
  str = '';
  for (i = startIndex, max = wordArray.length; i < max; i++) {
    str += (console.getHexString(wordArray[i], 8) + '  ');
    if (modulus && (elements % modulus === 0)) {
      console.log(str);
      str = '';
    }
    if (wordChunk && (elements % wordChunk === 0)) {
      console.log('');
    }    
    elements++;
  }    
}