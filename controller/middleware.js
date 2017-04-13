'use strict';

let NakedMath = require('../model/operations');
let prototype = Object.getPrototypeOf(NakedMath);
let methods   = Object.keys(prototype);
let request   = require('request');


let passError = (status, message, res) => {
  return res.json({status: status, message: message});
};


let validateGET = (req, res, next) => {

  let { operator, num1, num2} = req.params;

  if (!num1) return passError(400, 'Missing first number.', res);
  if (!num2) return passError(400, 'Missing second number.', res);
  if (typeof parseInt(num1) !== 'number') return passError(400, `${num1} is not a number.`, res);
  if (typeof parseInt(num2) !== 'number') return passError(400, `${num2} is not a number.`, res);
  if (!methods.includes(operator)) {
    return passError(400, `${operator.toUpperCase()} operator not recognized.`, res);
  }

  return next();
};


let validatePOST = (req, res, next) => {

  let { operator, num1 } = req.params;
  let codes = Object.keys(urlCodes);
  let name = operator;
  let symbol = num1;



  if (!name) return passError(400, 'New operation not named.', res)
  if (!symbol) return passError(400, 'No symbol specified.', res)
  if (!codes.includes(symbol)) {
    return passError(403, 'Invalid operator. "%", "^", "**", and "|" supported.', res)
  }

  return next()
};

let validateDELETE = (req, res, next) => {

  let { operator } = req.params;

  if (!operation) return passError(400, 'No operator specified.', res)
  if (methods.slice(0,3).includes(operation)) {
    return passError(403, `Not authorized to delete ${operation.toUpperCase()} operation.`, res);
  }
  if (!methods.includes(operation)) {
    return passError(400, `Cannot find ${operation.toUpperCase()} operation.`, res);
  }

  return next()
};

let validateExpression = (req, res, next) => {

  let { expression } = req.params;

  if (!expression) return passError(400, 'Missing expression.');
  if (typeof expression !== 'string') return passError(400, `${num1} is not a string.`, res);
  if (/[a-z]+/.exec(expression)) return passError(400, 'Must not contain leters.', res);

  let illegalChar = /([!@#$&=_`~{}:;"'<>,.?\s]+)/.exec(expression);
  if (illegalChar) return passError(400, `Operator ${illegalChar[0]} not supported.`, res);

  let illDoubles = /([+-/^%|]{2,})/.exec(expression);
  if (illDoubles) return passError(400, `Operator ${illDoubles[0]} not supported.`, res);

  let illTriples = /([*{3,}])/.exec(expression);
  if (illTriples) return passError(400, `Operator ${illTriples[0]} not supported.`, res);

  return next();
};

let urlCodes = {
    '%25': '%',
    '%5E': '^',
    '%2A%2A': '**',
    '%7C': '|'
  };


let findNext = (expression) => {

  const regex = {
    group      : /(\(.{4,}\))/,
    paren      : /\((-?\d+\.?\d*)\s*([-+\*/%^|])\s*(-?\d+\.?\d*)\)/,
    exponent    : /(-?\d+\.?\d*)\s*(\*{2})\s*(-?\d+\.?\d*)/,
    multiplier : /(-?\d+\.?\d*)\s*([\*/%])\s*(-?\d+\.?\d*)/,
    combiner   : /(-?\d+\.?\d*)\s*([-+])\s*(-?\d+\.?\d*)/,
    bitwiseXor : /(-?\d+\.?\d*)\s*([^])\s*(-?\d+\.?\d*)/,
    bitwiseOr  : /(-?\d+\.?\d*)\s*([|])\s*(-?\d+\.?\d*)/
  };

  let order = Object.keys(regex);
  let nextExp = expression;
  let isGroup = false;
  let operands = null;

  order.find((operation) => {

    let found = regex[operation].exec(expression);

    if (found) {
      let remainder = expression.replace(found[0], '');
      operands = [found[1], found[2], found[3]];

      if (operation === 'group') {
        nextExp = [found[1].slice(1, -1), true, remainder, operands];
      }

      else if (operation === 'paren') {
        nextExp = [found[0].slice(1, -1), isGroup, remainder, operands];
      }

      else {
        nextExp = [found[0], isGroup, remainder, operands]; // test with bitwise
      }
    }

    return Boolean(found);
  });

  return nextExp;
};

let fetch = (x, operator, y) => {

  const endpoint = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide'
  }

  let operation = endpoint[operator];

  try {
    x = parseInt(x);
    y = parseInt(y);
    response = NakedMath[operation](x, y);
    if (obj.error) return new Error(response);
    let value = obj.result.toString();
    return value;
  } catch (err) {
    return err;
  }
};


module.exports = {
  validateGET: validateGET,
  validatePOST: validatePOST,
  validateDELETE: validateDELETE,
  validateExpression: validateExpression,
  passError: passError,
  findNext: findNext,
  fetch: fetch,
  urlCodes: urlCodes
}