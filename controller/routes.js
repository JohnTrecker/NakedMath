"use strict";

let apiRouter = require('express').Router();
let api = require('./api');
let { validateGET, validatePOST, validateDELETE, validateExpression } = require('./middleware');


apiRouter.route('/')
  .get((req, res, next) => {
    api.getAllOperations(req, res, next);
  })
  .post((req, res, next) => {
    res.status(301).redirect('/:operation/:num1&:num2');
  })
  .delete((req, res, next) => {
    api.deleteAllOperations(req, res, next);
  });

// apiRouter.route('/evaluate/:expression')
//   .get((req, res, next) => {
//     validateExpression(req, res, next);
//     api.evaluate(req, res, next);
//   });

apiRouter.route('/:operator/:num1&:num2')
  .get((req, res, next) => {
    validateGET(req, res, next);
    api.getCalculations(req, res, next);
  })
  .post((req, res, next) => {
    validatePOST(req, res, next);
    api.createOperation(req, res, next);
  })
  .delete((req, res, next) => {
    validateDELETE(req, res, next);
    api.deleteOperation(req, res, next);
  })


module.exports = apiRouter;