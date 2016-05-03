var osquery 	= require('osquery-extension');
var readline 	= require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.argv.forEach(function(val, index, array) {
  console.log(`${index}: ${val}`);
});

var opts = {};

opts.path = process.argv[2];

var os = osquery.createClient(opts);

rl.on("line", function(sql) {
	os.query(sql, function(err, resp) {
		if (err) {
			console.log("Error "+err);
		} else {
			console.log(resp);
		}
		rl.setPrompt("sql > ");
		rl.prompt();
	});
});

rl.on("close", function() {
	console.log("\nThankyou for using SQL");
	process.exit(0);
});

rl.setPrompt("sql > ");
rl.prompt();