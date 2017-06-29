// Initialize the variable for the map
var airQualityMap;

// Initialize arrays for markers and routes
var markers = [];
var routes = [];
var selectedLineData = [];

// Initialize variables for each selection menu
var selected_community;
var selected_season;
var selected_sensorcategory;
var selected_pollutant;
var selected_sensor;

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

/**
 * Loads the Google Map object on callback from Google Maps API
 */
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

    // Load previous selection if available
    loadPreviousSelection();
}

/**
 * Creates markers and adds each sensor the list
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} community    The name of the community.
 * @param  {string} season       The name of the season from which you want to get data.
 */
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
                var menuList = $("#dropdown-sensor-container ul");
                menuList.append("<li><a href='javascript:handleSensorClick(" + '"' + manufacturer + '","' + marker.title + '", new google.maps.LatLng(' + device.latitude + ', ' + device.longitude + '));' + "'>" + deviceTitle + "</a></li>");
                // Sort the menu alphabetically
                menuList.children().detach().sort(function(a, b) {
                    return $(a).text().localeCompare($(b).text());
                }).appendTo(menuList);
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

/**
 * Builds a Plot.ly chart from using the provided parameters.
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} device       The name of the specific sensor/route to display
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 * @param  {string} season       The name of the season from which you want to get data.
 * @param  {bool}   scrollto     If true, once the chart is loaded the DOM will scroll to it.
 */
function buildChart(manufacturer, device, pollutant, season, scrollto) {

    // Build the API URL
    var url = "/airquality/api/" + manufacturer + "/chart/?device=" + device + "&season=" + season;

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
            title: device + " data for " + season + " season",
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

/**
 * Handles the selection of a season
 * @param  {string} season The name of the season from which you want to get data.
 */
function selectSeason(season) {
    selected_season = season;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("season", season);
    }
    $("#selected-season").text(season);
    resetMapAndChart(true);
    resetPollutantandSensor();
}

/**
 * Handles the selection of a community
 * @param  {string} community  The name of the community.
 */
function selectCommunity(community) {
    selected_community = community;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("community", community);
    }
    $("#selected-community").text(community);
    resetMapAndChart(true);
    resetPollutantandSensor();
}

/**
 * Handles the selection of a sensor category
 * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes
 */
function selectSensorCategory(sensorcategory) {
    selected_sensorcategory = sensorcategory;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("sensorcategory", sensorcategory);
    }
    $("#selected-sensorcategory").text(sensorcategory);
    loadAvailablePollutants(sensorcategory);
    resetMapAndChart(true);

    // Show the pollutant picker
    $("#dropdown-pollutant-container").css("display","inherit");
    resetPollutantandSensor();

}

/**
 * Resets the selected pollutant and sensor
 */
function resetPollutantandSensor() {
    // Reset text
    $("#selected-pollutant").text("Pollutant");

    // Reset selected pollutant
    selected_pollutant = "";
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("pollutant", "");
    }

    // Hide the sensor picker
    $("#dropdown-sensor-container").css("display","none");

    // Reset the selected sensor
    selected_sensor = "";
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("sensor", "");
    }
}

/**
 * Handles the selection of a pollutant
 * @param  {string} pollutant The pollutant selected
 */
function selectPollutant(pollutant) {
    // Set the selected pollutant, stripping any HTML
    selected_pollutant = $("<div>" + pollutant + "</div>").text();
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("pollutant", selected_pollutant);
    }

    // Set the text to the pollutant with HTML
    $("#selected-pollutant").html(pollutant);

    // Reset the map and chart, and the sensor list
    resetMapAndChart(true);

    // Update the map to show sensors for the selected pollutant
    updateMap(selected_pollutant, selected_sensorcategory, selected_community, selected_season);
}

/**
 * Populates the pollutant menu with the available pollutants based on the sensor category.
 * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes
 */
