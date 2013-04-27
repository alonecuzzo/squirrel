express = require "express"
sys = require "sys"
util = require "util"
oauth = require "oauth"
fs = require "fs"

app = module.exports = express.createServer()
 
app.configure('development', () ->
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
  app.use(express.logger())
  app.use(express.cookieParser())
  app.use(express.session({secret: "ssshhhh!"}))
)
 
app.configure('production', () ->
  app.use(express.errorHandler())
  app.use(express.logger())
  app.use(express.cookieParser())
  app.use(express.session({secret: "ssssssssssshhhhh!"}))
)
 
# configFile = "#{process.env['HOME']}/config.js"
# config = require configFile
 
consumer = () ->
  new oauth.OAuth("https://twitter.com/oauth/request_token",
                  "https://twitter.com/oauth/access_token",
                  "FsbX5IVDlJJzRyQUJUhcg",
                  "g9oxH1ddPncINVdah1yx92aXJ0lXe5ZerDYgeWNslc",
                  "1.0A",
                  "http://host/sessions/callback",
                  "HMAC-SHA1")
 

 
app.get('/', (request, response) ->
  response.send('Hello World')
)
 
app.get '/sessions/connect', (request, response) ->
  consumer().getOAuthRequestToken (error, oauthToken, oauthTokenSecret, results) ->
    if error
      response.send('Error getting OAuth access token')
    else
      request.session.oauthRequestToken = oauthToken
      request.session.oauthRequestTokenSecret = oauthTokenSecret
      response.redirect("https://twitter.com/oauth/authorize?oauth_token=#{request.session.oauthRequestToken}")
 
app.get '/sessions/callback', (request, response) ->
  consumer().getOAuthAccessToken request.session.oauthRequestToken, request.session.oauthRequestTokenSecret, request.query.oauth_verifier, (error, oauthAccessToken, oauthAccessTokenSecret, results) ->
    if error
    else
      request.session.oauthAccessToken = oauthAccessToken
      request.session.oauthAccessTokenSecret = oauthAccessTokenSecret
      consumer().get "http://twitter.com/account/verify_credential.json", request.session.oauthAccessToken, request.session.oauthAccessTokenSecret, (error, data, response) ->
        data = JSON.parse(data)
        response.send("You are signed in: #{data["screen_name"]}")
 
app.listen(parseInt(process.env.PORT || 8080))