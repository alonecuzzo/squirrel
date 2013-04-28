var OAuth = require('oauth').OAuth,
    Evernote = require('evernote').Evernote,
    DynectEmailNode = require('dynectemail/lib/dynectemail/index').DynectEmailNode,
    Jade = require('jade'),
    FS = require('fs');


var config = require('../config.json');
var base_url = config.SANDBOX ? 'https://sandbox.evernote.com' : 'https://www.evernote.com';
var request_token_path = "/oauth";
var access_token_path = "/oauth";
var authorize_path = "/OAuth.action";

// home page
exports.index = function(req, res) {
  if(req.session.oauth_access_token) {
    var token = req.session.oauth_access_token;
    var transport = new Evernote.Thrift.NodeBinaryHttpTransport(req.session.edam_noteStoreUrl);
    var protocol = new Evernote.Thrift.BinaryProtocol(transport);
    var note_store = new Evernote.NoteStoreClient(protocol);
    note_store.listNotebooks(token, function(notebooks){
      req.session.notebooks = notebooks;
      res.render('index');
    });
  } else {
    res.render('index');
  }
};

// OAuth
exports.oauth = function(req, res) {

  var oauth = new OAuth(base_url + request_token_path,
      base_url + access_token_path,
      config.API_CONSUMER_KEY,
      config.API_CONSUMER_SECRET,
      "1.0",
      "http://localhost:3000/oauth_callback",
      "HMAC-SHA1");

  oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if(error) {
      console.log('error');
      console.log(error);
    }
    else { 
      // store the tokens in the session
      req.session.oauth = oauth;
      req.session.oauth_token = oauth_token;
      req.session.oauth_token_secret = oauth_token_secret;

      // redirect the user to authorize the token
      res.redirect(base_url + authorize_path + "?oauth_token=" + oauth_token);
    }
  });

};

// OAuth callback
exports.oauth_callback = function(req, res) {
  var oauth = new OAuth(req.session.oauth._requestUrl,
      req.session.oauth._accessUrl,
      req.session.oauth._consumerKey,
      req.session.oauth._consumerSecret,
      req.session.oauth._version,
      req.session.oauth._authorize_callback,
      req.session.oauth._signatureMethod);

  oauth.getOAuthAccessToken(
      req.session.oauth_token, 
      req.session.oauth_token_secret, 
      req.param('oauth_verifier'), 
      function(error, oauth_access_token, oauth_access_token_secret, results) {
        if(error) {
          console.log('error');
          console.log(error);
          res.redirect('/');
        } else {
          // store the access token in the session
          req.session.oauth_access_token = oauth_access_token;
          req.session.oauth_access_token_secret = oauth_access_token_secret;
          req.session.edam_shard = results.edam_shard;
          req.session.edam_userId = results.edam_userId;
          req.session.edam_expires = results.edam_expires;
          req.session.edam_noteStoreUrl = results.edam_noteStoreUrl;
          req.session.edam_webApiUrlPrefix = results.edam_webApiUrlPrefix;
          res.redirect('/');
        }
      });
};

var path = "views/newsletter.jade",
    template = FS.readFileSync(path, "utf8"),
    options = { filename: path },
    fn = Jade.compile(template, options),
    html = fn();
    console.log(html);


// var newsletter = new Buffer(html,'base64');
// console.log(newsletter);

//Dynectemail
var dynectemail = new DynectEmailNode({
  apikey: 'ea15eb4fabb44718983b7f5c04c93f6b',
  //useragent: 'my-app' // Change the user agent. Default is 'dynectemail-node'
  //secure: true,       // True will use port 443 instead of 80
  //format: 'json',      // Possible formats: 'json', 'xml', 'html'. Default is json               
});

var send = dynectemail.request("send", {
    from:'"Squirrel" <zainabebrahimi@gmail.com>',
    to:'"User"<khobra.z@gmail.com>',
    subject:"Newsletter",
    bodyhtml:html,
    handlers: {
        success: function(data) {
      if(data.response.status != '200') {
        console.log('Request Failed: ' + data.response.status + ' ' +data.response.message);
      } else {
        console.log('Request Success: ' + data.response.status, data.response.data);
      }
        },
        error: function(error) {
            console.log("Error: " + error.message);
        }
    }
}, 'POST');


// Clear session
exports.clear = function(req, res) {
  req.session.destroy();
  res.redirect('/');
};
