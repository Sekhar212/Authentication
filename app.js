//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

var secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});

const User = mongoose.model("user", userSchema);


app.get("/", (req, res) => {
  res.render('home');
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/login", (req, res) => {
  res.render('login');
});

app.post("/register", (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  User.findOne({email: email}, (err, foundOne) =>{
    if(!err){
      if(foundOne){
        res.redirect("/register");
      }
      else{
        const user = new User({
          email: email,
          password: password
        });

        user.save((err, respo) => {
          if(!err){
            res.render('secrets');
          }
        });
      }
    }
    });



  // console.log(email + password);
  // res.redirect("/register");
});

app.post("/login", (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  User.findOne({email: email}, (err, foundOne) =>{
    if(!err){
      if(foundOne){
        const dbPassword = foundOne.password;
        if(dbPassword == password){
          res.render('secrets');
        }
      }
    }
  });
})







app.listen("3000", () => {
  console.log("Server is up on port 3000");
});
