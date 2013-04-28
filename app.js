// Module dependencies
var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    user = require('./routes/user');

var app = express();

// Configurations
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('secret'));
  app.use(express.session());
  app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
  });
  app.use(app.router);
  app.use(require('less-middleware')({src: __dirname + '/public'}));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var showParam = function (req, res) {
    if (req.body) {
        // for (var key in req.body) {
        //     console.log(key + ": " + req.body[key]);
        // }       
        console.log(req.body.selectedNotebooks); 
        res.send({status:'ok',message:'data received'});
    } else {
        console.log("nothing received");
        res.send({status:'nok',message:'no Tweet received'});
    }   
}

// Routes
app.get('/', routes.index);
app.get('/oauth', routes.oauth);
app.get('/oauth_callback', routes.oauth_callback);
app.get('/clear', routes.clear);
app.get('/users', user.list);
// app.get('/thanks',routes.renderThanksPage);
app.get('/newsletter',routes.sendNewsletter);
app.post('/thanks', function (req, res){
   // console.log(req);
   console.log('req received');
   showParam(req, res);
   // res.render('thanks');
   //res.redirect('/');
});

// Run
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
