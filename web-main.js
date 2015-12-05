
var ca;

var logFunction = (function(text) {
  var row = $('<div class="log-row">');
  row.text((new Date()) + ': ' + text);
  
  $('.output-section .result-log').append(row);
});


$(document).ready(function() {
  
  if (!ca || !ca.crypto || !ca.crypto.research) {
    throw new Error('Namespace is not yet defined. Check script imports!');
  }
  
  var shaAttack = ca.crypto.research.ShaAttack;
  if (!shaAttack.testShaImplementation()) {
    throw new Error('SHA-0 Implementation isn\'t correct. Please investigate.');
  }
  logFunction('Implementation initialized!');
  $('button.start-button').on('click', function() {
    var userInput = $('input[name="hash-count"]').val();
    if (!userInput || !userInput.trim()) {
      $('.error-output').text('Enter an input above!');
      return;
    }
    if (!parseInt(userInput)) {
      $('.error-output').text('Please enter only numeric values.');
      return;
    }
    var numRoundsInput = $('input[name="round-count"]').val();
    var numRounds = parseInt(numRoundsInput);
    if (!parseInt(numRoundsInput)) {
      numRounds = 80;
    }
    var precomputedMsgInput = $('input[name="precomputed-msg"]').val();
    var intInput = parseInt(userInput);
    $('.error-output').text('');
    var accept = window.confirm('This will suspend your browser during calculations.');
    if (accept) {
      shaAttack.doAttack(intInput, logFunction, numRounds, precomputedMsgInput);
    }
  });
});
