'use strict';

let delayMessage = (msg, secs) => {
  return new Promise( (resolve, reject) => {

    setTimeout(() => resolve(msg), secs * 1000);

  });
};

let delayMessageTwice = async () => {

    let firstCall = await delayMessage('First message', 5);
    process.stdout.write(firstCall + '\n')

    let secondCall = await delayMessage('Second message', 2);
    process.stdout.write(secondCall + '\n')

}

module.exports = delayMessageTwice;