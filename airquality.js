var airQualityMap;
function initMap() {
    var mapCanvas = document.getElementById('map');
    var centerloc = new google.maps.LatLng(41.7923412,-87.6030669);
    var mapOptions = {
            center: centerloc,
            zoom: 9,
            panControl: true,
            scrollwheel: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    airQualityMap = new google.maps.Map(mapCanvas, mapOptions);
    loadAllMarkers();
}

function loadAllMarkers() {
    createMarkers("metone");
    // temporarily move map to location of metone sensors.
    var metoneSensorLocation = new google.maps.LatLng(42.465796, -123.321033);
    airQualityMap.panTo(metoneSensorLocation);
    airQualityMap.setZoom(18);
}

function createMarkers(manufacturer) {
    // Send the request to the api for the specified manufacturer
    $.getJSON("/airquality/api/" + manufacturer + "/ids/", function(devices) {

        // For each device returned
    	$.each(devices, function(key,device) {
            // Get the device's lat and long and create a Google Maps LatLng
            var deviceLatLng = new google.maps.LatLng(device.latitude, device.longitude);

            // Get the device's title
            var deviceTitle = device.device;

            // Create a marker on the map for the device
            var marker = new google.maps.Marker({
                position: deviceLatLng,
                title: deviceTitle,
                map: airQualityMap
            });

            // Create an event listener for the marker
            marker.addListener('click', function() {
                buildChart(manufacturer, marker.title);
            });
    	});
    });
}

function buildChart(manufacturer, device_id) {
	var url = "/airquality/api/" + manufacturer + "/chart/?device=" + device_id;

	d3.json(url, function(error, data) {
	      if (error) {
	              return console.warn(error);
	      }
          var min_date = data.x[data.x.length - 1];
          var max_date = data.x['0'];

	  var chart_width = (window.innerWidth || document.body.clientWidth);
	  console.log(chart_width);

	      var layout = {
              barmode: 'group',
              yaxis: {
                  range: [0, 60],
                  title: "PM2.5 (µg/m3)"
              },
              xaxis: {
                  range: [min_date, max_date],
                  title: 'Date and Time'
              },
	      width: chart_width - 25,
	      heigth: 600,
	      autosize: false
          };

          // Get the mix and max dates from the data to build the AQI scale


          //,line:{color:'rgb(255,255,0)'}

          var aqi_good = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[12.0,12.0],fill:'tozeroy',type:'scatter',mode:'none',name:'0.0 - 12.0 - Good',fillcolor:'rgba(0,228,0,0.5)'};
          var aqi_moderate = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[35.4,35.4],fill:'tonexty',type:'scatter',mode:'none',name:'12.1 - 35.4 - Moderate',fillcolor:'rgba(255,255,0,0.5)'};
          var aqi_unhfsg = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[55.4,55.4],fill:'tonexty',type:'scatter',mode:'none',name:'35.5-55.4 - Unhealthy for Sensitive Groups',fillcolor:'rgba(255,126,0,0.5)'};
          var aqi_unhealthy = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[150.4,150.4],fill:'tonexty',type:'scatter',mode:'none',name:'55.5-150.4 - Unhealthy',fillcolor:'rgba(255,0,0,0.5)'};
          var aqi_veryunhealthy = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[250.4,250.4],fill:'tonexty',type:'scatter',mode:'none',name:'150.5-250.4 - Very Unhealthy',fillcolor:'rgba(153,0,76,0.5)'};
          var aqi_hazardous = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[99999,99999],fill:'tonexty',type:'scatter',mode:'none',name:'250.5+ - Hazardous',fillcolor:'rgba(126,0,35,0.5)'};

	      Plotly.newPlot("chart", [data, aqi_good, aqi_moderate, aqi_unhfsg, aqi_unhealthy, aqi_veryunhealthy, aqi_hazardous], layout);
	});
}
