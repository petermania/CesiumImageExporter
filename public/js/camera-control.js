Cesium.BingMapsApi.defaultKey = key
var server_location='http://localhost:8080'

var socket = io.connect(server_location);

var viewer = new Cesium.CesiumWidget('cesiumContainer',{
  skyAtmosphere:false,
  resolutionScale:1.0,
  contextOptions: {
    webgl:{preserveDrawingBuffer:true}
  }
})

var longitude = -73.882593
var latitude = 40.75226
var height = 100
var hRes = 2962
var vRes = 1920
var bClick = false

var scene=viewer.scene
var canvas=viewer.canvas

var currentZoom=0

socket.on('connect', function(data) {
    console.log('connecting')
    socket.emit('join', 'Hello World from client');
})

socket.on('results',function(data){
  $('#lat').val(data.lat)
  latitude=data.lat
  $('#long').val(data.long)
  longitude=data.long
  currentZoom=14
  $('#zoomLabel').text(currentZoom)
  $('#zoomLevel').val(zoom[currentZoom].zoom_level)
  $('#zoomValue').val(zoom[currentZoom].zoom_value)
  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, zoom[currentZoom].zoom_value),
    duration:0
  });
})

$(document).ready(function(){
  viewer.camera.setView({
    destination : Cesium.Cartesian3.fromDegrees(0, 0, 100000000.0)
  })
  viewer.render()
  $('#zoomLabel').text(currentZoom)
  $('#zoomLevel').val(zoom[currentZoom].zoom_level)
  $('#zoomValue').val(zoom[currentZoom].zoom_value)
})

$('.getImage').click(function(e){
  e.preventDefault()
  $("#cesiumContainer").width(hRes).height(vRes)
  var count=0
  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, zoom[count].zoom_value),
    duration:0
  })
  viewer.render()
  takeImages(count)
})

$("#locations > button").on("click",function(e){
  e.preventDefault()
  $('.dropdown').removeClass("show")
  $('#folder').val($(this).text())
  $('#lat').val($(this).attr('lat'))
  $('#long').val($(this).attr('long'))
  longitude = $(this).attr('long')
  latitude = $(this).attr('lat')
  currentZoom=14
  $('#zoomLabel').text(currentZoom)
  $('#zoomLevel').val(zoom[currentZoom].zoom_level)
  $('#zoomValue').val(zoom[currentZoom].zoom_value)
  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, zoom[currentZoom].zoom_value),
    duration:0
  });
})

$("#zoom-level > button").on("click", function(e){
  e.preventDefault()
  $('.dropdown').removeClass("show")
  currentZoom=$(this).text()
  $('#zoomLabel').text(currentZoom)
  $('#zoomLevel').val(zoom[currentZoom].zoom_level)
  $('#zoomValue').val(zoom[currentZoom].zoom_value)
  viewer.camera.flyTo({
    destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, zoom[currentZoom].zoom_value),
    duration:0
  });
  // viewer.camera.lookAt(center, new Cesium.Cartesian3(-40.7, 74.0,0));
  // viewer.camera.setView({
  //   destination : Cesium.Cartesian3.fromDegrees(40.7128, 74.0058, zoom[currentZoom].zoom_value)
  // })
  viewer.render()
  e.stopPropagation();
});

$('#lat').focusout(function(){
  if($('#lat').val()!='') {
    latitude=$('#lat').val()
    console.log(latitude)
  }
})

$('#long').focusout(function(){
  if($('#long').val()!=''){
    longitude=$('#long').val()
    console.log(latitude)
  }
})

$('.setClick').click(function(e){
  bClick=!bClick
})

$('#cesiumContainer').click(function(e){
  console.log("clicked")
  if(bClick){
    console.log("setting lat long")
    var mousePosition = new Cesium.Cartesian2(e.clientX, e.clientY)
    console.log("mouse "+mousePosition)
    var ellipsoid = viewer.scene.globe.ellipsoid
    var cartesian = viewer.camera.pickEllipsoid(mousePosition, ellipsoid)
    console.log("cartesian "+cartesian)
    if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
        var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
        console.log("longitude "+longitudeString)
        $('#lat').val(latitudeString)
        latitude=latitudeString
        $('#long').val(longitudeString)
        longitude=longitudeString
        console.log("longitude "+longitude)
        bClick=false
        $('.setClick').removeClass('active focus')
    }
  }
})

$('.search').click(function(e){
  e.preventDefault()
  if($('.search_location').val()!=''){
    socket.emit('search',$('.search_location').val())
  }
})

function takeImages(count) {
  setTimeout(function(){
    console.log("recording image "+count)
    var fullQuality = viewer.canvas.toDataURL("image/jpeg", 1.0);
    // console.log(fullQuality)
    var data = fullQuality.replace(/^data:image\/jpeg;base64,/, "");
      $('<input>').attr({
        type: 'hidden',
        name: 'image'+count,
        value: data,
        maxlength:'2000000000000000'
      }).appendTo('#images')
      count++
      if(count==20) {
        console.log("ending record loop")
        $('#sendImages').click()
        setTimeout(function(){
          window.location.reload()
        },10000)
      }
      else{
        setTimeout(function(){
          viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, zoom[count].zoom_value),
            duration:0
          })
        viewer.render()
        takeImages(count)
      },1000)
      }
  },3500)
}
