// Initialize the variable for the map
var airQualityMap;

// Initialize an array for markers and routes
var markers = [];
var routes = [];

// This function is called once the Google Maps API loads
function initMap() {
    // Get the map object
    var mapCanvas = document.getElementById('map');

    // Center the map on the Chicago area
    var centerloc = new google.maps.LatLng(41.7923412,-87.6030669);

    // Set the map options
    var mapOptions = {
            center: centerloc,
            zoom: 10,
            panControl: true,
            scrollwheel: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // Create the map and store it in the variable
    airQualityMap = new google.maps.Map(mapCanvas, mapOptions);

}


// This function creates the markers from the API
function createMarkers(manufacturer, community) {
    // Send the request to the api for the specified manufacturer
    $.getJSON("/airquality/api/" + manufacturer + "/ids/", function(devices) {
        // For each device returned
    	$.each(devices, function(key,device) {
            // If the device is in the community
            if (device.community == community) {
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
                    handleSensorClick(manufacturer, marker.title, deviceLatLng);
                });
                markers.push(marker);

                // Populate the menu
                $("#dropdown-sensor-container ul").append("<li><a href='javascript:handleSensorClick(" + '"' + manufacturer + '","' + marker.title +  '", new google.maps.LatLng(' + device.latitude + ', ' + device.longitude + '));' + "'>" + deviceTitle + "</a></li>");
            }
            if (markers.length > 0) {
                fitMaptoMarkers();
                $("#dropdown-sensor-container").css("display","initial");
                $("#dropdown-helptext").text("Now choose which station to display on the map or in the menu.");
            } else {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            }

    	});
    });
}

// This function builds the Plot.ly chart
// TODO: Add season functionality (function parameter passed as [+ "&season=" + season] in the url)
function buildChart(manufacturer, device_id, pollutant) {
	var url = "/airquality/api/" + manufacturer + "/chart/?device=" + device_id;
	d3.json(url, function(error, data) {
	      if (error) {
	              return console.warn(error);
	      }
          var max_date = data.x[data.x.length - 1];
          var min_date = data.x['0'];

	  var chart_width = $("#chart").width();

	      var layout = {
              barmode: 'group',
              yaxis: {
                  //range: [0, 60],
                  title: pollutant
              },
              xaxis: {
                  range: [min_date, max_date],
                  title: 'Date and Time'
              },
	      width: chart_width - 25,
	      height: 600,
	      autosize: false
          };

          // These variables represent the AQI for the data.
          var aqi_good = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[12.0,12.0],fill:'tozeroy',type:'scatter',mode:'none',name:'0.0 - 12.0 - Good',fillcolor:'rgba(0,228,0,0.5)'};
          var aqi_moderate = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[35.4,35.4],fill:'tonexty',type:'scatter',mode:'none',name:'12.1 - 35.4 - Moderate',fillcolor:'rgba(255,255,0,0.5)'};
          var aqi_unhfsg = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[55.4,55.4],fill:'tonexty',type:'scatter',mode:'none',name:'35.5-55.4 - Unhealthy for Sensitive Groups',fillcolor:'rgba(255,126,0,0.5)'};
          var aqi_unhealthy = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[150.4,150.4],fill:'tonexty',type:'scatter',mode:'none',name:'55.5-150.4 - Unhealthy',fillcolor:'rgba(255,0,0,0.5)'};
          var aqi_veryunhealthy = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[250.4,250.4],fill:'tonexty',type:'scatter',mode:'none',name:'150.5-250.4 - Very Unhealthy',fillcolor:'rgba(153,0,76,0.5)'};
          var aqi_hazardous = { x:["1980-01-01 00:00:00", "2500-01-01 00:00:00"], y:[99999,99999],fill:'tonexty',type:'scatter',mode:'none',name:'250.5+ - Hazardous',fillcolor:'rgba(126,0,35,0.5)'};
          // Removing the scale temporarily
          // , aqi_good, aqi_moderate, aqi_unhfsg, aqi_unhealthy, aqi_veryunhealthy, aqi_hazardous

          // Plot the data
	      Plotly.newPlot("chart", [data], layout);

          // Scroll to the chart
          $('html, body').animate({
              scrollTop: $("#chart").offset().top
          }, 1000);
	});
}





