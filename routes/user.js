(function() {
  var MongoClient, dbURL;

  MongoClient = require('mongodb').MongoClient;

  dbURL = 'mongodb://localhost:27017/squirrel';

  exports.list = function(req, res) {
    var responseJSON;
    responseJSON = '';
    MongoClient.connect(dbURL, function(err, db) {
      var usersCollection;
      if (err) {
        return console.dir(err);
      }
      usersCollection = db.collection('users');
      responseJSON = usersCollection.find().toArray(function(err, results) {
        res.send(JSON.stringify(results));
      });
    });
  };

  exports.createUser = function(req, res) {
    var un = 'lolzboat', email = 'lolzboat@lolz.com',
      newUser = {'username' : un, 'email' : email};
    console.log('adding user: ' + newUser);
    MongoClient.connect(dbURL, function(err, db) {
      var usersCollection = db.collection('users');
      usersCollection.insert(newUser, {safe:true}, function(err, result) {
        if (err) {
          res.send({'error' : 'an error has occured'});
        } else {
          console.log('Success: ' + JSON.stringify(result[0]));
          res.send(result[0]);
        }
      });
    });
  }

  exports.createUserAfterLogin = function(newUser, res, req) {
    MongoClient.connect(dbURL, function(err, db) {
      var usersCollection = db.collection('users');
      usersCollection.insert(newUser, {safe:true}, function(err, result) {
        if (err) {
          res.send({'error' : 'an error has occured'});
        } else {
          req.session.uid = result[0]._id;
        }
      });
    });
  }

  exports.populateNotebooks = function(uid, notebooks) {
    // var BSON = require('mongodb').BSONPure;
    console.log('uid: ' + uid);
    var o_id = new require('mongodb').ObjectID(uid.toString());
    MongoClient.connect(dbURL, function(err, db) {
      var usersCollection = db.collection('users');
      usersCollection.update({_id : o_id}, {$set: {notebooks : notebooks}}, {safe : true}, function(err) {
        if (err) {
          res.send({'error' : 'an error has occured'});
        } else {
          console.log('user was updated');
        }
      });
    });
  }

  exports.listUser = function(req, res) {
    var id;
    id = parseInt(req.params.id);
    return MongoClient.connect(dbURL, function(err, db) {
      var user, usersCollection;
      if (err) {
        return console.dir(err);
      }
      usersCollection = db.collection('users');
      user = usersCollection.findOne({
        _id: id
      }, function(err, item) {
        var highestId, highestUser;
        if (err) {
          return console.dir(err);
        }
        if (item) {
          res.send(JSON.stringify(item));
        } else {
          highestId = -1;
          highestUser = usersCollection.find().sort({
            _id: -1
          }).limit(1).toArray(function(err, results) {
            var newUser;
            if (err) {
              return console.dir(err);
            }
            highestId = results[0]._id + 1;
            newUser = {
              _id: highestId,
              location: -1
            };
            usersCollection.insert(newUser, function(err, results) {
              if (err) {
                return console.dir(err);
              }
              res.send(JSON.stringify(results[0]));
            });
          });
        }
      });
    });
  }

  exports.sendNewsletter = function() {
    MongoClient.connect(dbURL, function(err, db) {
      var usersCollection = db.collection('users');
      var user,
          nowUnixTime = new Date().getTime / 1000;
      responseJSON = usersCollection.find().toArray(function(err, results) {
        // res.send(JSON.stringify(results));
        console.log('user: ' + JSON.stringify(results));
        for(var i = 0; i < results.length; i++) {
          user = results[i];
          console.log('last_sent: ' + user.last_sent);
          if(nowUnixTime - (user.last_sent + user.frequency) > 0) {
            //then they need their email sent
          }
        }
      });
    });
  }

  exports.userClosedApp = function(req, res) {
    var userId;
    userId = parseInt(req.params.id);
    return MongoClient.connect(dbURL, function(err, db) {
      var usersCollection;
      if (err) {
        return console.dir(err);
      }
      usersCollection = db.collection('users');
      usersCollection.update({
        _id: userId
      }, {
        location: -1
      }, function(err, results) {
        res.send(JSON.stringify(results));
      });
    });
  };

  exports.usersInArticle = function(req, res) {
    var articleId;
    articleId = parseInt(req.params.articleId);
    return MongoClient.connect(dbURL, function(err, db) {
      var usersCollection;
      if (err) {
        return console.dir(err);
      }
      usersCollection = db.collection('users');
      usersCollection.find({
        location: articleId
      }).toArray(function(err, results) {
        res.send(JSON.stringify(results));
      });
    });
  };

}).call(this);