function loadAvailablePollutants(sensorcategory) {
    // Clear the list
    $("#dropdown-pollutant-container li").remove();

    // Reset the text to Pollutant
    $("#selected-pollutant").text("Pollutant");

    // Build the list
    if (sensorcategory == "Stationary") {
        // NO2, O3, PM1.0, PM2.5, PM10
        $("#dropdown-pollutant-container ul").append("<li><a>NO<sub>2</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>O<sub>3</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>1.0</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>2.5</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>10</sub></a></li>");
    } else if (sensorcategory == "Mobile") {
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

/**
 * Loads the correct sensors/routes based on the pollutant.
 * @param  {string} pollutant      The pollutant to load.
 * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes
 * @param  {string} community      The name of the community.
 * @param  {string} season         The name of the season from which you want to get data.
 */
function updateMap(pollutant, sensorcategory, community, season) {
    if (pollutant == "CO") {
        if (sensorcategory == "Mobile") {
            loadMobile("airterrier_co", community, season);
        }
    } else if (selected_pollutant == "CO2") {
        if (sensorcategory == "Mobile") {
            loadMobile("airterrier_co2", community, season);
        }
    } else if (selected_pollutant == "NO") {
        if (sensorcategory == "Mobile") {
            loadMobile("airterrier_no", community, season);
        }
    } else if (selected_pollutant == "NO2") {
        if (sensorcategory == "Stationary") {
            createMarkers("aeroqual_no2", community, season);
            showSensorPicker();
        }
    } else if (selected_pollutant == "O3") {
        if (sensorcategory == "Stationary") {
            createMarkers("aeroqual_o3", community, season);
            showSensorPicker();
        }
    } else if (selected_pollutant == "PM1.0") {
        if (sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm1.0", community, season);
            showSensorPicker();
        }
    } else if (selected_pollutant == "PM2.5") {
        if (sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm2.5", community, season);
            createMarkers("metone_pm2.5", community, season);
            showSensorPicker();
        } else if (sensorcategory == "Mobile") {
            loadMobile("airterrier_pm2.5", community, season);
        }
    } else if (selected_pollutant == "PM10") {
        if (sensorcategory == "Stationary") {
            // Load purpleairprimary_pm10
            createMarkers("purpleairprimary_pm10", community, season);
            createMarkers("metone_pm10", community, season);
            showSensorPicker();
        }
    }
}

/**
 * Shows the sensor/route picker menu, and changes the text to be relevant
 */
function showSensorPicker() {
    $("#dropdown-sensor-container").css("display","inherit");
    if (selected_sensorcategory == "Stationary") {
        $("#selected-sensor").text("Sensor");
    } else {
        $("#selected-sensor").text("Route");
    }
    selected_sensor = "";
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("sensor", "");
    }
}

/**
 * Zooms the map to display only the sensors/routes available to pick from
 */
function fitMaptoMarkers() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    for (var i = 0; i < routes.length; i++) {
        for (var j = 0; j < routes[i].line.latLngs.b[0].b.length; j++) {
            bounds.extend(routes[i].line.latLngs.b[0].b[j]);
        }
    }
    airQualityMap.fitBounds(bounds);
}

/**
 * Handles the click or selection of a sensor/route.
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} device       The name of the specific sensor/route to display
 * @param  {string} position     The position of the device to center on. For routes, set to null.
 */
function handleSensorClick(manufacturer, device, position) {
    selected_sensor = device;
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("sensorManufacturer", manufacturer);
        localStorage.setItem("sensorTitle", device);
        localStorage.setItem("sensorPosition", position);
    }
    var scrollto = true;
    // Build the chart
    if (!position) {
        scrollto = false;
    }
    $("#dropdown-helptext").html("Loading...");
    buildChart(manufacturer, device, selected_pollutant, selected_season, scrollto);
    createSummaryTable(manufacturer, device, selected_season, selected_pollutant);

    // Set the menu to show the selected Sensor
    $("#selected-sensor").text(device);

    if (position) {
        // Center the map on the selected sensor
        airQualityMap.setCenter(position);
        airQualityMap.setZoom(18);
    } else {
        $("#dropdown-helptext").html("Loading...");
        selectLine(manufacturer, device, selected_pollutant, selected_season);
    }
}

/**
 * Clears any features from the map, hides the chart/summary table
 * @param {bool} resetSensorList If true, resets the senosr list along with the map/chart/table.
 */
