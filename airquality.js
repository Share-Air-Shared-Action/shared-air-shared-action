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
function createMarkers(manufacturer, community, season) {
    // Send the request to the api for the specified manufacturer
    $.getJSON("/airquality/api/" + manufacturer + "/ids/?season=" + season, function(devices) {
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
function buildChart(manufacturer, device_id, pollutant, season, scrollto) {

    // Build the API URL
    var url = "/airquality/api/" + manufacturer + "/chart/?device=" + device_id + "&season=" + season;

    // Request the data from API
    d3.json(url, function(error, data) {
        if (error) {
            return console.warn(error);
            $("#dropdown-helptext").html("<span style='color: red;'>" + error + "</span>");
        }
        if (data.x.length == 0) {
            $("#dropdown-helptext").html("<span style='color: red;'>The selected sensor did not return any data.</span>");
            resetMapAndChart(false);
            return console.warn("The selected sensor did not return any data.");
        } else {
            $("#dropdown-helptext").html("");
        }

        // Get the max and min date to center chart on
        var max_date = data.x[data.x.length - 1];
        var min_date = data.x['0'];

        // Max data point
        var max_data = Math.max.apply(null,data.y);

        // Set the chart width to the width of the chart's HTML element
        var chart_width = $("#chart").width();

        // Set layout settings
        var layout = {
            barmode: 'group',
            title: device_id + " data for " + season + " season",
            yaxis: {
                title: pollutant,
                range: [0, max_data + (0.1 * max_data)]
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
                if (aqivals[pollutant].hasOwnProperty("unit")) {
                    layout.yaxis.title = aqivals[pollutant].unit;
                }
                if (aqivals[pollutant].hasOwnProperty("scale")) {
                    $.each(aqivals[pollutant].scale, function(thisscale) {
                        aqivals[pollutant].scale[thisscale].x[0] = min_date;
                        aqivals[pollutant].scale[thisscale].x[1] = max_date;
                    });

                    Plotly.newPlot("chart", [data, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
                } else {
                    Plotly.newPlot("chart", [data], layout);
                }
            } else {
                Plotly.newPlot("chart", [data], layout);
            }
            if (scrollto) {
                // Scroll to the chart
                $('html, body').animate({
                    scrollTop: $("#chart").offset().top
                }, 1000);
            }
            $("#dropdown-helptext").html("");
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
    resetMapAndChart(true);
    resetPollutantandSensor();
}

function selectCommunity(community) {
    selected_community = community;
    $("#selected-community").text(community);
    resetMapAndChart(true);
    resetPollutantandSensor();
}

function selectSensorCategory(category) {
    selected_sensorcategory = category;
    $("#selected-sensorcategory").text(category);
    loadAvailablePollutants(category);
    resetMapAndChart(true);
    // Show the pollutant picker
    $("#dropdown-pollutant-container").css("display","inherit");
    resetPollutantandSensor();

}

function resetPollutantandSensor() {
    $("#selected-pollutant").text("Pollutant");
    selected_pollutant = "";

    // Hide the sensor picker
    $("#dropdown-sensor-container").css("display","none");
    selected_sensor = "";
}

function selectPollutant(pollutant) {
    selected_pollutant = $("<div>" + pollutant + "</div>").text();
    $("#selected-pollutant").html(pollutant);
    resetMapAndChart(true);
    updateMapForPollutant(selected_pollutant);
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
            shouldShowPicker = loadMobile("airterrier_co", selected_community, selected_season);
        }
    } else if (selected_pollutant == "CO2") {
        if (selected_sensorcategory == "Mobile") {
            shouldShowPicker = loadMobile("airterrier_co2", selected_community, selected_season);
        }
    } else if (selected_pollutant == "NO") {
        if (selected_sensorcategory == "Mobile") {
            shouldShowPicker = loadMobile("airterrier_no", selected_community, selected_season);
        }
    } else if (selected_pollutant == "NO2") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("aeroqual_no2", selected_community, selected_season);
            showSensorPicker();
        }
    } else if (selected_pollutant == "O3") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("aeroqual_o3", selected_community, selected_season);
            showSensorPicker();
        }
    } else if (selected_pollutant == "PM1.0") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm1.0", selected_community, selected_season);
            showSensorPicker();
        }
    } else if (selected_pollutant == "PM2.5") {
        if (selected_sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm2.5", selected_community, selected_season);
            createMarkers("metone_pm2.5", selected_community, selected_season);
            showSensorPicker();
        } else if (selected_sensorcategory == "Mobile") {
            shouldShowPicker = loadMobile("airterrier_pm2.5", selected_community, selected_season);
        }
    } else if (selected_pollutant == "PM10") {
        if (selected_sensorcategory == "Stationary") {
            // Load purpleairprimary_pm10
            createMarkers("purpleairprimary_pm10", selected_community, selected_season);
            showSensorPicker();
        }
    }
}

function showSensorPicker() {
    $("#dropdown-sensor-container").css("display","inherit");
    if (selected_sensorcategory == "Stationary") {
        $("#selected-sensor").text("Sensor");
    } else {
        $("#selected-sensor").text("Route");
    }
    selected_sensor = "";
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
    var scrollto = true;
    // Build the chart
    if (!position) {
        scrollto = false;
    }
    $("#dropdown-helptext").html("Loading...");
    buildChart(manufacturer, title, selected_pollutant, selected_season, scrollto);
    createSummaryTable(manufacturer, title, selected_season, selected_pollutant);

    // Set the menu to show the selected Sensor
    $("#selected-sensor").text(title);

    if (position) {
        // Center the map on the selected sensor
        airQualityMap.setCenter(position);
        airQualityMap.setZoom(18);
    } else {
        $("#dropdown-helptext").html("Loading...");
        selectLine(manufacturer, title, selected_pollutant, selected_season);
    }
}

