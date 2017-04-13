
var delayMessageTwice = require('./nodeChallenge.js');
var sinonChai = require('sinon-chai');
var evaluate = require('./lib');
var request = require('request');
var sinon = require('sinon');
var chai = require('chai');

var expect = chai.expect;
chai.use(sinonChai);

const domain;
if (process.env.NODE_ENV === 'production') domain = 'https://nakedmath.party'
else domain = 'http://localhost:3000'

describe('Node Challenge', function() {
  describe('function delayMessage', function() {
  this.slow(4900);

    var clock;

    afterEach(function() {
      if (console.log.restore) console.log.restore()
      if (clock.restore) clock.restore()
    })

    it('should not log anything to the console before 5 seconds', function(done) {
      clock = sinon.useFakeTimers();
      sinon.spy(console, 'log');

      setTimeout(done, 4999);
      delayMessageTwice();
      clock.tick(4999)

      expect(console.log.calledOnce).to.equal(false);
    })

    it('should log first and second message to the console after 7 seconds', function(done) {
      delayMessageTwice()
      setTimeout(function(){
        done();
      }, 7010);
    });

  })
});

describe('Express Challenge', function() {
  describe('NakedMath is a REST API', function() {
  this.slow(20)

    it('should GET simple arithmetic calculations', function() {
      request.get(`${domain}/add/40&40`, function(error, response, body) {
        if (!error) {
          // let parsedBody = JSON.parse(body);
          // expect(parsedBody).to.be.an('object');
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          // expect(parsedBody.result).to.equal(80);
          // expect(parsedBody.status).to.equal(200);
          expect(error).to.be.null;
        }

      });

      request.get(`${domain}/divide/-49&7`, function(error, response, body) {
        if (!error) {
          // let parsedBody = JSON.parse(body);
          // expect(parsedBody).to.be.an('object');
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          // expect(parsedBody.result).to.equal(-7);
          // expect(parsedBody.status).to.equal(200);
          expect(error).to.be.null;
          // process.stdout.write(`\nGET http://NakedMath.party ${parsedBody.status}: ${parsedBody.result}  ${response.headers['x-response-time']}`);
        }

      })
    });

    it.skip('should POST new arithmetic operations', function() {
      request.post(`${domain}/exponentiate/^`, function(error, response, body) {
        if (!error) {
          // let parsedBody = JSON.parse(body);
          // expect(parsedBody).to.be.an('object');
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          // expect(parsedBody.message).to.exist;
          // expect(parsedBody.status).to.equal(201);
          expect(error).to.be.null;
        }

      })
    });

    it.skip('should DELETE client generated operations', function() {
      request.delete(`${domain}/exponentiate/^`, function(error, response, body) {
        if (!error) {
          // let parsedBody = JSON.parse(body);
          // expect(parsedBody).to.be.an('object');
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          // expect(parsedBody.message).to.exist;
          // expect(parsedBody.status).to.equal(202);
          expect(error).to.be.null;
        }

      })
    });

    it.skip('should not DELETE non-client generated operations', function() {
      request.delete(`${domain}/subtract`, function(error, response, body) {
        if (!error) {
          // let parsedBody = JSON.parse(body);
          // expect(parsedBody).to.be.an('object');
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          // expect(parsedBody.message).to.exist;
          // expect(parsedBody.status).to.equal(403);
          expect(error).to.be.null;
        }

      });
    });

    it('should not DELETE all operations at once', function() {
      request.delete(`${domain}/`, function(error, response, body) {
        if (!error) {
          // let parsedBody = JSON.parse(body);
          // expect(parsedBody).to.be.an('object');
          expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
          // expect(parsedBody.message).to.exist;
          // expect(parsedBody.status).to.equal(403);
          expect(error).to.be.null;
        }

      });
    });

  });

  describe('NakedMath API handles complex expressions', function() {

    it('should return -21 from ((5+3)/2-1)*7', async function() {
      let result = await evaluate('((5+3)/2-1)*7);
      expect(typeof result).to.equal('object');
      expect(result.integer).to.equal(-21);
      expect(typeof result.responseTime).to.equal('string');
      process.stdout.write(`result: ${result.integer}\nresponse time: ${result.responseTime}\n`);
    });

    it('should calculate other complex expressions, async function() {
      let result = await evaluate('-6*2/4+7');
      expect(typeof result).to.equal('object');
      expect(result.integer).to.equal(4);
      expect(typeof result.responseTime).to.equal('string');
    });

  });

})