"use strict";
const express = require("express");

const session = require("express-session");							
const passport = require("passport");								
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;	

const app = express();

const request = require("request");
const path = require("path");
require("dotenv").config({
  silent: true
});
const cors = require("cors");

// Handle user session
app.use(session({
	secret: '123456',
	resave: true,
	saveUninitialized: true
}));


// Inizialize passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// Inizialize AppID service
passport.use(new WebAppStrategy({
	tenantId: process.env.TENANTID,
	clientId: process.env.CLIENTID,
	secret: process.env.SECRET,
	oauthServerUrl: process.env.OAUTHSRVURL,
	redirectUri: "https://"+process.env.CE_APP+"."+process.env.CE_SUBDOMAIN+"."+process.env.CE_DOMAIN+"/appid/callback"
}));



// Handle callback
app.get('/appid/callback', passport.authenticate(WebAppStrategy.STRATEGY_NAME));


// Handle logout
app.get('/appid/logout', function(req, res){
	WebAppStrategy.logout(req);
	res.redirect('/');
});

app.get('/api/user', (req, res) => {
	console.log(req.session[WebAppStrategy.AUTH_CONTEXT]);
	res.json({
		user: {
			name: req.user.name
		},
		email: {
			name: req.user.email
		}
	});
});

app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));   // protect the whole app with AppID Authentication
app.use(cors());
app.use(express.static(__dirname + '/public/js'));
app.use(express.static(__dirname + '/public/images'))
app.use(express.static(__dirname + '/public/css'))
const port = process.env.PORT || 3000;

const backendURL = process.env.BACKEND_URL;
console.log("backend URL: " + backendURL);

/*
 * Default route for the web app
 */
app.get('/', function(req, res) {
    if (backendURL === undefined || backendURL === ""){
// if user is not logged-in redirect back to login page //
       res.sendFile(__dirname + "/public/501.html");
    }   else{
        res.sendFile(__dirname + "/public/index.html");
    }
});

app.get('/files', async(req, res) => {
  req.pipe(
   await request.get(
      {
        url: backendURL+"/files",
        agentOptions: {
          rejectUnauthorized: false
        }
      },
      function(error, resp, body) {
        if (error) {
          res.status(400).send(error.message);
        }
        else{
        //console.log("RESPONSE", resp);
        //console.log("BODY",resp.body);
        res.send(body);
        }
      }
    )
  );
});
/*
 * Upload a file for Text analysis
 */
app.post("/uploadfile", async(req, res) => {
    req.pipe(
     await request.post(
        {
          url: backendURL+"/files",
          gzip: true,
          agentOptions: {
            rejectUnauthorized: false
          }
        },
        function(error, resp, body) {
          if (error) {
            console.log(error);
            res.status(400).send(error.message);
          }
          else{
          //console.log(body);
          res.send(body);
          }
        }
      )
    );
  
});

app.get("/results", async(req, res) => {
     req.pipe(
       await request.get(
        {
          url: backendURL+"/results",
          agentOptions: {
            rejectUnauthorized: false
          }
        },
        function(error, resp, body) {
          if (error) {
            console.log(error);
            res.status(400).send(error.message);
          }
          else{
          //console.log(body);
          res.send(body);
          }
        }
      )
    );
  
});

app.delete("/file", async (req, res) => {
  var itemName = req.query.filename;
  req.pipe(
    await request.delete(
      {
        url: backendURL+"/file?filename="+itemName,
        agentOptions: {
          rejectUnauthorized: false
        }
      },
      function(error, resp, body) {
        if (error) {
          console.log(error);
          res.status(400).send(error.message);
        }
        else{
        //console.log(body);
        res.send(body);
        }
      }
    )
  );

});


app.use(function(error, req, res, next) {
  res.status(500).send(error.message);
});

app.listen(port, () => console.log(`App listening on port ${port}!`));
