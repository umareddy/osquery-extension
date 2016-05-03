var thrift 				     = require('thrift');
var ExtensionManager 	 = require('./gen-nodejs/ExtensionManager.js');
var Types            	 = require('./gen-nodejs/osquery_types.js');
var Extension          = require('./gen-nodejs/Extension.js');

// Server Object - holds all data about server
var Server = {};

// CLIENT Code
function Client(opts) {
  opts = opts || {};
  var path = opts.path || '/var/osquery/osquery.em';
  // This createConnection looks funny, for a INTERNET_DOMAIN socketit takes host and port, 
  // for UNIX domain socket - the underlying net.createConnection takes a path as
  // input. This thrift.createConnection calls net.createConnections(path,0)
  // 
  var conn = thrift.createConnection(0, path);
  this.extManager = thrift.createClient(ExtensionManager, conn);
  this.socketPath = path;
}

Client.prototype.query = function(sql, cb) {
  this.extManager.query(sql, cb);
};

module.exports.createClient = function(opts) { 
  return new Client(opts); 
};

// SERVER Code

var OK_STATUS = new Types.ExtensionStatus({ code: 0, message: 'OK' });

module.exports.configureServer = function (client, opts) {
  Server.plugins = opts.plugins || [];
  Server.info    = new Types.InternalExtensionInfo(opts.info || {});
  Server.clientSocketPath = client.socketPath;
  Server.extManager = client.extManager;
  Server.registry = {};
  Server.handlers = {};
  Server.plugins.forEach(function(p) {
      if (!Server.registry[p.type]) {
        Server.registry[p.type] = {};
      }
      if (p.type === 'table') {
        Server.registry[p.type][p.name] = p.schema;
      }
      Server.handlers[p.type + '_' + p.name] = p.handler;
    });
}

var callDispatcher = function(registry, item, request, result) {
  var handler = Server.handlers[registry + '_' + item];
  var resp;

  var respondWithError = function(err) {
    result(null, new Types.ExtensionResponse({
      status: new Types.ExtensionStatus({ code: -1, message: err.message })
    }));
  };

  if ( (request.action != 'generate') && (request.action != 'columns') ) {
    var error = {};
    error.message = "Unsupported Action ["+request.action+"] requested";
    // console.log(error.message);
    return(respondWithError(error));
  }

  try {
    if (request.action == 'generate') {
      handler(request, function(err, data) {
        if (err) {
          // console.log("Error = "+err);
          return respondWithError(err);
        }
        // console.log(data);
        result(null, new Types.ExtensionResponse({
          status: OK_STATUS,
          response: data
        }));
      });
    } else if (request.action == 'columns') {
      // Don't understand how this works
      // Respond back with error to prevent osqueryi crash
      var error = {};
      error.message = "Unsupported Action ["+request.action+"] requested";
      console.log(error.message);
      return(respondWithError(error));

      // var sArray = [];
      // sArray.push({"tag":"value"});
      // result(null, new Types.ExtensionResponse({
      //     status: OK_STATUS,
      //     response: sArray
      // }));

    } else {
      console.log("We have a problem");
    }
  } catch(e) {
      respondWithError(e);
  }
};

module.exports.registerAndProcess = function(cb) {
  if (!cb) {
      cb = function(err) {
        if (err) throw err;
      };
  }
  
  Server.extManager.registerExtension(Server.info, Server.registry, function(err, resp) {
    // console.log("Extension registered");
    if (err) {
       return cb(err);
    } else {
        Server.worker = thrift.createServer(Extension, {
        ping: function(result) {
        result(null, OK_STATUS);
        },
        call: callDispatcher
        }, {transport: thrift.TBufferedTransport});

        var socketPath = Server.clientSocketPath + '.' + resp.uuid.toString();
        Server.worker.listen(socketPath, function(err) {
          if (err) {
            return cb(err);
          }
          cb (null, Server.worker);
        });
    }
  });
}
