var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('mongodb');
const tokenAPI = 'b50d06cf0be2ceacf57cf97451e6a7af';
const url = 'https://api.openweathermap.org/data/2.5/weather';
const fetch = require('node-fetch');
const assert = require('assert');
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true }, { useUnifiedTopology: true });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*GET weather by name of city */
router.get('/weather', function (req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  fetch(`${url}?q=${req.query.city}&APPID=${tokenAPI}`)
    .then((response)=>{
      response.json()
        .then((data)=>{
          res.set('Content-Type', 'application/json').status(200).json(data);
        });
    })
    .catch(error => {
      res.status(400).send(error.message);
    });
});

/*GET weather by coords */
router.get('/weather/coordinates', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  console.log(`${url}?lat=${req.query.lat}&lon=${req.query.long}&APPID=${tokenAPI}`);
  fetch(`${url}?lat=${req.query.lat}&lon=${req.query.long}&APPID=${tokenAPI}`)
    .then((response)=>{
      response.json()
        .then((data)=>{
          res.set('Content-Type', 'application/json').status(200).json(data);
        });  
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error.message);
    });
});

/*POST add one city to favourites*/
router.post('/favourites', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  mongoClient.connect(function(err, client){
    if(err){ 
      console.log("Unable to connect to the server");
    }
    const db = client.db('cities');
    const collection = db.collection('citycol');
    collection.countDocuments({name: req.body.name})
      .then(result=>{
        console.log(result);
        console.log(req.body.name);
        const tmp ={
          name: req.body.name,
        }
        if ( result == 0 ){
          collection.insertOne(tmp, function(err, result){
            if(err){ 
              return console.log(err);
            }           
            res.status(201).end();
          });
        }
        else {
          
          res.status(406).end();
        }
      })  
  });
});

/*GET get all cities from favourites*/
router.get('/favourites', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  mongoClient.connect(function(err, client){
    const db = client.db('cities');
    const collection = db.collection('citycol');
    collection.find({}, {projection:{_id: 0}}).toArray(function(err, docs){
      if(err){ 
        res.status(400).end();
        return;
      }
       res.set('Content-Type', 'application/json').json(docs);
    });
  });
});

router.delete('/favourites', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  mongoClient.connect(function(err, client){
    const db = client.db('cities');
    const collection = db.collection('citycol');
    collection.deleteMany({name: req.body.name}, function(err, result){
      if(err){ 
        res.status(400).end();
        return;
      }
      res.status(200).end();
    });
  });
});

router.options('/favourites', function(req, res, next){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept, API-Key');
  res.status(200).end();
});

module.exports = router;
