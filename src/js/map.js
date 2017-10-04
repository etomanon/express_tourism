var mapData
let layer1

var nameArray2 = ['Artwork', 'Attraction', 'Picnic site', 'Theme park', 'Viewpoint', 'Hunting lodge', 'Gallery', 'Zoo', 'Wilderness hut', 'Museum', 'Other']
var typeArray2 = ['artwork', 'attraction', 'picnic_site', 'theme_park', 'viewpoint', 'hunting_lodge', 'gallery', 'zoo', 'wilderness_hut', 'museum', 'yes']


$(".show-menu").click(function () {
  $("#map").toggleClass('map-move')
  $(".menu-right").toggleClass('menu-active')
  $(".show-menu").toggleClass('show-active')
});


$(".close-menu").click(function () {
  $("#map").toggleClass('map-move-right')
  $(".menu-left").toggleClass('menu-active')
});

var myIcon1 = L.icon({
  iconUrl: 'images/gps.png',
  iconRetinaUrl: 'images/gps.png',
  iconSize: [35, 35],
  iconAnchor: [+12, +12],
  popupAnchor: [0, 0],
  shadowUrl: '',
  shadowRetinaUrl: '',
  shadowSize: [0, 0],
  shadowAnchor: [22, 94]
});

function getIcon(latlng, ico) {
  return (L.marker(latlng, {
    icon: L.icon({
      iconUrl: ico,
      iconRetinaUrl: ico,
      iconSize: [45, 45],
      iconAnchor: [+15, +15],
      popupAnchor: [0, 0],
      shadowUrl: '',
      shadowRetinaUrl: '',
      shadowSize: [0, 0],
      shadowAnchor: [22, 94]
    })
  }));
}

var map = L.map('map', {
  center: [42.375562, -71.106870],
  zoom: 16,
  maxZoom: 18
});

var carto1 = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '<a target="_blank" href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a> | <a target="_blank" href="http://carto.com/attributions">&copy; Carto</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

var carto2 = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
  attribution: '<a target="_blank" href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap</a> | <a target="_blank" href="http://carto.com/attributions">&copy; Carto</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

var baseLayers = {
  "Light Carto": carto1,
  "Dark Carto": carto2
};

L.control.layers(baseLayers, null, { position: 'topleft' }).addTo(map);

carto1.addTo(map)

map.setView({
  lat: 50.0755,
  lng: 14.4378
}, 11);

var provider = new window.GeoSearch.OpenStreetMapProvider();

var searchControl = new window.GeoSearch.GeoSearchControl({
  provider: provider,
  showMarker: false,
  autoClose: true,
  keepResult: true
});

map.addControl(searchControl);

var locateMe = L.Control.extend({

  options: {
    position: 'bottomleft'
  },

  onAdd: function (map) {
    var container1 = L.DomUtil.create('div', 'leaflet-control-custom');

    container1.innerHTML = '<img title="Find me!" src="images/gps.png" style="width: auto; height: 100%; cursor: pointer" onclick="locateMe1();" />';

    container1.style.width = '35px';
    container1.style.height = '35px';
    container1.style.marginBottom = '30px';

    return container1;
  }
});

map.addControl(new locateMe());

function locateMe1() {
  $(".loading").removeClass('loading-hide')
  var geoOptions1 = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  };

  window.navigator.geolocation.getCurrentPosition(found, error, geoOptions1);
}

var extent = L.Control.extend({

  options: {
    position: 'bottomleft'
  },

  onAdd: function (map) {
    var container2 = L.DomUtil.create('div', 'leaflet-control-custom');

    container2.innerHTML = '<img title="Zoom out to full extent!" src="images/extent.png" style="width: auto; height: 100%; cursor: pointer" onclick="extent1();" />';

    container2.style.width = '35px';
    container2.style.height = '35px';

    return container2;
  }
});

map.addControl(new extent());

function extent1() {
  map.fitBounds(gj.getBounds())
}

function onMove() {
  if (gj.getBounds().isValid()) {
    if (gj.getBounds().pad(-0.1).contains(map.getCenter())) {
      $('.load-new').removeClass('show-class')
    }
    else {
      $('.load-new').addClass('show-class')
    }
  }
}

var myLocation = {}
function found(e) {

  myLocation = {
    long: e.coords.longitude,
    lat: e.coords.latitude
  };
  $.get('/data', myLocation, function (data) {
    $(".loading").addClass('loading-hide')
    mapData = data
    addDataMap(mapData)
    var swap1 = [e.coords.latitude, e.coords.longitude]
    var you = L.marker(swap1, {
      icon: myIcon1
    }).addTo(map).bindPopup("Your position!<br><br><span class='zoom-button' onclick='zoomIn(" + e.coords.latitude + "," + e.coords.longitude + ");'>Zoom in!</span>");
    you.openPopup()
    map.setView(swap1, 15);
  })
}

