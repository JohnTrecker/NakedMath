'use strict';

// Abstracts reusable logic, handles edge cases, not exposed to API
module.exports = (cb, numbers) => {
  return numbers
    .filter((num) => onlyNumbers(num))
    .reduce((result, number) => result = cb(number, result));
};

const onlyNumbers = (element) => {
  return (typeof element === 'number' && !isNaN(element)) === true;
}
