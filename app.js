//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require("express-session");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'You are a very nice guy',
  resave: false,
  saveUninitialized: false

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

// var secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res) => {
  res.render('home');
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.get("/secrets", (req, res) =>{
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.redirect('/login');
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect("/");
})

app.post("/register", (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  User.register({username: email}, password, (err, user) => {
    if(err){
      console.log(err);
      res.redirect("/register");
    }else {
      passport.authenticate('local')(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, (err) => {
    if(err) console.log(err);
    else{
      passport.authenticate('local')(req, res, function() {
        res.redirect("/secrets");
      });
    }
  })
});



app.listen("3000", () => {
  console.log("Server is up on port 3000");
});