function resetMapAndChart(resetSensorList) {
    // Clear markers from map
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];

    for (var i = 0; i < routes.length; i++) {
        routes[i].line.setMap(null);
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

/**
 * Loads mobile routes into the list/onto the map
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} community    The name of the community.
 * @param  {string} season       The name of the season from which you want to get data.
 */
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

/**
 * Creates the Polyline from the route's lat/longs.
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} route        The name of the specific line/route clicked.
 * @param  {string} season       The name of the season from which you want to get data.
 */
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
            routes.push({"line": line, "name": route});
            line.addListener('click', function() {
                handleSensorClick(manufacturer, route, null);
            });

            // Populate the menu
            var menuList = $("#dropdown-sensor-container ul");
            menuList.append("<li><a href='javascript:handleSensorClick(" + '"' + manufacturer + '","' + route + '",null);' + "'>" + route + "</a></li>");
            // Sort the menu alphabetically
            menuList.children().detach().sort(function(a, b) {
                return $(a).text().localeCompare($(b).text());
            }).appendTo(menuList);
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

// This function creates markers on the map for each data point in the selected route.
// If the pollutant has an AQI scale, it uses that to color the marker.
/**
 * Handles the click/selection of a line/route.
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} route        The name of the specific line/route clicked.
 * @param  {string} season       The name of the season from which you want to get data.
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 */
function selectLine(manufacturer, route, pollutant, season) {
    // Reset the selected line
    resetSelectedLine()

    // Hide other lines
    hideOtherLines(route);

    // Create colored markers for each different AQI
    // TODO: Move this outside of the function, as it is static.
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
            var everyother = false;
            if (devices.length > 400) {
                console.log("There are " + devices.length + " points in the selected route. Showing every 4th point on map.");
                everyother = true;
            }
            var counter = 0;
            $.each(devices, function(key, device) {
                counter++;
                if (everyother) {
                    if (counter % 4) {
                        // Skip this data point.
                        return(true);
                    }
                }
                // Create a Google Maps LatLng for the device
                var thislatlng = new google.maps.LatLng(device.latitude, device.longitude);

                // Build the marker, defaulting to unknown icon.
                var marker = new google.maps.Marker({
                    position: thislatlng,
                    map: airQualityMap,
                    icon: aqi.unknown
                });

                // Extend the bounds for zooming
                bounds.extend(thislatlng);

                // If the AQI API has an entry for this pollutant type
                if (aqivals.hasOwnProperty(pollutant)) {
                    // If the AQI API entry has a scale
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
                // Otherwise set to unknown (black circle for marker)
                } else {
                    marker.icon = aqi.unknown;
                }
                // Add the point to the array
                selectedLineData.push(marker);
            });
            // Zoom to the plotted points
            airQualityMap.fitBounds(bounds);

            // Remove the loading text
            $("#dropdown-helptext").html("");
        });
    });
}

/**
 * Hides lines/routes other than the selected line/route
 * @param  {string} nameToShow The name of the route to show
 */
function hideOtherLines(nameToShow) {
    for (var i = 0; i < routes.length; i++) {
        if (!(routes[i].name == nameToShow)) {
            routes[i].line.setMap(null);
        }
    }
}

/**
 * Removes data points from the selected line/route, unhides other lines/routes.
 */
function resetSelectedLine() {
    // Remove each marker from the map
    for (var i = 0; i < selectedLineData.length; i++) {
        selectedLineData[i].setMap(null);
    }

    // Dereference the markers
    selectedLineData = [];

    // Unhide other lines
    for (var i = 0; i < routes.length; i++) {
        routes[i].line.setMap(airQualityMap);
    }
}

/**
 * Creates a table object and loads summary data from the API based on parameters
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} device       The name of the specific sensor/route to display
 * @param  {string} season       The name of the season from which you want to get data.
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 */
function createSummaryTable(manufacturer, device, season, pollutant) {
    var summaryUrl = "/airquality/api/" + manufacturer + "/summary/?device=" + device + "&season=" + season;

    // Create the table HTML with headers
    $("#summary-table-container").html("<table id='summary-table'><thead><th data-dynatable-no-sort='true'>Date</th><th data-dynatable-no-sort='true' style='text-align: right;'>Average</th><th data-dynatable-no-sort='true' style='text-align: right;'>Max</th><th data-dynatable-no-sort='true' style='text-align: right;'>Min</th><th data-dynatable-no-sort='true' style='text-align: right;'>Temperature</th><th data-dynatable-no-sort='true' style='text-align: right;'>Dewpoint</th><th data-dynatable-no-sort='true' style='text-align: right;'>Pressure</th><th data-dynatable-no-sort='true' style='text-align: right;'>Altitude</th><th data-dynatable-no-sort='true' style='text-align: right;'>Windspeed</th></thead><tbody></tbody></table>");

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


/**
 * Loads from localStorage the previously-selected state of the app.
 */
function loadPreviousSelection() {
    if (typeof(Storage) !== "undefined") {
        var loadCommunity = localStorage.getItem("community");
        var loadSeason = localStorage.getItem("season");
        var loadSensorCategory = localStorage.getItem("sensorcategory");
        var loadPollutant = localStorage.getItem("pollutant");
        var loadSensorManufacturer = localStorage.getItem("sensorManufacturer");
        var loadSensorTitle = localStorage.getItem("sensorTitle");
        var loadSensorPosition = localStorage.getItem("sensorPosition");
        if (loadCommunity) {
            selectCommunity(loadCommunity);
            if (loadSeason) {
                selectSeason(loadSeason);
                if (loadSensorCategory) {
                    selectSensorCategory(loadSensorCategory);
                    if (loadPollutant) {
                        selectPollutant(loadPollutant);
                        if (loadPollutant && loadSensorManufacturer && loadSensorTitle) {
                            //TODO: This may trigger before the item appears in the list, causing an inconsistent view.
                            handleSensorClick(loadSensorManufacturer,loadSensorTitle,loadSensorPosition);
                        }
                    }
                }
            }
        }
    }
}
