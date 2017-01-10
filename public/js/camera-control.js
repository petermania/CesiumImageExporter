Cesium.BingMapsApi.defaultKey = 'AvwfPlyN7Gj8bEjnME5NEO8CKq8OmwKBoq9NVOCpb8XluFPedOEd1wLallFuQxYT'
var viewer = new Cesium.CesiumWidget('cesiumContainer',{
  skyAtmosphere:false,
  resolutionScale:4.0,
  contextOptions: {
    webgl:{preserveDrawingBuffer:true}
  }
})

var longitude = 0
var latitude = 0
var height = 100

var scene=viewer.scene
var canvas=viewer.canvas

var currentZoom=0

$(document).ready(function(){
  viewer.camera.setView({
    destination : Cesium.Cartesian3.fromDegrees(0, 0, 100000000.0)
  })
  viewer.render()
})

$('.getImage').click(function(){
  var fullQuality = viewer.canvas.toDataURL("image/jpeg", 1.0);
  console.log(fullQuality)
  var data = fullQuality.replace(/^data:image\/jpeg;base64,/, "");
    $('<input>').attr({
      type: 'hidden',
      name: 'image',
      value: data,
      maxlength:'2000000000000000'
    }).appendTo('#images');
})

$("#zoom-level > button").on("click", function(e){
  e.preventDefault();
  console.log("clicked")
  $('.dropdown').removeClass("show")
  console.log($(this).text())
  e.stopPropagation();
});