function resetMapAndChart(resetSensorList) {
    // Clear markers from map
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];

    for (var i = 0; i < routes.length; i++) {
        routes[i].setMap(null);
    }
    routes = [];

    // Reset any selected line
    resetSelectedLine();

    // Hide the chart
    $("#chart").html("");

    // Hide the summary table
    $("#summary-table-container").html("");

    if (resetSensorList) {
        // Reset the sensor list
        $("#dropdown-sensor-container li").remove();
        if (selected_sensorcategory == "Stationary") {
            $("#selected-sensor").text("Sensor");
        } else {
            $("#selected-sensor").text("Route");
        }
    }
}

function loadMobile(manufacturer, community, season) {
    var bounds = new google.maps.LatLngBounds();
    $.getJSON("/airquality/api/" + manufacturer + "/ids/?season=" + season, function(eachroute) {
        var numRoutesDisplayed = 0;
        $.each(eachroute, function(route) {
            if (eachroute[route].community == community && eachroute[route].season == season) {
                createLine(manufacturer, eachroute[route].session_title, season);
                numRoutesDisplayed++;
            }
        });
        if (numRoutesDisplayed == 0) {
            $("#dropdown-helptext").html("<span style='color: red;'>No sensors found with the selected parameters.</span>");
        } else {
            showSensorPicker();
        }
    });
}

// This function creates the markers from the API
function createLine(manufacturer, route, season) {
    var polylinedata = [];
    // Send the request to the api for the specified manufacturer
    $.getJSON("/airquality/api/" + manufacturer + "/routes/?route=" + route + "&season=" + season, function(devices) {
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
                strokeColor: '#000000',
                strokeOpacity: 0.3,
                strokeWeight: 2,
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

var selectedLineData = [];
function selectLine(manufacturer, route, pollutant, season) {
    // Reset the selected line
    resetSelectedLine()
    var aqi = {
        unknown: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#000000',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        },
        good: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#00e400',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        },
        moderate: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FFFF00',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        },
        unhfsg: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF7E00',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        },
        unhealthy: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF0000',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        },
        veryunhealthy: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#99004C',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        },
        hazardous: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#7E0023',
            fillOpacity: 0.5,
            scale: 2.5,
            strokeWeight: 0
        }
    };
    // Plot the data with AQI scale, unit, and range if they are available
    $.getJSON("/airquality/api/aqi/", function(aqivals) {
        // Send the request to the api for the specified manufacturer
        $.getJSON("/airquality/api/" + manufacturer + "/routes/?route=" + route + "&season=" + season, function(devices) {
            var bounds = new google.maps.LatLngBounds();
            // For each device returned
            $.each(devices, function(key, device) {
                // put the data into the array
                var thislatlng = new google.maps.LatLng(device.latitude, device.longitude);
                var marker = new google.maps.Marker({
                    position: thislatlng,
                    map: airQualityMap,
                    icon: aqi.unknown
                });
                bounds.extend(thislatlng);

                if (aqivals.hasOwnProperty(pollutant)) {
                    if (aqivals[pollutant].hasOwnProperty("scale")) {
                        if (device.data <= aqivals[pollutant].scale.good.y[0]) {
                            marker.icon = aqi.good;
                        } else if (device.data <= aqivals[pollutant].scale.moderate.y[0]) {
                            marker.icon = aqi.moderate;
                        } else if (device.data <= aqivals[pollutant].scale.unhfsg.y[0]) {
                            marker.icon = aqi.unhfsg;
                        } else if (device.data <= aqivals[pollutant].scale.unhealthy.y[0]) {
                            marker.icon = aqi.unhealthy;
                        } else if (device.data <= aqivals[pollutant].scale.veryunhealthy.y[0]) {
                            marker.icon = aqi.veryunhealthy;
                        } else if (device.data > aqivals[pollutant].scale.veryunhealthy.y[0] ) {
                            marker.icon = aqi.hazardous;
                        } else {
                            marker.icon = aqi.unknown;
                        }
                    }
                } else {
                    marker.icon = aqi.unknown;
                }
                selectedLineData.push(marker);
            });
            // Zoom to the plotted points
            airQualityMap.fitBounds(bounds);

            // Remove the loading text
            $("#dropdown-helptext").html("");
        });
    });
}

function resetSelectedLine() {
    for (var i = 0; i < selectedLineData.length; i++) {
        selectedLineData[i].setMap(null);
    }
    selectedLineData = [];
}


function createSummaryTable(manufacturer, device, season, pollutant) {
    var summaryUrl = "/airquality/api/" + manufacturer + "/summary/?device=" + device + "&season=" + season;

    // Create the table
    $("#summary-table-container").html("<table id='summary-table'><thead><th data-dynatable-no-sort='true'>Date</th><th data-dynatable-no-sort='true' style='text-align: right;'>Average</th><th data-dynatable-no-sort='true' style='text-align: right;'>Max</th><th data-dynatable-no-sort='true' style='text-align: right;'>Min</th><th data-dynatable-no-sort='true' style='text-align: right;'>Average Temperature</th><th data-dynatable-no-sort='true' style='text-align: right;'>Relative Humidity</th><th data-dynatable-no-sort='true' style='text-align: right;'>Average Wind Speed</th></thead><tbody></tbody></table>");

    // Load the data into the table
    $('#summary-table').dynatable({
     features: {
       paginate: false,
       search: false,
       recordCount: false
     },
     dataset: {
       ajax: true,
       ajaxOnLoad: true,
       ajaxUrl: summaryUrl,
       records: []
     },
     params: {
       records: '_root'
     }
    });
}
