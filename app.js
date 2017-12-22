var bodyParser = require("body-parser"),
	request = require('request'),
	express = require("express"),
	dateMath = require('date-arithmetic'),
	google = require('googleapis'),
	googleAuth = require('google-auth-library'),
	// readline = require('linebyline'),
  readline = require('readline'),	
	sheets = google.sheets('v4'),
	app = express(),
	fs = require('fs');
	var util = require('util');
	var isJSON = require('is-json');
	


const  bitcoin_address = "1DEP8i3QJCsomS4BSMY2RpU1upv62aGvhD";
const  SheetID = "1pkVumUUTEe22LuLIrTCb60QCgnWDncYQNrRJOua58TQ"; // googlesheet id
const  SheetName = "Sheet1";

var SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
var DataToSheet;
var OAuth2Client;
var Blocks;
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
	res.render("landing");
});

app.get("/blocks", function (req, res) {

	request.get('https://api.blockcypher.com/v1/btc/main', function (error, response, body) {
		console.log('error:', error); // Print the error if one occurred 
		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
		var ht = JSON.parse(body);
		var todaysHeight = parseInt(ht.height);
		// console.log(response);
		var ds = [];
		var de = [];
		var dates = req.query.datefilter;

		for (let i = 0; i < 3; ++i) {
			let a = dates.split("-")[i];
			ds.push(a);
		}

		for (let j = 3; j < 6; ++j) {
			let b = dates.split("-")[j];
			de.push(b);
		}

		var bitcoinStartDate = "2009-01-03";
		var dateStart = ds.join("-");
		var dateEnd = de.join("-");

		var diff1 = dateMath.diff(new Date(bitcoinStartDate), new Date(dateStart), 'day');
		var diff2 = dateMath.diff(new Date(dateStart), new Date(dateEnd), 'day');
		var blockStart = (diff1 * 152);
		var blockEnd = (diff1 * 152) + (diff2 * 152);
		var block = { blockStart, blockEnd, todaysHeight };
		Blocks = block;
		res.render("blocks", { block: block });
	});
});

app.get("/results", function (req, res) {
	var query = req.query.address;
	var after = req.query.bStart;
	var before = req.query.bEnd;
	request.get('https://api.blockcypher.com/v1/btc/main/addrs/' + query + '/full?before=' + before + '&after=' + after, function (error, response, bodys) {
		console.log('error:', error); // Print the error if one occurred 
		console.log('statusCode blockcypher:', response && response.statusCode); // Print the response status code if a response was received 
		var result = JSON.parse(bodys);
		DataToSheet = result;
		// Load client secrets from a local file.
		fs.readFile('client_secret.json', function processClientSecrets(err, content) {
			if (err) {
				console.log('Error loading client secret file: ' + err);
				return;
			}
			// Authorize a client with the loaded credentials, then call the
			// Google Sheets API.
			requestAuth(JSON.parse(content),function(authUrl){
				res.redirect(authUrl);
			})
		});
	});
});

app.get("/oauth2callback",function(req,res){
	var code = req.query.code;
	OAuth2Client.getToken(code, function(err, token) {
		if (err) {
			console.log('Error while trying to retrieve access token', err);
			res.send('Error while trying to retrieve access token');
		}
		OAuth2Client.credentials = token;
		addDataToSheet(OAuth2Client,function(err,addRes){
			if (err){
				console.log(err);
				return res.render("results", { block: Blocks,status:"fail", message:"Add data to Google Spread sheet Failed" +err.toString()});
			}
			else if (!err && addRes){
				res.render("results", { block: Blocks,status:"success", message:"Add data to Google Spread sheet Success! Check your sheet"});
			}
		})
	});
});

function createNewSheet(req,res){
	// addNewSheet(OAuth2Client,function(err,createRes){
	// 	if (err){
	// 		return res.send(err);
	// 	}
	// 	else if (!err && createRes){
	// 	}

	//  });
}
function requestAuth(credentials,callback){
	var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
	OAuth2Client = oauth2Client;
	var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
	});
	callback(authUrl);
}

function getDataFromSheet(auth,callback) {
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: SheetID,
    range: SheetName,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return callback(err,null);
		}
		console.log(response);
    var rows = response.values;
    if (rows.length == 0) {
			console.log('No data found.');
			return callback('No data found.',null);
    } else {
      console.log('Name, Major:');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
				console.log('%s, %s', row[0], row[4]);
			}
			callback(null,true);
    }
  });
}
function addNewSheet(auth,callback){
	
	var sheets = google.sheets('v4');
  sheets.spreadsheets.create({
    auth: auth,
    resource: {
        properties:{
            title: SheetName
        }
    }
  }, (err, response) => {
    if (err) {
			console.log('The API returned an error: ' + err);
			callback(err,null);
      return;
    } else {
			console.log("Added");
			callback(null,true);
    }
  });

}
function addDataToSheet(auth,callback){
	var sheets = google.sheets('v4');
	var rows = [];
	DataToSheet.txs.forEach(element => {
		var aRow = [];
		for(var attributename in element){
			if (util.isArray(element[attributename])){
				var arrayStr="";
				element[attributename].forEach(anItem =>{
					if (typeof anItem ==="string"){
						arrayStr+=anItem.toString()+'\n';
					}
					else{
						var nestJsonString = "";
						for (var attrName in anItem){
							nestJsonString+=attrName+":" + anItem[attrName] +"\n"; 
						}
						arrayStr+=nestJsonString+"\n";	
					}
				})
				aRow.push(arrayStr);
			}
			else {
				aRow.push(element[attributename]);
			}
		}
		rows.push(aRow);
	});
	sheets.spreadsheets.values.append({
    auth: auth,
    spreadsheetId: SheetID,
		range:SheetName,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: rows
    }
  }, function (err, response) {
    if (err) {
			console.log('The API returned an error: ' + err);
			return callback(err,null);
    } else {
       return callback(null,true);
    }
  });
}

var port = process.env.PORT || 4000;

app.listen(port, function () {
	console.log("Bitcoin txn getter Open on 4000");
});

