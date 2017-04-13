'use strict';

let operations = require('./lib');

// Methods defined on class for organization and better API exposure for CRUD operations.
let NakedMath = function() {
  this.description = 'A programmable calculator';
}

// Readability prioritized over brevity
NakedMath.prototype.add = (...numbers) => {
  let sum = operations((x, y) => x + y, numbers);
  return sum
};

NakedMath.prototype.subtract = (...numbers) => {
  let difference = operations((x, y) => x - y, numbers);
  return difference;
}

// `multiply` for consistency instead of `multiple` as in instructions
NakedMath.prototype.multiply = (...numbers) => {
  let product = operations((x, y) => x * y, numbers);
  return product;
}

NakedMath.prototype.divide = (...numbers) => {
  let quotient = operations((x, y) => y / x, numbers);
  return quotient;
}

NakedMath.prototype.newOperation = (name, operator) => {
  NakedMath.prototype[name] = (...numbers) => {
    let syntax = num[0] + operator + num[1];
    return operations((x, y) => eval(syntax), numbers);
  }
}

module.exports = new NakedMath();