var geoOptions = {
  enableHighAccuracy: false,
  timeout: 20000,
  maximumAge: 0
};

function error(err) {
  alert('ERROR (' + err.code + '): ' + err.message + '\nPlease enable geolocation on your device & reload the page.');
  $(".loading").addClass('loading-hide')
  $('.load-new').addClass('show-class')
};

navigator.geolocation.getCurrentPosition(found, error, geoOptions);

var gj
var ratedMe = false
var ratedOnly = false
var notIncluded = ['ratedMe', 'ratedOnly', 'guest_house', 'information', 'hotel', 'hostel', 'motel', 'chalet', 'caravan_site', 'camp_site', 'apartment', 'alpine_hut']
var typeArray = ['artwork', 'attraction', 'picnic_site', 'theme_park', 'viewpoint', 'yes', 'hunting_lodge', 'gallery', 'zoo', 'wilderness_hut', 'museum']
// Add JSON to map
function addDataMap(mapData) {
  gj = L.geoJson(mapData, {
    pointToLayer: function (feature, latlng) {
      if (typeArray.indexOf(feature.properties.f4) > -1) {
        return getIcon(latlng, 'images/' + feature.properties.f4 + '.png')
      }
      else {
        return getIcon(latlng, 'images/yes.png')
      }

    },
    filter: function (feature, layer) {
      if (ratedOnly && feature.properties.f5 == null) { return false }
      else if (notIncluded.indexOf(feature.properties.f4) > -1) { return false }
      else if (ratedOnly && feature.properties.f5 == true) { return true }
      else if (ratedMe && feature.properties.f5 == true) { return false }
      else if (typeArray.indexOf(feature.properties.f4) > -1) { return true }
      else { return false }
    }

  });
  if (gj.getBounds().isValid()) {
    if (!(map.getBounds().intersects(gj.getBounds()))) {
      map.fitBounds(gj.getBounds())
    }
  }
  layer1 = L.markerClusterGroup({ showCoverageOnHover: true, chunkedLoading: true });
  layer1.addLayer(gj);
  map.addLayer(layer1);
  map.on('move', onMove)


  layer1.on('click', function (e) {

    map.setView([e.latlng.lat, e.latlng.lng], map.getZoom());
    $(".menu-left .menu-wrapper").empty()
    $(".menu-left .menu-wrapper").append("<h3>" + getName(e.layer.feature.properties.f3) + "</h3><hr><h4>" + getType(e.layer.feature.properties.f4) + "</h4><br><h3 style='margin: auto; text-align: center'>CURRENT RATING (<span class='numRate'></span>x)</h3><div style='margin: auto' class='rat' id=" + e.layer.feature.properties.f1 + "></div><span class='center-text'> " + rated(e.layer.feature.properties.f5) + "</span>" + ifName(e.layer.feature.properties.f3) + "<br><a target='_blank' href='https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=" + e.latlng.lat + "," + e.latlng.lng + "'>Google Street View!</a>" + ifFound(e.latlng.lat, e.latlng.lng) + "<br><span class='zoom-button' onclick='zoomIn(" + e.latlng.lat + "," + e.latlng.lng + ");'>Zoom in!</span>")
    ratingF()
    $("#map").addClass('map-move-right')
    $(".menu-left").addClass('menu-active')

    L.DomEvent.stop(e);

  })
}

function zoomIn(lat, lng) {
  map.setView([lat, lng], 18);
}

function ifName(name) {
  if (!name) {
    return ""
  }
  else {
    return "<br><a target='_blank' href='https://www.google.cz/search?q=" + name + "'>Google the name!</a>"
  }
}

function ifFound(lat, lng) {
  if (typeof myLocation.lat !== 'undefined') {
    return "<br><a target='_blank' href='https://www.google.com/maps/dir/?api=1&origin=" + myLocation.lat + "," + myLocation.long + "&destination=" + lat + "," + lng + "'>Google, show route!</a>"
  }
  else {
    return ""
  }
}

function getName(name) {
  if (!name) {
    return 'Unknown'
  }
  else {
    return name
  }
}

function getType(type) {
  return nameArray2[typeArray2.indexOf(type)]
}

function rated(rated) {
  if (rated) {
    return '[you already rated]'
  }
  else {
    return '[click to rate]'
  }
}


