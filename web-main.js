/* global console, $, document, window */
/**
 *  COMP 4140 - RESESARCH PROJECT
 *  Analyzing Vulnerabilities in SHA-0
 *
 *  @for COMP 4140 - Research Project
 *  @author Tim Sands
 *  @author Nathan Jewsbury
 *  @date December 4 2015
 */
var ca;

var logFunction = function(text) {
  'use strict';
  // The DOM won't update until the script is finished.
  console.log(text);
  var row = $('<div class="log-row">');
  row.text(new Date() + ': ' + text);

  $('.output-section .result-log').append(row);
};

/* eslint no-alert: 0 */
$(document).ready(function() {
  'use strict';
  if (!ca || !ca.crypto || !ca.crypto.research) {
    throw new Error('Namespace is not yet defined. Check script imports!');
  }

  var shaAttack = ca.crypto.research.ShaAttack;
  if (!shaAttack.testShaImplementation()) {
    throw new Error('SHA-0 Implementation isn\'t correct. Please investigate.');
  }
  logFunction('Implementation initialized!');
  $('button.start-button').on('click', function() {
    var userInput = $('input[name="hash-count"]').val(),
        precomputedMsgInput,
        numRoundsInput,
        numRounds,
        intInput,
        accept;
    if (!userInput || !userInput.trim()) {
      $('.error-output').text('Enter an input above!');
      return;
    }
    if (!parseInt(userInput)) {
      $('.error-output').text('Please enter only numeric values.');
      return;
    }
    numRoundsInput = $('input[name="round-count"]').val();
    numRounds = parseInt(numRoundsInput);
    if (!parseInt(numRoundsInput)) {
      numRounds = 80;
    }
    precomputedMsgInput = $('input[name="precomputed-msg"]').val();
    intInput = parseInt(userInput);
    $('.error-output').text('');
    accept = window.confirm('This will suspend your browser during calculations.');
    if (accept) {
      shaAttack.doAttack(intInput, logFunction, numRounds, precomputedMsgInput);
    }
  });
});
