const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    suite('GET /api/stock-prices => stockData object', function() {
      let lastLikeNum = 0;
  
      test('1 stock', function(done) {
        chai
          .request(server)
          .get('/api/stock-prices')
          .query({ stock: 'grin' })
          .end(function(err, res) {
            if (err) console.log(err);
            lastLikeNum = res.body.stockData.likes;
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.equal(res.body.stockData.stock, 'GRIN');        
            done();
          });
      });
  
      test('1 stock with like', function(done) {
        chai
          .request(server)
          .get('/api/stock-prices')
          .query({ stock: 'grin', like: 'true' })
          .end(function(err, res) {
            if (err) console.log(err);          
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.equal(res.body.stockData.stock, 'GRIN');
            assert.isAbove(res.body.stockData.likes, lastLikeNum);        
            lastLikeNum = res.body.stockData.likes;
            done();
          });
      });
  
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai
          .request(server)
          .get('/api/stock-prices')
          .query({ stock: 'grin', like: 'true' })
          .end(function(err, res) {
            if (err) console.log(err);
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.equal(res.body.stockData.stock, 'GRIN');
            assert.equal(res.body.stockData.likes, lastLikeNum);
            done();
          });
      });
  
      test('2 stocks', function(done) {
        chai
          .request(server)
          .get('/api/stock-prices')
          .query({ stock: ['tnxp', 'siri'] })
          .end((err, res) => {
            if (err) console.log(err);          
            assert.equal(res.status, 200);          
            assert.equal(res.body.stockData.length, 2);          
            done();
          });
      });
  
      test('2 stocks with like', function(done) {
        chai
          .request(server)
          .get('/api/stock-prices')
          .query({ stock: ['tnxp', 'siri'], like: 'true' })
          .end((err, res) => {
            if (err) console.log(err);        
            assert.equal(res.status, 200);
            assert.equal(res.req.path.slice(-4), 'true');
            assert.equal(res.body.stockData.length, 2);
            done();        
            MongoClient.connect(CONNECTION_STRING, function(err, db) {
              if (err) throw err;
              console.log('Connected to db server from functional tests, removing TNXP, SIRI and GRIN');
              const stockDB = db.collection('myStocks');
              stockDB.deleteOne({ 'stockData.stock': 'TNXP' });
              stockDB.deleteOne({ 'stockData.stock': 'SIRI' });
              stockDB.deleteOne({ 'stockData.stock': 'GRIN' });
            });
          });
      });
    });
  });
