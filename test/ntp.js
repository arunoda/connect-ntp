var assert = require('assert');
var ntpMiddleware = require('../');
var connect = require('connect');
var http = require('http');

suite('ntp', function() {
  test('syncing date', function(done) {
    var app = connect();
    app.use(ntpMiddleware());
    app.listen(4949, function() {
      var req = http.request({
        hostname: 'localhost',
        port: 4949,
        path: '/_ntp/sync',
        method: 'POST',
        headers: {aa: 10}
      }, function(res) {
        assert.equal(res.statusCode, 200);
        res.setEncoding('utf8');

        res.on('data', function(data) {
          if(data == 'CONNECTED') {
            req.write('DATE_SYNC');
          } else {
            var serverTimestamp = parseInt(data);
            assert.ok((Date.now() - 500) < serverTimestamp);
            done();
          }
        });
      });

      req.setNoDelay(true);
      req.write('INIT');
    });
  });

  test('other requests', function(done) {
    var app = connect();
    app.use(ntpMiddleware());
    app.listen(4950, function() {
      var req = http.request({
        hostname: 'localhost',
        port: 4950,
        path: '/hello',
        method: 'POST',
        headers: {aa: 10}
      }, function(res) {
        assert.equal(res.statusCode, 404);
        done();
      });

      req.setNoDelay(true);
      req.write('INIT');
    });
  });

  test('invalid init', function(done) {
    var app = connect();
    app.use(ntpMiddleware());
    app.listen(4951, function() {
      var req = http.request({
        hostname: 'localhost',
        port: 4951,
        path: '/_ntp/sync',
        method: 'POST',
        headers: {aa: 10}
      }, function(res) {
        assert.equal(res.statusCode, 400);
        done();
      });

      req.setNoDelay(true);
      req.write('NOT_CORRECT_INIT_MESSAGE');
    });
  });

  test('date sync without init', function(done) {
    var app = connect();
    app.use(ntpMiddleware());
    app.listen(4952, function() {
      var req = http.request({
        hostname: 'localhost',
        port: 4952,
        path: '/_ntp/sync',
        method: 'POST'
      }, function(res) {
        assert.equal(res.statusCode, 400);
        done();
      });

      req.setNoDelay(true);
      req.write('DATE_SYNC');
    });
  });
});