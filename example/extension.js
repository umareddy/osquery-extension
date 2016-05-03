ti = require("osquery-extension");

process.argv.forEach(function(val, index, array) {
  console.log(`${index}: ${val}`);
});

var opts = {};

opts.path = process.argv[2];

// Create a client object and connect to osquery server
// For registration purposes this extension is a client of osquery
// Once registered - it is ready to service requests - behaving now as a 
// server
var c = ti.createClient(opts);

var generateFoundersTable = function(req, resp) {
  console.log("generateFoundersTable called");
  var respArray = [];
  respArray.push({"lname":"Bond",    "fname":"James"});
  respArray.push({"lname":"Hunt",  "fname":"Ethan"});
  respArray.push({"lname":"Rambo",  "fname":"John"});
  resp(null, respArray);
}

// All INTEGERS, BIGINT must be represented as strings
// OSQuery converts these appropriately
var generateTestTable = function(req, resp) {
  console.log("generateTestTable called");
  var respArray = [];
  respArray.push({"foo":"foo", "bar":"bar", "test":"999"});
  respArray.push({"foo":"foo1", "bar":"bar1", "test":"998"});
  respArray.push({"foo":"foo2", "bar":"bar2", "test":"997"});
  resp(null, respArray);
}

// Register the plugins supported by this server
// Registering 2 tables
var plugin_config = {
  info: {
      name: 'LTTNG Table Extensions',
      version: '0.0.0'
  },
  plugins: 
  [
    {
      type: 'table',
      name: 'test_table_001',
      schema: 
      [
        {"name": "foo",       "type": "TEXT"},
        {"name": "bar",       "type": "TEXT"},
        {"name": "test",      "type": "INTEGER"}
      ],
      handler: generateTestTable
    },
    {
      type: 'table',
      name: 'HERO_FOUNDERS',
      schema: 
      [
        {"name": "lname",       "type": "TEXT"},
        {"name": "fname",     "type": "TEXT"}
      ],
      handler: generateFoundersTable
    }
  ]
};

ti.configureServer(c, plugin_config);
ti.registerAndProcess();

