var bodyParser     = require("body-parser"),
	request        = require('request'),
	express        = require("express"),
	app            = express();

var bitcoin_address = "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD";
var txn_hash = "b357ef869a27affd4442e57367396dc404b5757da117d8903ef196fd021b57bc"; 

	app.set("view engine", "ejs");
	app.use(express.static(__dirname + "/public"));

	app.get("/", function(req, res){
		res.render("landing");
	});

	app.get("/results", function(req, res){
		request('https://api.blockcypher.com/v1/btc/main/addrs/'+bitcoin_address+'/full', function (error, response, body) {
  			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  			//var result = JSON.parse(body);
			res.send(body); // txx 0 hash "136c395e49c64eebe07d4fd540bc31a331c0a608a3afa9d35702ee8d55afe920"
		});

		// request('https://blockchain.info/q/txfee' + txn_hash, function (error, response, body) {
  // 			console.log('error:', error); // Print the error if one occurred 
  // 			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
		// 	res.send(body); // Print the HTML for the Google homepage.
		// });

	});

var port = process.env.PORT || 4000;

app.listen(port, function(){
	console.log("BCard Server Open on 4000");
});

// <input type="file" accept="image/*;capture=camera">