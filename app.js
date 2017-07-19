global.fetch = require('node-fetch');
const cc = require('cryptocompare');

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
		var query = req.query.address;
		var after = req.query.blockStart;
		var before = req.query.blockEnd;
		
		request('https://api.blockcypher.com/v1/btc/main/addrs/'+query+'/full?before='+before+'&after='+after, function (error, response, body) {
  			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  			//var result = JSON.parse(body);
			res.send(body); // tx 0 hash "136c395e49c64eebe07d4fd540bc31a331c0a608a3afa9d35702ee8d55afe920"
		});

		//request('https://min-api.cryptocompare.com/data/pricehistorical?fsym=BTC&tsyms=USD,EUR&ts=1452680400&extraParams=your_app_name') price chart

		// Basic Usage: 
		cc.priceHistorical('BTC', ['USD', 'EUR'], new Date('2017-07-01')) //run in foreach in middleware
			.then(prices => {
  		console.log(prices)
  		// -> { BTC: { USD: 997, EUR: 948.17 } } 
		})
		.catch(console.error)
	});

var port = process.env.PORT || 4000;

app.listen(port, function(){
	console.log("Bitcoin txn getter Open on 4000");
});

// <input type="file" accept="image/*;capture=camera">