'use strict';

const dns = require('dns');
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const bodyParser = require("body-parser");

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
/** this project needs to parse POST bodies **/
// you should mount the body-parser here

// model declaration
const Schema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    default: 0
  }
},{ versionKey: false });
const Url = mongoose.model("Url",Schema);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post("/api/shorturl/new",async(req,res)=>{
try {
  let url = req.body.original_url.replace(/(^\w+:|^)\/\//, '');

  dns.lookup(url, async(err, address, family) => {
   if(err) {res.json({"error":"invalid URL"});}
   else {
   const short_url_length =  await Url.estimatedDocumentCount();
   const urlInput = new Url({
     original_url: req.body.original_url,
     short_url: short_url_length + 1
   }); 
   await urlInput.save();

   res.json(urlInput);
  }
  });

} catch (error) {
  console.log(error);
}
});

app.get("/api/shorturl/:short_url",async(req,res)=>{
 try {
  const url = await Url.findOne({short_url: req.params.short_url});
  res.redirect(url.original_url);
 } catch (error) {
   console.log(error);
   
 }

});
  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
mongoose.connect('mongodb://localhost/url', {useNewUrlParser: true});