/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = '0ad3baa2a6564528b19f0ddc20a0a0dd'; // Your client id
var client_secret = '23ff4e07ee6b49fa9fefb41055bf2110'; // Your secret
var redirect_uri = 'http://134.122.27.64/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

//Starting From here this is test code for trying the api
app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        
        

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body["id"]);
          var newUser = new User({
            userID: body["id"],
            access: access_token,
            refresh: refresh_token,
            connected: True
          });
          newUser.save();
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/pause', function(req, res){
  var user = req.query.userID;
  var auth_token = User.find({ name:user })[0]["access"];
  var authOptions = {
    url: 'https://api.spotify.com/v1/me/player/pause',
    headers: { 
      'Authorization': 'Bearer ' + auth_token,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  request.put(authOptions, function(error, response, body){
    console.log('PUT: pause request Sent');
  });
  res.sendStatus(204);
});

app.get('/play', function(req, res){
  var user = req.query.userID;
  var auth_token = User.find({ name:user })[0]["access"];
  var authOptions = {
    url: 'https://api.spotify.com/v1/me/player/play',
    headers: { 
      'Authorization': 'Bearer ' + auth_token,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  request.put(authOptions, function(error, response, body){
    console.log('PUT:play request Sent');
  });
  res.sendStatus(204);
});

app.get('/thanks', function(req, res) {
  res.sendFile(__dirname + '/public/thanks.html');
});
//Testing code for API ends here

//Initialize MOngoose and structures for it

const mongoose = require('mongoose');
mongoose.connect('mongodb://12.12.12.12/Streams', {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  userID: String,
  access: String,
  refresh: String,
  connected: Boolean
});
const User = mongoose.model('User', userSchema);

const streamSchema = new mongoose.Schema({
  song: String,
  name: String,
  streamer: String,
  viewers: [{type: String}]
});
const Stream = mongoose.model('Stream', streamSchema);


//refreshes token for the userid provided, may need to be changed
app.get('/refresh_token/:userID', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  //await User.find({ userID: user }, {
    //access: access_token
  //});
  var user = req.params["userID"]
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      users[user]["access"] = access_token;
      //await User.updateOne({ userID: user }, {
        //access: access_token
      //});
      res.send({
        'access_token': access_token
      });
    }
  });
});

//holder for data structure to be used
var users = {
  "userid1": {
    "access": "auth token",
    "refersh": "refresh token"
  }
}

//holder for data structure to be used
var streams = {
  "stream1": {
    "song": "songid",
    "name": "test stream",
    "streamer": "spotifyuserid",
    "viewers": {
      "userid1": "connected", 
      "userid2": "disconnected"
    },
  }
}

//call to get id of current song, should we call api here?
app.get('/nowplaying/:stream', function(req, res){
  var stream = req.params["stream"];
  var song = streams["stream"]["song"];
  res.json({id: song});
});

//Call from website to register streamer from Spotify API
app.get('/register/:stream', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var stream = req.params["stream"];
  var redirect_uri_streamer = 'http://134.122.27.64/create/'+stream; //register room based off of initial streamer code
  //application requests authorization

  //scope needed to read status of playing songs
  var scope = 'user-read-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri_streamer,
      state: state
    }));
});

//Callback URI to create room for streamer
app.get('/create/:streamer', function(req, res) {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  var user = req.params["streamer"];
  streams[user] = {
    "song": "",
    "name": user,
    "streamer": "",
    "viewers": {}
  }

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        // add tokens to user list

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body["id"]);
          //register user and tokers into dictionary
          users[body["id"]] = {
            "access": access_token,
            "refresh": refresh_token,
          };
          streams[user]["streamer"] = body["id"];
        });
        res.sendStatus(204);
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});


//Adds user to viewers for stream. returns {json:""}?
app.get('/join/:stream', function (req, res){
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  var stream = req.params["stream"];
  var redirect_uri_streamer = 'http://134.122.27.64/connect/'+stream; //register room based off of initial streamer code
  //application requests authorization

  //scope needed to change location in songs
  var scope = 'user-modify-playback-state';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri_streamer,
      state: state
    }));
});

//URI to return viewer to after Spotify API call
app.get('/connect/:stream', function(req,res){
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  var stream = req.params["stream"];

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        // add tokens to user list

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body["id"]);
          //register user and tokens into dictionary
          users[body["id"]] = {
            "access": access_token,
            "refresh": refresh_token,
          };
          //adds user to view list for stream
          streams[user]["viewers"][body["id"]] = "connected";
        });
        res.sendStatus(204);
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

//disconects viewer spotify from being synced with streamer
app.get('/disconnect/:stream', function(req, res){
  var user = req.query.user;
  var stream = req.params["stream"];
  streams[stream]["viewers"][user] = "disconnected";
  res.sendStatus(204);
});

//reconnects viewer spotify after being disconnected
app.get('/reconnect/:stream', function(req, res){
  var user = req.query.user;
  var stream = req.params["stream"];
  streams[stream]["viewers"][user] = "connected";
  res.sendStatus(204);
});

app.get('/leave/:stream', function(req, res){
  var user = req.query.user;
  var stream = req.params["stream"];
  delete streams[stream]["viewers"][user];
  delete users[user];
  res.sendStatus(204);
});

//Implement later to get streamer to close stream
//app.get('/close/:stream', function(req,res){});

console.log('Listening on 80');
app.listen(80);
