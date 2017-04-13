'use strict';

let request   = require('request');

const domain;
if (process.env.NODE_ENV === 'production') domain = 'https://nakedmath.party'
else domain = 'http://localhost:3000'
// Extracting order of operations on the fly within a Node process would have been
// ideal for this sort of problem. But since that's a difficult task and
// appropriate 3rd party modules aren't availabe, I wrote my own algorithm to interact
// with my NakedMath server.

// `evaluate` identifies simple expressions, sorts according to the order of operations,
// and recomposes the expression recursively, fetching one atomoc operation at
// a time from API until it yields a single number:
// `((5+3)/2-1)*7` => `(8/2-1)*7` => ... => `-3*7` // -21


let evaluate = async (exp, recursing) => {

  recursing = recursing || false;

  let subexpression = findNext(exp);
  let [sub, isGroup, remainder, operands] = subexpression;

  if (isGroup) {

    let newSub = await evaluate(sub, true).catch((err) => err);

    let newExpression = newSub.toString().concat(remainder)
    return evaluate(newExpression, false).catch((err) => err);

  }

  let [ num1, operator, num2 ] = operands
  let obj = await fetch(num1, operator, num2);

  if (obj.Error) {
    console.log('Error fetching ', obj);
    return obj;
  }

  let { integer, responseTime } = obj;
  if (!remainder) {
    if (recursing) return integer;
    else {
      return {integer: integer, responseTime: responseTime}
    }
  }


  let newExpression = integer.toString().concat(remainder)
  return evaluate(newExpression, recursing).catch((err) => err);

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

let GET = (url) => {
  return new Promise((resolve, reject) => {

    request(url, (error, response, body) => {

      if (error) {
        console.log('Error in GET: ', error);
        return reject(error);
      }

      try {

        let obj = JSON.parse(body)
        if (!obj.result) return reject(new Error('Error parsing fetched body in GET'));
        return resolve({integer: obj.result, responseTime: response.headers['x-response-time']});

      } catch(err) { return reject(err); }

    })
  })
}

let fetch = async (x, operator, y) => {

  const endpoint = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide'
  }

  let url = `${domain}/${endpoint[operator]}/${x}&${y}`;
  let response

  try {


    response = await GET(url);
    if (response.error) {
      console.log('Error fetching from API: ', response);
      return response;
    }

    return response;

  } catch(err) { return err; }


};

evaluate('((5+3)/2-1)*7');


module.exports = evaluate;