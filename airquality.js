// Initialize the variable for the map
var airQualityMap;

// Initialize an array for markers and routes
var markers = [];
var routes = [];

// Initialize variables for each selection menu
var selected_community;
var selected_season;
var selected_sensorcategory;
var selected_pollutant;
var selected_sensor;

// This function is called once the Google Maps API loads
function initMap() {
    // Get the map object
    var mapCanvas = document.getElementById('map');

    // Center the map on the Chicago area
    var centerloc = new google.maps.LatLng(41.7923412, -87.6030669);

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
        $.each(devices, function(key, device) {
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
                $("#dropdown-sensor-container ul").append("<li><a href='javascript:handleSensorClick(" + '"' + manufacturer + '","' + marker.title + '", new google.maps.LatLng(' + device.latitude + ', ' + device.longitude + '));' + "'>" + deviceTitle + "</a></li>");
            }
            if (markers.length > 0) {
                fitMaptoMarkers();
                $("#dropdown-helptext").html("");
            } else {
                $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
            }

        });
    });
}

// This function builds the Plot.ly chart
function buildChart(manufacturer, device_id, pollutant, season) {

    // Build the API URL
    var url = "/airquality/api/" + manufacturer + "/chart/?device=" + device_id + "&season=" + season;

    // Request the data from API
    d3.json(url, function(error, data) {
        if (error) {
            return console.warn(error);
        }

        // Get the max and min date to center chart on
        var max_date = data.x[data.x.length - 1];
        var min_date = data.x['0'];

        // Set the chart width to the width of the chart's HTML element
        var chart_width = $("#chart").width();

        // Set layout settings
        var layout = {
            barmode: 'group',
            title: device_id + " data for " + season + " season",
            yaxis: {
                title: pollutant
            },
            xaxis: {
                range: [min_date, max_date],
                title: 'Date and Time'
            },
            width: chart_width - 25,
            height: 700,
            autosize: false
        };

        // Plot the data with AQI scale, unit, and range if they are available
        $.getJSON("/airquality/api/aqi/", function(aqivals) {
            if (aqivals.hasOwnProperty(pollutant)) {
                if (aqivals[pollutant].hasOwnProperty("range")) {
                    layout.yaxis.range = aqivals[pollutant].range;
                }
                if (aqivals[pollutant].hasOwnProperty("unit")) {
                    layout.yaxis.title = aqivals[pollutant].unit;
                }
                if (aqivals[pollutant].hasOwnProperty("scale")) {
                    Plotly.newPlot("chart", [data, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
                } else {
                    Plotly.newPlot("chart", [data], layout);
                }
            } else {
                Plotly.newPlot("chart", [data], layout);
            }
            // Scroll to the chart
            $('html, body').animate({
                scrollTop: $("#chart").offset().top
            }, 1000);
        });
    });
}

// Load in the communities into the dropdown
$.getJSON("/airquality/api/communities/", function(communities) {

    // For each community returned
    $.each(communities, function(community) {
        // Add it to the community dropdown menu
        $("#dropdown-community-container ul").append("<li><a>" + communities[community].community + "</a></li>");
    });

    // For each item in the community dropdown menu
    $("#dropdown-community-container ul li").each(function() {
        // Create a click handler
        $(this).click(function() {
            // Set the menu text to the text of the clicked item
            selectCommunity($(this).text())
        });
    });
});


function selectSeason(season) {
    selected_season = season;
    $("#selected-season").text(season);
    resetMapAndChart();
}

function selectCommunity(community) {
    selected_community = community;
    $("#selected-community").text(community);
    resetMapAndChart();
}

function selectSensorCategory(category) {
    selected_sensorcategory = category;
    $("#selected-sensorcategory").text(category);
    loadAvailablePollutants(category);
    resetMapAndChart();

    // Show the pollutant picker
    $("#dropdown-pollutant-container").css("display","inherit");
    $("#selected-pollutant").text("Pollutant");
    selected_pollutant = "";

    // Hide the sensor picker
    $("#dropdown-sensor-container").css("display","hidden");
    selected_sensor = "";
}

function selectPollutant(pollutant) {
    selected_pollutant = $("<div>" + pollutant + "</div>").text();
    $("#selected-pollutant").html(pollutant);
    resetMapAndChart();
    updateMapForPollutant(selected_pollutant);

    // Show the sensor picker
    $("#dropdown-sensor-container").css("display","inherit");
    $("#selected-sensor").text("Sensor");
    selected_sensor = "";
}

function loadAvailablePollutants(category) {
    // Clear the list
    $("#dropdown-pollutant-container li").remove();
    $("#selected-pollutant").text("Pollutant");

    // Build the list
    if (category == "Stationary") {
        // NO2, O3, PM1.0, PM2.5, PM10
        $("#dropdown-pollutant-container ul").append("<li><a>NO<sub>2</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>O<sub>3</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>1.0</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>2.5</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>10</sub></a></li>");
    } else if (category == "Mobile") {
        // CO, CO2, NO, PM2.5
        $("#dropdown-pollutant-container ul").append("<li><a>CO</a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>CO<sub>2</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>NO</a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>2.5</sub></a></li>");
    } else {
        console.warn("Invalid senosr category selected");
    }

    // Create the event handlers
    $("#dropdown-pollutant-container ul li").each(function() {
        // Create a click handler
        $(this).click(function() {
            // Set the menu text to the text of the clicked item
            selectPollutant($(this).find("a").html());
        });
    });
}

function updateMapForPollutant(pollutant) {
    if (pollutant == "CO") {
        if (selected_sensorcategory == "Mobile") {
            loadMobile("airterrier_co", selected_community, selected_season);
        }
    } else if (selected_pollutant == "CO2") {
        if (selected_sensorcategory == "Mobile") {
            loadMobile("airterrier_co2", selected_community, selected_season);
        }
    } else if (selected_pollutant == "NO") {
        if (selected_sensorcategory == "Mobile") {
            loadMobile("airterrier_no", selected_community, selected_season);
        }
    } else if (selected_pollutant == "NO2") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("aeroqual_no2", selected_community);
        }
    } else if (selected_pollutant == "O3") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("aeroqual_o3", selected_community);
        }
    } else if (selected_pollutant == "PM1.0") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm1.0", selected_community);
        }
    } else if (selected_pollutant == "PM2.5") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm2.5", selected_community);
            createMarkers("metone_pm2.5", selected_community);
        } else if (selected_sensorcategory == "Mobile") {
            loadMobile("airterrier_pm2.5", selected_community, selected_season);
        }
    } else if (selected_pollutant == "PM10") {
        if (selected_sensorcategory == "Stationary") {
            // Load purpleairprimary_pm10
            createMarkers("purpleairprimary_pm10", selected_community);
        }
    }
}