// Load in the communities into the dropdown
$.getJSON("/airquality/api/communities/", function(communities) {

    // For each community returned
    $.each(communities, function(community) {
        // Add it to the community dropdown menu
        $("#dropdown-community-container ul").append("<li><a href='#'>" + communities[community].community + "</a></li>");
    });

    // For each item in the community dropdown menu
    $("#dropdown-community-container ul li").each(function() {
        // Create a click handler
        $(this).click(function() {
            // Set the menu text to the text of the clicked item
            $("#selected-community").text($(this).text());
            // Unhide the next menu and re-hide the other following menus
            $("#dropdown-season-container").css("display","initial");
            $("#dropdown-sensorcategory-container").css("display","none");
            $("#dropdown-pollutant-container").css("display","none");
            $("#dropdown-sensor-container").css("display","none");
            // Tell the user to choose the next item
            $("#dropdown-helptext").text("Now choose a season.");
            $("#selected-season").text("Season");
            resetMapAndChart();
        });
    });
});

// Create the event handlers for the dropdown selectors

// For each item in the Season dropdown menu
$("#dropdown-season-container ul li").each(function() {
    // Create a click handler
    $(this).click(function() {
        // Set the menu text to the text of the clicked item
        $("#selected-season").text($(this).text());
        // Unhide the next menu and re-hide the other following menus
        $("#dropdown-sensorcategory-container").css("display","initial");
        $("#dropdown-pollutant-container").css("display","none");
        $("#dropdown-sensor-container").css("display","none");
        // Tell the user to choose the next item
        $("#dropdown-helptext").text("Now choose between stationary sensors or mobile sensors.");
        $("selected-sensorcategory").text("Sensor Category");
        resetMapAndChart();
    });
});

// For each item in the Sensor Category dropdown menu
$("#dropdown-sensorcategory-container ul li").each(function() {
    // Create a click handler
    $(this).click(function() {
        // Set the menu text to the text of the clicked item
        $("#selected-sensorcategory").text($(this).text());
        // re-hide the other following menus and show the next menu
        $("#dropdown-pollutant-container").css("display","initial");
        $("#dropdown-sensor-container").css("display","none");
        // Tell the user to choose the next item
        $("#dropdown-helptext").text("Now choose which pollutant to display.");
        $("#selected-pollutant").text("Pollutant");
        resetMapAndChart();
    });
});

// For each item in the Pollutant dropdown menu
$("#dropdown-pollutant-container ul li").each(function() {
    // Create a click handler
    $(this).click(function() {
        // Set the menu text to the text of the clicked item
        $("#selected-pollutant").html($(this).find("a").html());

        resetMapAndChart();

        // Update the map to display pollutants of this type in the selected neighborhood
        if ($(this).find("a").html() == "NO<sub>2</sub>") {
            if ($("#selected-sensorcategory").text() == "Stationary") {
                // Load aeroqualno2
                createMarkers("aeroqualno2", $("#selected-community").text());
            } else if ($("#selected-sensorcategory").text() == "Mobile") {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            }

        } else if ($(this).find("a").html() == "O<sub>3</sub>") {
            if ($("#selected-sensorcategory").text() == "Stationary") {
                // Load aeroqualo3
                createMarkers("aeroqualo3", $("#selected-community").text());
            } else if ($("#selected-sensorcategory").text() == "Mobile") {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            }

        } else if ($(this).find("a").html() == "PM") {
            if ($("#selected-sensorcategory").text() == "Stationary") {
                // Load purpleairprimary_pm1
                createMarkers("purpleairprimary_pm1", $("#selected-community").text());
            } else if ($("#selected-sensorcategory").text() == "Mobile") {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            }

        } else if ($(this).find("a").html() == "PM<sub>2.5</sub>") {
            if ($("#selected-sensorcategory").text() == "Stationary") {
                // Load purpleairprimary_pm1
                createMarkers("purpleairprimary_pm2.5", $("#selected-community").text());
                // Load metone
                createMarkers("metone", $("#selected-community").text());
            } else if ($("#selected-sensorcategory").text() == "Mobile") {
                loadMobile("airterrier_pm2.5", $("#selected-community").text());
            }

        } else if ($(this).find("a").html() == "PM<sub>10</sub>") {
            if ($("#selected-sensorcategory").text() == "Stationary") {
                // Load purpleairprimary_pm10
                createMarkers("purpleairprimary_pm10", $("#selected-community").text());
            } else if ($("#selected-sensorcategory").text() == "Mobile") {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            }
        } else if ($(this).find("a").html() == "CO") {
            if ($("#selected-sensorcategory").text() == "Stationary") {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            } else if ($("#selected-sensorcategory").text() == "Mobile") {
                loadMobile("airterrier_co", $("#selected-community").text());
            }
        }
    });
});

