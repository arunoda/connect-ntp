// very simple ntp implementation
// Protocol
// => INIT
// <= CONNECTED
// => DATE_SYNC //used as the begin time of the request
// <= <timestamp> //used as the server time value

module.exports = function() {
  return function ntpMiddleware(req, res, next) {
    var inited = false;

    if(req.method == 'POST' && req.url == '/_ntp/sync') {
      req.on('data', onData);
      req.once('end', cleanup);
      req.socket.setNoDelay(true);
    } else {
      next();
    }

    function onData(data) {
      data = data.toString();

      if(data == 'INIT') {
        res.write('CONNECTED');
        inited = true;
      } else if(data == 'DATE_SYNC') {
        if(!inited) {
          res.writeHead(400);
          res.end('');
        } else {
          res.end('' + Date.now());
        }
        cleanup();
      } else {
        console.warn('unsupported NTP request:', data);
        res.writeHead(400);
        res.end();
        cleanup();
      }
    }

    function cleanup() {
      req.removeListener('data', onData);
      req.removeListener('end', cleanup);
    }
  }
};