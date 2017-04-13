'use strict';

let NakedMath = require('../model/operations');
let passError = require('./middleware').passError;
let lib = require('./middleware');
let prototype = Object.getPrototypeOf(NakedMath);
let methods   = Object.keys(prototype);

let getAllOperations = (req, res, next) => {
  let message = 'Welcome to NakedMath API! Try out any of the following NakedMath operations: ';
  methods.forEach((method) => message = message.concat(`${method}, `));
  let newMessage = message.slice(0, -1).concat('.');
  return res.status(200).json({message: newMessage});
};

let getCalculations = (req, res, next) => {
  let { operator, num1, num2 } = req.params;
  let result = NakedMath[operator](parseInt(num1), parseInt(num2));
  return res.status(200).json({result: result, status: res.status});
};

let createOperation = (req, res, next) => {
  let { operator, num1 } = req.params;
  let name = num1
  operator = lib.urlCodes[operator];
  NakedMath.newOperation(name, operator);
  return res.status(201).json({message: `${name} method created!`, status: res.status});
};

let deleteOperation = (req, res, next) => {
  let { operator } = req.params;
  NakedMath.deleteOperation(operation);
  return res.status(202).json({message: `${operation} deleted!`, status: res.status});
};

let deleteAllOperations = (req, res, next) => {
  return passError(403, 'Not authorized to erase all operations.', res)
};

// Extracting order of operations on the fly from Node process would be most efficient;
// finding an appropriate 3rd party module would have saved time, but neither strategy
// proved executable. So I wrote my own sorting algorithm.
// It identifies simple expressions, evaluates them in the order of operations,
// and recomposes the expression recursively, returning the final evaluation of
// a simple expression, e.g. `((5+3)/2-1)*7` => `(8/2-1)*7` => ... => `3*7` // 21

let evaluate = (req, res, next, recursing) => {
  let exp = req.params === undefined ? req : req.params.expression; // for recursive case
  recursing = recursing || false;

  let subexpression = lib.findNext(exp);
  let newSub;
  let [sub, isGroup, remainder, operands] = subexpression;

  if (isGroup) {
    newSub = evaluate(sub, res, next, true);
    let newExpression = newSub.concat(remainder)
    return evaluate(newExpression, res, next, false);
  }

  let [ num1, operator, num2 ] = operands
  newSub = lib.fetch(num1, operator, num2);

  if (newSub.Error) return next(newSub);

  if (!remainder) {
    if (recursing) return newSub;
    return res.json({result: newSub});
  }

  let newExpression = newSub.concat(remainder)
  return evaluate(newExpression, res, next, recursing);

};

module.exports = {
  getAllOperations: getAllOperations,
  getCalculations: getCalculations,
  createOperation: createOperation,
  deleteOperation: deleteOperation,
  deleteAllOperations: deleteAllOperations,
  evaluate: evaluate
}