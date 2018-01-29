// Implement modulo without using the (%) operator.
const modulo = (a, b) => {
  // NOTE Should work even if a and b aren't numbers, returns NaN
  // NOTE Assuming we are doing a % b, not b % a
  return a - b * Math.floor(a / b);
};

// Take an input string and determine if exactly 3 question marks
// exist between every pair of numbers that add up to 10.
// If so, return true, otherwise return false.
const question_mark = (s) => {
  for (var i = 0; i < str.length; i++) {
    if (!isNaN(str.charAt(i))) {
      for (var j = i + 1; j < str.length; j++) {
        if (!isNaN(str.charAt(j))) {
          if (Number(str.charAt(i)) + Number(str.charAt(j)) === 10) {
            let qCount = 0;
            for (var k = i + 1; k < j; k++) {
              if (str.charAt(k) === '?') {
                qCount++;
              }
            }
            if (qCount !== 3) {
              return false;
            }
          }
          break;
        }
      }
    }
  }
  return true;
};
