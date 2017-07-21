global.fetch       = require('node-fetch');
const cc           = require('cryptocompare');

var bodyParser     = require("body-parser"),
	request        = require('request'),
	express        = require("express"),
	dateMath       = require('date-arithmetic'),
	google         = require('googleapis'),
	googleAuth     = require('google-auth-library'),
	sheets         = google.sheets('v4'),
	app            = express();

	app.set("view engine", "ejs");
	app.use(express.static(__dirname + "/public"));

	app.get("/", function(req, res){
		res.render("landing");
	});

	app.get("/blocks", function(req, res){
		var todaysHeight=0;
	

		request.get('https://api.blockcypher.com/v1/btc/main', function (error, response, body){
			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  			var ht = JSON.parse(body);
  			todaysHeight = parseInt(ht.height);
  			console.log(todaysHeight);
  		
		var ds    = [];
		var de    = [];
		var dates = req.query.datefilter;

		for(let i = 0; i<3; ++i){
			let a = dates.split("-")[i];
			ds.push(a);
			console.log(ds);
		}
		
		for(let j = 3; j<6; ++j){
			let b = dates.split("-")[j];
			de.push(b);
			console.log(de);
		} 
		
		var bitcoinStartDate = "2009-01-03";
		var dateStart = ds.join("-");
		var dateEnd = de.join("-");
		var today = "2017-07-20";
		console.log(dateEnd);


        var diff1= dateMath.diff(new Date(bitcoinStartDate), new Date(dateStart), 'day');
        console.log(diff1);

        var diff2= dateMath.diff(new Date(dateStart), new Date(dateEnd), 'day');
        console.log(diff2);

        var blockStart = (diff1*152);
        var blockEnd = (diff1*152)+(diff2*152);

        var block = {blockStart, blockEnd, todaysHeight};

        console.log(blockStart);
        console.log(blockEnd);

        res.render("blocks", {block:block});	
	}); });

	app.get("/results", function(req, res){
		var query = req.query.address;
		var after = req.query.bStart;
		var before = req.query.bEnd;

		var bitcoin_address  = "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD";
		var txn_hash         = "b357ef869a27affd4442e57367396dc404b5757da117d8903ef196fd021b57bc"; 
		var API_KEY          = "AIzaSyDwhdFAW_f1VHg5YXkTYWGD1rhNleI_w1w"; //google api key.
		var SheetID          = "1oBT2mAVAcgYZxcmyquWaXRJOJ44AfKNgVlBHUeYcCWM"; // googlesheet id
		var clientId	     = "376499115622-6ehsujrfbpo2jgmkr0j9o1i689qkhso9.apps.googleusercontent.com";
		var clientSecret    = "2qQSz49seGmE7ApEAufN9w1D";
		var values = {
  						"auth":"AIzaSyDwhdFAW_f1VHg5YXkTYWGD1rhNleI_w1w",
  						"range": "Sheet1!A1:D1",
  						"majorDimension": "ROWS",
  						"values": [
   						["Item", "Cost", "Stocked", "Ship Date"],
    					["Wheel", "$20.50", "4", "3/1/2016"],
    					["Door", "$15", "2", "3/15/2016"],
    					["Engine", "$100", "1", "30/20/2016"],
    					["Totals", "=SUM(B2:B4)", "=SUM(C2:C4)", "=MAX(D2:D4)"]
  						],
  						
					};

		var auth = new googleAuth();
  		var oauth2Client = new auth.OAuth2(clientId, clientSecret);

		
		request.get('https://api.blockcypher.com/v1/btc/main/addrs/'+query+'/full?before='+before+'&after='+after, function (error, response, body) {
  			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  			var result = JSON.parse(body);
			//res.send(result); // tx 0 hash "136c395e49c64eebe07d4fd540bc31a331c0a608a3afa9d35702ee8d55afe920"

		//request.post('https://sheets.googleapis.com/v4/spreadsheets/'+SheetID+'/'+values+'/'+range+'&includeValuesInResponse=false&insertDataOption=INSERT_ROWS&responseDateTimeRenderOption=SERIAL_NUMBER&responseValueRenderOption=FORMATTED_VALUE&valueInputOption=USER_ENTERED&key='+API_KEY, function (error, response, body) {
		request.post('https://sheets.googleapis.com/v4/spreadsheets/1oBT2mAVAcgYZxcmyquWaXRJOJ44AfKNgVlBHUeYcCWM/values/Sheet1!A1:D1:append?valueInputOption=RAW'+values, function (error, response, body) {
  			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  			
  			//var result = JSON.parse(body);
			//res.send(body); // tx 0 hash "136c395e49c64eebe07d4fd540bc31a331c0a608a3afa9d35702ee8d55afe920"


		}); 
	});

		//request('https://min-api.cryptocompare.com/data/pricehistorical?fsym=BTC&tsyms=USD,EUR&ts=1452680400&extraParams=your_app_name') price chart
		//AIzaSyBq8pdBvq3A0E8ANDFFZg54bdZWcV7qz4Q //google api key.
		
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