//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/usersDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// var secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret:secret, encryptedFields: ['password']});

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

   bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if(!err){
      const email = req.body.username;
      const password = hash;

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

             user.save((err) => {
               if(!err){
                 res.render('secrets');
               }
             });
           }
         }
         });

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
        bcrypt.compare(password, dbPassword, function(err, result) {
          if(result == true && !err){
            res.render('secrets');
          }
        });

      }
    }
  });
})







app.listen("3000", () => {
  console.log("Server is up on port 3000");
});