// Create the event handlers for the dropdown selectors

// For each item in the Season dropdown menu
$("#dropdown-season-container ul li").each(function() {
    // Create a click handler
    $(this).click(function() {
        selectSeason($(this).text());
    });
});

// For each item in the Sensor Category dropdown menu
$("#dropdown-sensorcategory-container ul li").each(function() {
    // Create a click handler
    $(this).click(function() {
        selectSensorCategory($(this).text());
    });
});

// Zoom the map to the markers or routes available to pick from
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
    // Build the chart
    buildChart(manufacturer, title, selected_pollutant, selected_season);

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

function loadMobile(manufacturer, community, season) {
    var bounds = new google.maps.LatLngBounds();
    $.getJSON("/airquality/api/" + manufacturer + "/ids/", function(eachroute) {
        $.each(eachroute, function(route) {
            if (eachroute[route].community == community && eachroute[route].season == season) {
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
        $.each(devices, function(key, device) {
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
            $("#dropdown-sensor-container ul").append("<li><a href='javascript:handleSensorClick(" + '"' + manufacturer + '","' + route + '",null);' + "'>" + route + "</a></li>");
        }
        if (routes.length > 0) {
            fitMaptoMarkers();
            $("#selected-sensor").text("Route");
            $("#dropdown-helptext").html("");
        } else {
            $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
        }
    });
}
