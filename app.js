global.fetch       = require('node-fetch');
const cc           = require('cryptocompare');

var bodyParser     = require("body-parser"),
	request        = require('request'),
	express        = require("express"),
	dateMath       = require('date-arithmetic'),
	google         = require('googleapis'),
	googleAuth     = require('google-auth-library'),
	readline       = require('linebyline'),
	sheets         = google.sheets('v4'),
	app            = express(),
	fs             = require('fs');



	app.set("view engine", "ejs");
	app.use(express.static(__dirname + "/public"));

	app.get("/", function(req, res){
		res.render("landing");
	});

	app.get("/blocks", function(req, res){

		request.get('https://api.blockcypher.com/v1/btc/main', function (error, response, body){
			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
  			var ht = JSON.parse(body);
  			var todaysHeight = parseInt(ht.height);

			var ds    = [];
			var de    = [];
			var dates = req.query.datefilter;

			for(let i = 0; i<3; ++i){
				let a = dates.split("-")[i];
				ds.push(a);
			}
			
			for(let j = 3; j<6; ++j){
				let b = dates.split("-")[j];
				de.push(b);
			} 
			
			var bitcoinStartDate = "2009-01-03";
			var dateStart = ds.join("-");
			var dateEnd = de.join("-");
		
	        var diff1= dateMath.diff(new Date(bitcoinStartDate), new Date(dateStart), 'day');
	        var diff2= dateMath.diff(new Date(dateStart), new Date(dateEnd), 'day');
	        var blockStart = (diff1*152);
	        var blockEnd = (diff1*152)+(diff2*152);
	        var block = {blockStart, blockEnd, todaysHeight};

	        console.log(blockStart);
	        console.log(blockEnd);

	        res.render("blocks", {block:block});	
		}); 
	});

	app.get("/results", function(req, res){
		var query = req.query.address;
		var after = req.query.bStart;
		var before = req.query.bEnd;
		
		var authUrl;
		var code = '1234';
		var bitcoin_address  = "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD";
		var SheetID          = "1oBT2mAVAcgYZxcmyquWaXRJOJ44AfKNgVlBHUeYcCWM"; // googlesheet id

		request.get('https://api.blockcypher.com/v1/btc/main/addrs/'+query+'/full?before='+before+'&after='+after, function (error, response, bodys) {
  			console.log('error:', error); // Print the error if one occurred 
  			console.log('statusCode blockcypher:', response && response.statusCode); // Print the response status code if a response was received 
  			var result = JSON.parse(bodys);
			//var fees = result.txs[0].fees;
			//var txnDate = result.txs[0].confirmed;
			//res.send(result);
			//console.log(fees);
			//console.log(txnDate);
		});

		

					var projectDirectory = "D:/Projects/Bitcoin_Txn"; 
					var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
					var TOKEN_DIR = 'D:/Projects/Bitcoin_Txn/credentials/';
					var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-client_secret.json';

					// Load client secrets from a local file.
					fs.readFile('client_secret.json', function processClientSecrets(err, content) {
					  if (err) {
					    console.log('Error loading client secret file: ' + err);
					    return;
					  }
					  // Authorize a client with the loaded credentials, then call the
					  // Google Sheets API.
					  authorize(JSON.parse(content), listMajors);
					});

					function authorize(credentials, callback) {
					  var clientSecret = credentials.web.client_secret;
					  var clientId = credentials.web.client_id;
					  var redirectUrl = credentials.web.redirect_uris[0];
					  var auth = new googleAuth();
					  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

					  // Check if we have previously stored a token.
					  fs.readFile(TOKEN_PATH, function(err, token) {
					    if (err) {
					      getNewToken(oauth2Client, callback);
					    } else {
					      oauth2Client.credentials = JSON.parse(token);
					      callback(oauth2Client);
					    }
					  });
					}

					function getNewToken(oauth2Client, callback) {
					  		authUrl = oauth2Client.generateAuthUrl({
					    	access_type: 'offline',
					    	scope: SCOPES


					  	});

					  	
					  	//request.get(authUrl, function (error, response, body) {
							//var code = JSON.parse(response);
							//console.log(response);
							//var sPageURL = window.location.search.substring(1);
						//});

						console.log(authUrl);
						console.log(code);

					    oauth2Client.getToken(code, function(err, token) {
					      if (err) {
					        console.log('Error while trying to retrieve access token', err);
					        return;
					      } else {
					      		oauth2Client.setCredentials(token);

					    //   		oauth2Client.setCredentials({
  							// 	access_token: 'ACCESS TOKEN HERE',
  							// 	refresh_token: 'REFRESH TOKEN HERE'
  							// 	// Optional, provide an expiry_date (milliseconds since the Unix Epoch)
 								// // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
					      }
					      //oauth2Client.credentials = token;
					      storeToken(token);
					      callback(oauth2Client);
					    });
					
					}
					
					function storeToken(token) {
					  try {
					    fs.mkdirSync(TOKEN_DIR);
					  } catch (err) {
					    if (err.code != 'EEXIST') {
					      throw err;
					    }
					  }
					  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
					  console.log('Token stored to ' + TOKEN_PATH);
					}

					function listMajors(auth) {

					var values = [
  							[
    							2123, 66666  // Cell values ...
  							],
  									// Additional rows ...
					];
					
					var body = {
  									values: values
								};
		
					  sheets.spreadsheets.values.append({auth: auth, spreadsheetId:"1oBT2mAVAcgYZxcmyquWaXRJOJ44AfKNgVlBHUeYcCWM", range:"Sheet1!A1:D1", valueInputOption:"RAW", insertDataOption:"INSERT_ROWS", resource:body}, function(err, response) {
					    if (err) {
					      console.log('The API returned an error: ' + err);
					      return;  
					    } else {
					    	console.log('statusCode Google sheets:', response && response.statusCode);
					    }
					  });
					}
	
		// Basic Usage: 
		cc.priceHistorical('BTC', ['USD', 'EUR'], new Date('2017-07-01')) //run in foreach in middleware
			.then(prices => {
  		//console.log(prices)
  		 //-> { BTC: { USD: 997, EUR: 948.17 } } 
		})
		.catch(console.error)

	res.render("results");
});


var port = process.env.PORT || 4000;

app.listen(port, function(){
	console.log("Bitcoin txn getter Open on 4000");
});