function fitMaptoMarkers() {
    console.log("fitting map to markers and lines");
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    for (var i = 0; i < routes.length; i++) {
        for (var j = 0; j < routes[i].latLngs.b[0].b.length; j++) {
            bounds.extend(routes[i].latLngs.b[0].b[j]);
        }
    }
    airQualityMap.fitBounds(bounds);
}


function handleSensorClick(manufacturer, title, position) {
    // Get the selected pollutant from the page
    var selectedPollutant = $("#selected-pollutant").text();

    // Build the chart
    buildChart(manufacturer, title, selectedPollutant)

    // Set the menu to show the selected Sensor
    $("#selected-sensor").text(title);

    if (position) {
        // Center the map on the selected sensor
        airQualityMap.setCenter(position);
        airQualityMap.setZoom(18);
    }
}


function resetMapAndChart() {
    // Clear markers from map
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];

    for (var i = 0; i < routes.length; i++) {
        routes[i].setMap(null);
    }
    routes = [];

    // Hide the chart
    $("#chart").html("");

    // Reset the sensor list
    $("#dropdown-sensor-container li").remove();
    $("#selected-sensor").text("Sensor");
}






function loadMobile(manufacturer, community) {
    var bounds = new google.maps.LatLngBounds();
    $.getJSON("/airquality/api/" + manufacturer + "/ids/", function(eachroute) {
        $.each(eachroute, function(route) {
            if (eachroute[route].community == community) {
                createLine(manufacturer, eachroute[route].session_title);
            }
        });
    });
}



// This function creates the markers from the API
function createLine(manufacturer, route) {
    var polylinedata = [];
    // Send the request to the api for the specified manufacturer
    $.getJSON("/airquality/api/" + manufacturer + "/routes/?route=" + route, function(devices) {
        // For each device returned
    	$.each(devices, function(key,device) {
            // put the data into the array
            var thislatlng = new google.maps.LatLng(device.latitude, device.longitude);
            polylinedata.push(thislatlng);
    	});
        if (polylinedata.length > 0) {
            var line = new google.maps.Polyline({
                path: polylinedata,
                geodesic: true,
                strokeColor: '#F76458',
                strokeOpacity: 1.0,
                strokeWeight: 4,
                map: airQualityMap
            });
            routes.push(line);
            line.addListener('click', function() {
                handleSensorClick(manufacturer, route, null);
            });

            // Populate the menu
            $("#dropdown-sensor-container ul").append("<li><a href='javascript:handleSensorClick(" + '"' + manufacturer + '","' + route +  '",null);' + "'>" + route + "</a></li>");
        }
        if (routes.length > 0) {
            fitMaptoMarkers();
            $("#dropdown-sensor-container").css("display","initial");
            $("#selected-sensor").text("Route");
            $("#dropdown-helptext").text("Now choose which route to display from the map or in the menu.");
        } else {
            $("#dropdown-sensor-container").css("display","none");
            $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
        }
    });
}








//
