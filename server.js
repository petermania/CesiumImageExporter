// var Cesium = require('cesium')
var express = require('express')
var bodyParser = require('body-parser')
var fs=require('fs')

var app = express()

app.use(bodyParser.json({limit:10000000000}))
app.use(bodyParser.urlencoded({ extended: true, limit:10000000000 }))
app.use(express.static(__dirname + '/public'))
app.set('view engine','pug')

var server = app.listen(8080, function () {
    console.log('Listening on port 8080')
})


app.get('/',function(req,res){
  res.render('index',{ title: 'Image Exporter'})
})

app.post('/save-images',function(req,res){
  console.log('saving')
  // res.render('index',{ title: 'Hey'})
  var base64Data=req.body.image
  // console.log(req.query)
  // for(i in req.query){
  //   base64Data+=req.query[i]
  // }
  console.log(base64Data)
  // var base64Data = req.query.image_data.replace(/^data:image\/png;base64,/, "");
  var d=new Date()
  var dir='public/images/'+d.toString()
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
  fs.writeFile(dir+"/image.jpeg", base64Data, 'base64', function(err){
    // console.log(err)
    res.redirect('/')
  })
})