function ratingF() {

  $(".rat").each(function (i) {
    var idRate = $(this).attr("id")
    var elem = $("#" + idRate)

    elem.rateYo({
      rating: 0,
      normalFill: "black",
      ratedFill: "gold",
      precision: 0
    });
    var parameters = {
      search: $(this).attr("id")
    };
    $.get('/getRate', parameters, function (data) {
      if (typeof data.count !== 'undefined') {
        var oldRating = parseInt(data.rating)
        $('.numRate').text(data.count)
      }
      else {
        var oldRating = 0
        $('.numRate').text('0')
      }

      elem.rateYo("rating", data.rating);
      elem.rateYo()
        .on("rateyo.change", function (e, data) {
          $(this).prev().text('YOUR RATING');
        });
      elem.rateYo()
        .on("rateyo.set", function (e, data) {

          gj.eachLayer(function (layer) {
            if (layer.feature.properties.f1 == idRate) {
              layer.feature.properties.f5 = true
            }
          });

          var data = {
            'tourism_id': idRate,
            'rate': data.rating
          }
          $.post('/rate', data, function (resp) {
            return
          });

          $('#ratedOnly').trigger('change')

        });
    });


  });
};



//set initial state.
$("input:checkbox[name=filterData]").each(function () {

  $(this).change(function () {
    map.off('move', onMove);
    var pro = $(this).prop('id')
    if (this.checked) {
      var index = notIncluded.indexOf(pro);
      if (index > -1) {
        notIncluded.splice(index, 1);
        gj.clearLayers()
        layer1.clearLayers()
        addDataMap(mapData)
      }

    }
    else {
      var index1 = notIncluded.indexOf(pro);
      if (index1 == -1) {
        notIncluded.push(pro)
        gj.clearLayers()
        layer1.clearLayers()
        addDataMap(mapData)
      }
    }

  });
});

$('#select-all').click(function (event) {
  if (this.checked) {
    $('.type-check').each(function () {
      this.checked = true;
      $(this).trigger("change");
    });
  }
  else {
    $('.type-check').each(function () {
      this.checked = false;
      $(this).trigger("change");
    });
  }
});

$('#ratedBy').click(function (event) {
  if (this.checked) {
    ratedMe = false
  }
  else {
    ratedMe = true
  }
});


$('#ratedOnly').click(function (event) {
  if (this.checked) {
    ratedOnly = true
  }
  else {
    ratedOnly = false
  }
});


$('.load-new').on('click', function () {
  $('.load-new').css({ 'zIndex': '-1' })
  map.off('move', onMove);
  $(".loading").removeClass('loading-hide')
  var parameters = {
    long: map.getCenter().lng,
    lat: map.getCenter().lat
  };
  $.get('/data', parameters, function (data) {
    $(".loading").addClass('loading-hide')
    if (typeof gj != 'undefined') {
      gj.clearLayers()
    }
    if (typeof layer1 != 'undefined') {
      layer1.clearLayers()
    }

    mapData = data
    addDataMap(mapData)
    map.fire('move')
    $('.load-new').css({ 'zIndex': '9999' })
  })
})


var tapped = false
$("#map").on("touchstart", function (e) {
  if (!tapped) { //if tap is not set, set up single tap
    tapped = setTimeout(function () {
      tapped = null
      //insert things you want to do when single tapped
    }, 300);   //wait 300ms then run single click code
  } else {    //tapped within 300ms of last tap. double tap
    clearTimeout(tapped); //stop single tap callback
    tapped = null
    //insert things you want to do when double tapped
    map.zoomIn(1)
  }
});




var menuRight = document.getElementsByClassName('menu-right')[0]
menuRight.addEventListener('touchstart', handleTouchStart, false);
menuRight.addEventListener('touchmove', function (e) {
  handleTouchMove(e, 'right');
}, false);

var menuLeft = document.getElementsByClassName('menu-left')[0]
menuLeft.addEventListener('touchstart', handleTouchStart, false);
menuLeft.addEventListener('touchmove', function (e) {
  handleTouchMove(e, 'left');
}, false);

var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
};

function handleTouchMove(evt, direction) {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
    if (xDiff > 0) {
      /* left swipe */
      if (direction == 'left') {
        $(".close-menu").trigger('click')
      }

    } else {
      /* right swipe */
      if (direction == 'right') {
        $(".show-menu").trigger('click')
      }

    }
  } else {
    if (yDiff > 0) {
      /* up swipe */
    } else {
      /* down swipe */
    }
  }
  /* reset values */
  xDown = null;
  yDown = null;
};


$(document).ready(function () {
  setTimeout(function () {
    $("body").animate({
      opacity: 1
    }, 250)
  }, 500);

  if(!visited) {
    $('.pop-up').addClass('pop-visi')
  }

  $('.closed').on('click', function() {
    $(this).parent().addClass('pop-move')
  })
});