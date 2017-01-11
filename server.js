var express = require('express')
var bodyParser = require('body-parser')
var fs=require('fs')
var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var zip = require('zip-folder')
var geocoder = require('geocoder')

var url = 'mongodb://localhost:27017/Cesium'
var mapKey = 'AvwfPlyN7Gj8bEjnME5NEO8CKq8OmwKBoq9NVOCpb8XluFPedOEd1wLallFuQxYT'

var app = express()
var zoom
var locations

app.use(bodyParser.json({limit:10000000000}))
app.use(bodyParser.urlencoded({ extended: true, limit:10000000000 }))
app.use(express.static(__dirname + '/public'))
app.set('view engine','pug')

var server = app.listen(8080, function () {
    console.log('Listening on port 8080')
})

var io = require('socket.io')(server)

io.on('connection', function(client) {
    console.log('Client connected...');
    client.on('join', function(data) {
      console.log(data)
    });
    client.on('search',function(string){
      console.log(string)
      geocoder.geocode(string, function ( err, data ) {
        if(data.results.length>0){
          console.log(data.results[0].geometry.location.lat)
          console.log(data.results[0].geometry.location.lng)
          io.emit('results', {lat:data.results[0].geometry.location.lat,long:data.results[0].geometry.location.lng})
        }
      });
    })
});

app.get('/',function(req,res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err)
    console.log("Connected successfully to db server to load zoom levels & locations")
    var loc=db.collection('locations')
    loc.find().sort({'folder':1}).toArray(function(e,locs){
      locations=locs
      var col=db.collection('zoom')
      col.find().sort({'zoom_level':1}).toArray(function(err,obj){
        if(obj.length==0){
          for(var i=0;i<20;i++){
            col.insertOne({'zoom_level':i,'zoom_value':0})
          }
          col.find().sort({'zoom_level':1}).toArray(function(err,obj){
            zoom=obj
            db.close()
            res.render('index',{ title: 'Image Exporter', zoom:JSON.stringify(zoom), locations:locations, key:mapKey})
          })
        }
        else{
          zoom=obj
          db.close()
          res.render('index',{ title: 'Image Exporter', zoom:JSON.stringify(zoom), locations:locations, key:mapKey})
        }
      })
    })
  })
})

app.post('/save-images',function(req,res){
  console.log('saving')
  var d
  if(req.body['folder']!=''){
    d=req.body['folder']
    MongoClient.connect(url, function(err, db) {
      assert.equal(null, err)
      console.log("Connected successfully to db server to save location")
      console.log(req.body.folder)
      console.log(req.body.lat)
      console.log(req.body.long)
      var col=db.collection('locations')
      col.updateOne({'folder':d},{$set:{'lat':req.body.lat,'long':req.body.long}},{upsert:true},function(err,result){
        db.close()
      })
    })
  }

  else d=new Date.now()

  var dir=__dirname+'/public/images/'+d.toString()
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  var count=0
  saveImage(dir, count,req, res)
})

function saveImage(dir, i, req, res){
  var base64Data=req.body['image'+i]
  // console.log(base64Data)
  // var base64Data = req.query.image_data.replace(/^data:image\/png;base64,/, "");
  fs.writeFile(dir+"/image_"+i+".jpeg", base64Data, 'base64', function(err){
    // console.log(err)
    i++
    if(i==20){
      console.log("done!")
      zip(dir,dir+'.zip',function(err){
        if(err){
          console.log(err)
          res.redirect('/')
        }
        else{
          res.download(dir+'.zip')
        }
      })
    }
    else {
      console.log("starting to save "+i)
      saveImage(dir, i, req, res)
    }
  })
}

app.get('/change-zoom',function(req,res){
  MongoClient.connect(url, function(err, db) {
    assert.equal(null, err)
    console.log("Connected successfully to db server to save zoom levels")
    console.log(req.query.zoom_level)
    var col=db.collection('zoom')
    col.updateOne({'zoom_level':parseInt(req.query.zoom_level)},{$set:{'zoom_value':parseInt(req.query.zoom_value)}},function(err,result){
      db.close
      res.redirect('/')
    })
  })
})
