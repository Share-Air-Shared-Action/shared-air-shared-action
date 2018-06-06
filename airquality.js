// Initialize the variable for the map
var airQualityMap;

// Initialize arrays for markers and routes
var markers = [];
var routes = [];
var rectangles = [];
var selectedLineData = [];

// Initialize variables for each selection menu
var selected_community;
var selected_season;
var selected_sensorcategory;
var selected_pollutant;
var selected_sensor;
var selected_pollutantHTML;

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
     //   showStatistics();

        });
    });
// $("#summary-statistics-container").css("display","inherit");
});

//showStatistics();

// show view summary statistics
function showStatistics() {

	$("#summary-statistics-container").css("display","inherit");

	
}


// hide view summary statistics
function hideSummaryStatistics() {
	
//	$("#summary-statistics-container").html("");
$("#summary-statistics-container").css("display", "none");	
}



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

    // // Load previous selection if available
    // loadPreviousSelection();
}

/**
 * Creates markers and adds each sensor the list
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} community    The name of the community.
 * @param  {string} season       The name of the season from which you want to get data.
 */
function createMarkers(manufacturer, community, season, pollutant) {
    // Create colored markers for each different AQI
    var aqi = {
        unknown: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#000000',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        },
        good: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#00e400',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        },
        moderate: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FFFF00',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        },
        unhfsg: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF7E00',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        },
        unhealthy: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#FF0000',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        },
        veryunhealthy: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#99004C',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        },
        hazardous: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#7E0023',
            fillOpacity: 1,
            scale: 10,
            strokeWeight: 1
        }
    };


    $.getJSON("/airquality/api/aqi/", function(aqivals) {
        // Send the request to the api for the specified manufacturer
        $.getJSON("/airquality/api/" + manufacturer + "/ids/?season=" + season + "&community=" + community, function(devices) {
            if (!(devices)) {
                $("#dropdown-sensor-container").css("display","none");
                $("#dropdown-helptext").html("Loading or no sensors found with the selected parameters.");
            } else {
                $("#dropdown-helptext").html("Loading...");
            }
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
                        map: airQualityMap,
                        icon: aqi.unknown
                        //label: ''
                    });

                    // Create an event listener for the marker
                    marker.addListener('click', function() {
                        handleSensorClick(manufacturer, marker.title, deviceLatLng);
                    });


                    // If the AQI API has an entry for this pollutant type
                    if (aqivals.hasOwnProperty(pollutant)) {
                        // If the AQI API entry has a scale
                        if (aqivals[pollutant].hasOwnProperty("scale")) {
                            if (device.average <= aqivals[pollutant].scale.good.y[0]) {
                                marker.icon = aqi.good;
                            } else if (device.average <= aqivals[pollutant].scale.moderate.y[0]) {
                                marker.icon = aqi.moderate;
                            } else if (device.average <= aqivals[pollutant].scale.unhfsg.y[0]) {
                                marker.icon = aqi.unhfsg;
                            } else if (device.average <= aqivals[pollutant].scale.unhealthy.y[0]) {
                                marker.icon = aqi.unhealthy;
                            } else if (device.average <= aqivals[pollutant].scale.veryunhealthy.y[0]) {
                                marker.icon = aqi.veryunhealthy;
                            } else if (device.average > aqivals[pollutant].scale.veryunhealthy.y[0] ) {
                                marker.icon = aqi.hazardous;
                            } else {
                                marker.icon = aqi.unknown;
                            }
                            if (pollutant == "NO2" || pollutant == "O3") {
                                marker.icon.scale = device.average * 300;
                            } else {
                                marker.icon.scale = device.average;
                            }
                        }
                    // Otherwise set to unknown (black circle for marker)
                    } else {
                        marker.icon = aqi.unknown;
                        marker.icon.scale = device.average;
                    }
                    //marker.label = Math.round(device.average * 100) / 100
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
                    $("#dropdown-sensor-container").css("display","inherit");
                }
            });
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
 * @param  {string} community    The name of the community.
 */
function buildChart(manufacturer, device, pollutant, season, scrollto, community) {

    // Build the API URL
    var url = "/airquality/api/" + manufacturer + "/chart/?device=" + device + "&season=" + season + "&community=" + community;

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
    showDownloadButton(selected_community, selected_season);
    hideSummaryStatistics();
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
  //  showStatistics();

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

    // Hide the download button
    $("#download-button").hide();

    // Hide the heatmap button
    $("#heatmap-button").hide();
}

/**
 * Handles the selection of a pollutant
 * @param  {string} pollutant The pollutant selected
 */
function selectPollutant(pollutant) {
    // Set the selected pollutant, stripping any HTML
    selected_pollutant = $("<div>" + pollutant + "</div>").text();
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("pollutant", pollutant);
    }

    // Set the text to the pollutant with HTML
    $("#selected-pollutant").html(pollutant);
    selected_pollutantHTML = pollutant;

    // Reset the map and chart, and the sensor list
    resetMapAndChart(true);

      // Update the map to show sensors for the selected pollutant
      updateMap(selected_pollutant, selected_sensorcategory, selected_community, selected_season);

} // function selectPollutant

/**
  * compares the average pollutant across a particular season and sensorcategory
  * @param  {string} pollutant      The pollutant to load.
  * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes
  * @param  {string} season         The name of the season from which you want to get data.
  */
function compareCommunities(season,sensorcategory,pollutant){

  var manufacturer = [];
  // Identify the API path for sensorcategory and pollutant
  if(sensorcategory == "Mobile"){
    if(pollutant == "CO"){
        manufacturer.push("airterrier_co");
    } else if (pollutant == "CO2") {
        manufacturer.push("airterrier_co2");
    } else if (pollutant == "NO") {
        manufacturer.push("airterrier_no");
    }  else if  (pollutant == "PM1.0") {
        manufacturer.push("airterrier_pm1.0");
    }  else if  (pollutant == "PM2.5") {
        manufacturer.push("airterrier_pm2.5");
  }  else if  (pollutant == "PM10") {
        manufacturer.push("airterrier_pm10");
    }
  } else if(sensorcategory == "Stationary"){
    if (pollutant == "NO2") {
        manufacturer.push("aeroqual_no2");
    } else if (pollutant == "O3") {
        manufacturer.push("aeroqual_o3");
    } else if (pollutant == "PM1.0") {
        manufacturer.push("purpleairprimary_pm1.0");
    } else if (pollutant == "PM2.5") {
        manufacturer.push("purpleairprimary_pm2.5");
        manufacturer.push("metone_pm2.5");
    } else if (pollutant == "PM10") {
        manufacturer.push("purpleairprimary_pm10");
        manufacturer.push("metone_pm10");
    }
  }

  // store the pollutant data to display using chart
  var data = [];

  // boolean variable to identify any data retrieved for pollutant
  var haserrors=true;

  //buildComparisonChart(season,manufacturer[0],pollutant,true);
  var promises = [];

  manufacturer.forEach(function(item){
    // creating a promise call, handling success case in then block and error in catch block
    promises.push(fetchComparisonData(season,item,pollutant)
      .then(function(result){
        data.push(result);
        haserrors = haserrors && false;
      }).catch(function(error){
        console.warn(error);
      }) // catch
    ) // push
  }); // foreach

  // executes promises to fetch pollutant data from all manufacturer
  Promise.all(promises).then(function(result){

    if(data.length==0||data.length==1&&data[0].x.length==0){
      throw new Error("The selected pollutant did not return any data.")
    }
    // plot chart when all the data for pollutant is fetched
    plotComparisonChart(season,data,pollutant,sensorcategory);
  })
  .catch(function(error){
    console.warn(error);
    $("#dropdown-helptext").html("<span style='color: red;'>The selected pollutant did not return any data.</span>");
    resetMapAndChart(false);
  });

} // function compareCommunities

/**
 * Extracts average pollutant across all communities for the give Season
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 * @param  {string} season       The name of the season from which you want to get data.
 * @param  {string} manufacturer The name of the manufacturer from which you want to get data.
 */
function fetchComparisonData(season,manufacturer,pollutant) {
 return new Promise((resolve,reject) =>{
   // Build the API URL
   var url = "/airquality/api/" + manufacturer + "/comparison/?season=" + season;

   // Request the data from API
   d3.json(url, function(error, data) {
       if (error) {
           console.warn(error);
           reject(error);
       }
       if (data.x.length == 0) {
           console.warn("No data returned for " + manufacturer );
           reject("The selected pollutant did not return any data.");
       } else {
           $("#dropdown-helptext").html("");
       }
       resolve(data);
   }); // d3.json
 })
  // Build the API url

} // function fetchComparisonData

/**
 * Builds a Plot.ly chart from using the provided parameters.
 * @param  {string} data         The average pollutant value across all the communities
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 * @param  {string} season       The name of the season from which you want to get data.
 */
function plotComparisonChart(season,data,pollutant,sensorcategory){

  // to identify the max value in y axis
  var ydata = [];

  // color values for each bar
  var color = [];

  // variable that will aggreate from all the manufacturer data
  var plotdata = data[0];

  var border = [];

  // if more than one manufacturer then calculate average across them
  if(data.length>1){
  for(var i=0;i<data[0].y.length;i++){
    let arraysum = data[0].y[i];
    for(let j=0;j<data.length;j++){
      arraysum += data[j].y[i];
    }
    ydata.push(arraysum/data.length);
    border.push(0.2);
  } // for
  plotdata.y = ydata;
  }



  // Max data point
  var max_data = Math.max.apply(null,plotdata.y);

  // Set the chart width to the width of the chart's HTML element
  var chart_width = $("#comparison-chart").width();

  // Plot the data with AQI scale, unit, and range if they are available
  $.getJSON("/airquality/api/aqi/", function(aqivals) {



    // Set layout settings
    var layout = {
        title: "Comparison of average " + aqivals[pollutant].name +" of "+ sensorcategory.toLowerCase() +" sensor for " + season.toLowerCase() + " season across all neighborhood",
        yaxis: {
            title: plotdata.name,
            range: [0, max_data + (0.1 * max_data)]
        },
        textposition: 'auto',
        hoverinfo: 'none',
        xaxis: {
            range: [plotdata.x],
            title: 'Communities'
        },
        width: chart_width - 25,
        height: 700,
        autosize: true
    }; // layout

    if (aqivals.hasOwnProperty(pollutant)) {
        if (aqivals[pollutant].hasOwnProperty("unit")) {
            layout.yaxis.title = aqivals[pollutant].unit;
        }


        if (aqivals[pollutant].hasOwnProperty("scale")) {
            $.each(aqivals[pollutant].scale, function(thisscale) {
                aqivals[pollutant].scale[thisscale].x[0] = "0";
                aqivals[pollutant].scale[thisscale].x[1] = "0";
            });

            // color the bar
            $.each(plotdata.y,function(yindex){
              var yvalue = plotdata.y[yindex];
              if (yvalue>0 && yvalue < aqivals[pollutant].scale.good.y[0]) {
                color.push(aqivals[pollutant].scale.good.fillcolor);
              } else if (yvalue>aqivals[pollutant].scale.good.y[0] && yvalue<aqivals[pollutant].scale.moderate.y[0]) {
                color.push(aqivals[pollutant].scale.moderate.fillcolor);
              } else if (yvalue>aqivals[pollutant].scale.moderate.y[0] && yvalue<aqivals[pollutant].scale.unhfsg.y[0]) {
                color.push(aqivals[pollutant].scale.unhfsg.fillcolor);
              } else if (yvalue>aqivals[pollutant].scale.unhfsg.y[0] && yvalue<aqivals[pollutant].scale.unhealthy.y[0]) {
                color.push(aqivals[pollutant].scale.unhealthy.fillcolor);
              } else if (yvalue>aqivals[pollutant].scale.unhealthy.y[0] && yvalue<aqivals[pollutant].scale.veryunhealthy.y[0]) {
                color.push(aqivals[pollutant].scale.veryunhealthy.fillcolor);
              } else if (yvalue>aqivals[pollutant].scale.veryunhealthy.y[0]) {
                color.push(aqivals[pollutant].scale.hazardous.fillcolor);
              }
            });

        plotdata["marker"] = {"color" : color };

            Plotly.newPlot("comparison-chart", [plotdata,aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
        } else {
            Plotly.newPlot("comparison-chart", [plotdata], layout);
        }
    } else {
        Plotly.newPlot("comparison-chart", [plotdata], layout);
    }
          //Plotly.newPlot("chart", data , layout);

      $("#dropdown-helptext").html("");

    }); // getJSON aqi

} // function plotComparisonChart


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
        // CO, CO2, NO, PM1.0, PM2.5, PM10
        $("#dropdown-pollutant-container ul").append("<li><a>CO</a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>CO<sub>2</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>NO</a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>1.0</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>2.5</sub></a></li>");
        $("#dropdown-pollutant-container ul").append("<li><a>PM<sub>10</sub></a></li>");
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
            $("#dropdown-helptext").html("Loading...");
        }
    } else if (selected_pollutant == "CO2") {
        if (sensorcategory == "Mobile") {
            loadMobile("airterrier_co2", community, season);
            $("#dropdown-helptext").html("Loading...");
        }
    } else if (selected_pollutant == "NO") {
        if (sensorcategory == "Mobile") {
            loadMobile("airterrier_no", community, season);
            $("#dropdown-helptext").html("Loading...");
        }
    } else if (selected_pollutant == "NO2") {
        if (sensorcategory == "Stationary") {
            createMarkers("aeroqual_no2", community, season, pollutant);
            showSensorPicker();
        }
    } else if (selected_pollutant == "O3") {
        if (sensorcategory == "Stationary") {
            createMarkers("aeroqual_o3", community, season, pollutant);
            showSensorPicker();
        }
    } else if (selected_pollutant == "PM1.0") {
        if (sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm1.0", community, season, pollutant);
            showSensorPicker();
      } else if (sensorcategory == "Mobile") {
        loadMobile("airterrier_pm1.0", community, season);
        $("#dropdown-helptext").html("Loading...");
      }
    } else if (selected_pollutant == "PM2.5") {
        if (sensorcategory == "Stationary") {
            createMarkers("purpleairprimary_pm2.5", community, season, pollutant);
            createMarkers("metone_pm2.5", community, season, pollutant);
            showSensorPicker();
        } else if (sensorcategory == "Mobile") {
            loadMobile("airterrier_pm2.5", community, season);
            $("#dropdown-helptext").html("Loading...");
        }
    } else if (selected_pollutant == "PM10") {
        if (sensorcategory == "Stationary") {
            // Load purpleairprimary_pm10
            createMarkers("purpleairprimary_pm10", community, season, pollutant);
            createMarkers("metone_pm10", community, season, pollutant);
            showSensorPicker();
      } else if (sensorcategory == "Mobile") {
        loadMobile("airterrier_pm10", community, season);
        $("#dropdown-helptext").html("Loading...");
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

    // Hide the heatmap button
    $("#heatmap-button").hide();

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
    buildChart(manufacturer, device, selected_pollutant, selected_season, scrollto, selected_community);
    createSummaryTable(manufacturer, device, selected_season, selected_pollutant, selected_community);
    compareCommunities(selected_season,selected_sensorcategory,selected_pollutant);

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

    for (var i = 0; i < rectangles.length; i++) {
        rectangles[i].setMap(null);
    }
    rectangles = [];

    // Reset any selected line
    resetSelectedLine();

    // Hide the chart
    $("#chart").html("");

    // Hide the summary table
    $("#summary-table-container").html("");

    // Hide the comparison chart
    $("#comparison-chart").html("")

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
            $("#dropdown-helptext").html("");
            showSensorPicker();
            showHeatmapButton();
        }
    });
}

var heatmapdata = [];

/**
 * Creates the Polyline from the route's lat/longs.
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} route        The name of the specific line/route clicked.
 * @param  {string} season       The name of the season from which you want to get data.
 */
function createLine(manufacturer, route, season) {
    var polylinedata = [];
    heatmapdata = [];
    // Send the request to the api for the specified manufacturer
    $.getJSON("/airquality/api/" + manufacturer + "/routes/?route=" + route + "&season=" + season, function(devices) {
        // For each device returned
        $.each(devices, function(key, device) {
            // put the data into the array
            var thislatlng = new google.maps.LatLng(device.latitude, device.longitude);
            polylinedata.push(thislatlng);
            var thisweightedlocation = {lat: device.latitude, long: device.longitude, weight: device.data};
            heatmapdata.push(thisweightedlocation);
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
    // Create colored markers for each different AQI
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

    // Reset the selected line
    resetSelectedLine()

    // Hide other lines
    hideOtherLines(route);

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
 * Shows the download button for the selected stuff
 * @param  {string} nameToShow The name of the route to show
 */
function showDownloadButton(community, season) {
    $("#download-button").off();
    $("#download-button").click(function() {
      window.open("/airquality/api/download/?community=" + community + "&season=" + season);
    });
    $("#download-button").show();
    $("#download-button span").text("Download " + community + " data for " + season);
}

/**
 * Shows the download button for the selected stuff
 * @param  {string} nameToShow The name of the route to show
 */
function showHeatmapButton() {
    $("#heatmap-button").off();
    $("#heatmap-button").click(function() {
      loadHeatMap();
      // Hide the heatmap button
      $("#heatmap-button").hide();
      // Hide the sensor picker
      $("#dropdown-sensor-container").css("display","none");
    });
    $("#heatmap-button").show();
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
 * @param  {string} community    The name of the community.
 */
function createSummaryTable(manufacturer, device, season, pollutant, community) {
    var summaryUrl = "/airquality/api/" + manufacturer + "/summary/?device=" + device + "&season=" + season + "&community=" + community;

    // Create the table HTML with headers
    $("#summary-table-container").html("<table id='summary-table'><caption>Weather data source: wunderground.com</caption><thead><th data-dynatable-no-sort='true'>Date</th><th data-dynatable-no-sort='true' style='text-align: right;'>Average</th><th data-dynatable-no-sort='true' style='text-align: right;'>Max</th><th data-dynatable-no-sort='true' style='text-align: right;'>Min</th><th data-dynatable-no-sort='true' style='text-align: right;'>Temperature</th><th data-dynatable-no-sort='true' style='text-align: right;'>Dewpoint</th><th data-dynatable-no-sort='true' style='text-align: right;'>Pressure</th><th data-dynatable-no-sort='true' style='text-align: right;'>Windspeed</th><th data-dynatable-no-sort='true' style='text-align: right;'>Precipitation</th></thead><tbody></tbody></table>");

    // Bind the color change to the table being modified
    $('#summary-table').bind("DOMSubtreeModified", function() {
        changeColor();
    });

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
 updateSummaryHeaders(pollutant, selected_sensorcategory);
}

/**
 * Changes the colors of the table to match the AQI for the values that use AQI
 */
function changeColor() {
    var pollutant = selected_pollutant;
    $.getJSON("/airquality/api/aqi/", function(aqivals) {
        if (aqivals.hasOwnProperty(pollutant)) {
            if (aqivals[pollutant].hasOwnProperty("scale")) {
                $('#summary-table tr').each(function(index, element) {
                    var thisRow = $(this).find('td');
                    var thisAverage = parseFloat($(thisRow[1]).text());
                    if (thisAverage <= aqivals[pollutant].scale.good.y[0]) {
                        $(thisRow[1]).css('background-color', '#00e400');
                    } else if (thisAverage <= aqivals[pollutant].scale.moderate.y[0]) {
                        $(thisRow[1]).css('background-color', '#FFFF00');
                    } else if (thisAverage <= aqivals[pollutant].scale.unhfsg.y[0]) {
                        $(thisRow[1]).css('background-color', '#FF7E00');
                    } else if (thisAverage <= aqivals[pollutant].scale.unhealthy.y[0]) {
                        $(thisRow[1]).css('background-color', '#FF0000');
                        $(thisRow[1]).css('color', '#FFF');
                    } else if (thisAverage <= aqivals[pollutant].scale.veryunhealthy.y[0]) {
                        $(thisRow[1]).css('background-color', '#99004C');
                        $(thisRow[1]).css('color', '#FFF');
                    } else if (thisAverage > aqivals[pollutant].scale.veryunhealthy.y[0] ) {
                        $(thisRow[1]).css('background-color', '#7E0023');
                        $(thisRow[1]).css('color', '#FFF');
                    }
                    var thisMax = parseFloat($(thisRow[2]).text());
                    if (thisMax <= aqivals[pollutant].scale.good.y[0]) {
                        $(thisRow[2]).css('background-color', '#00e400');
                    } else if (thisMax <= aqivals[pollutant].scale.moderate.y[0]) {
                        $(thisRow[2]).css('background-color', '#FFFF00');
                    } else if (thisMax <= aqivals[pollutant].scale.unhfsg.y[0]) {
                        $(thisRow[2]).css('background-color', '#FF7E00');
                    } else if (thisMax <= aqivals[pollutant].scale.unhealthy.y[0]) {
                        $(thisRow[2]).css('background-color', '#FF0000');
                        $(thisRow[2]).css('color', '#FFF');
                    } else if (thisMax <= aqivals[pollutant].scale.veryunhealthy.y[0]) {
                        $(thisRow[2]).css('background-color', '#99004C');
                        $(thisRow[2]).css('color', '#FFF');
                    } else if (thisMax > aqivals[pollutant].scale.veryunhealthy.y[0] ) {
                        $(thisRow[2]).css('background-color', '#7E0023');
                        $(thisRow[2]).css('color', '#FFF');
                    }
                    var thisMin = parseFloat($(thisRow[3]).text());
                    if (thisMin <= aqivals[pollutant].scale.good.y[0]) {
                        $(thisRow[3]).css('background-color', '#00e400');
                    } else if (thisMin <= aqivals[pollutant].scale.moderate.y[0]) {
                        $(thisRow[3]).css('background-color', '#FFFF00');
                    } else if (thisMin <= aqivals[pollutant].scale.unhfsg.y[0]) {
                        $(thisRow[3]).css('background-color', '#FF7E00');
                    } else if (thisMin <= aqivals[pollutant].scale.unhealthy.y[0]) {
                        $(thisRow[3]).css('background-color', '#FF0000');
                        $(thisRow[3]).css('color', '#FFF');
                    } else if (thisMin <= aqivals[pollutant].scale.veryunhealthy.y[0]) {
                        $(thisRow[3]).css('background-color', '#99004C');
                        $(thisRow[3]).css('color', '#FFF');
                    } else if (thisMin > aqivals[pollutant].scale.veryunhealthy.y[0] ) {
                        $(thisRow[3]).css('background-color', '#7E0023');
                        $(thisRow[3]).css('color', '#FFF');
                    }
                });
            }
        }
    });
}

function loadHeatMap() {
    var heatmapDict = {};
    var finalHeatmap = [];

    // Calculate the max and min lats/longs
    for (var i = 0; i < heatmapdata.length; i++) {
        var thisLat = parseFloat(heatmapdata[i].lat).toFixed(4);
        var thisLong = parseFloat(heatmapdata[i].long).toFixed(4);
        var thisWeight = parseFloat(heatmapdata[i].weight);

        if (heatmapDict[thisLat + "," + thisLong]) {
            heatmapDict[thisLat + "," + thisLong] = ((heatmapDict[thisLat + "," + thisLong] + thisWeight) / 2.0);
        } else {
            heatmapDict[thisLat + "," + thisLong] = thisWeight;
        }

    }

    pollutant = selected_pollutant;
    $.getJSON("/airquality/api/aqi/", function(aqivals) {
        $.each(heatmapDict, function(index, value) {
            var thisLat = index.split(',')[0];
            var thisLong = index.split(',')[1];
            var thisAverage = value;

            // If the AQI API has an entry for this pollutant type
            if (aqivals.hasOwnProperty(pollutant)) {
                // If the AQI API entry has a scale
                if (aqivals[pollutant].hasOwnProperty("scale")) {
                    if (thisAverage <= aqivals[pollutant].scale.good.y[0]) {
                        rectangles.push(new google.maps.Rectangle({
                           strokeOpacity: 0,
                           fillColor: '#00e400',
                           fillOpacity: 0.35,
                           map: airQualityMap,
                           bounds: new google.maps.LatLngBounds(
                               new google.maps.LatLng(parseFloat(thisLat) - 0.00005, parseFloat(thisLong) - 0.00005),
                               new google.maps.LatLng(parseFloat(thisLat) + 0.00005, parseFloat(thisLong) + 0.00005))
                        }));
                        //marker.icon = aqi.good;
                    } else if (thisAverage <= aqivals[pollutant].scale.moderate.y[0]) {
                        rectangles.push(new google.maps.Rectangle({
                           strokeOpacity: 0,
                           fillColor: '#FFFF00',
                           fillOpacity: 0.35,
                           map: airQualityMap,
                           bounds: new google.maps.LatLngBounds(
                               new google.maps.LatLng(parseFloat(thisLat) - 0.00005, parseFloat(thisLong) - 0.00005),
                               new google.maps.LatLng(parseFloat(thisLat) + 0.00005, parseFloat(thisLong) + 0.00005))
                        }));
                        //marker.icon = aqi.moderate;
                    } else if (thisAverage <= aqivals[pollutant].scale.unhfsg.y[0]) {
                        rectangles.push(new google.maps.Rectangle({
                           strokeOpacity: 0,
                           fillColor: '#FF7E00',
                           fillOpacity: 0.35,
                           map: airQualityMap,
                           bounds: new google.maps.LatLngBounds(
                               new google.maps.LatLng(parseFloat(thisLat) - 0.00005, parseFloat(thisLong) - 0.00005),
                               new google.maps.LatLng(parseFloat(thisLat) + 0.00005, parseFloat(thisLong) + 0.00005))
                        }));
                        //marker.icon = aqi.unhfsg;
                    } else if (thisAverage <= aqivals[pollutant].scale.unhealthy.y[0]) {
                        rectangles.push(new google.maps.Rectangle({
                           strokeOpacity: 0,
                           fillColor: '#FF0000',
                           fillOpacity: 0.35,
                           map: airQualityMap,
                           bounds: new google.maps.LatLngBounds(
                               new google.maps.LatLng(parseFloat(thisLat) - 0.00005, parseFloat(thisLong) - 0.00005),
                               new google.maps.LatLng(parseFloat(thisLat) + 0.00005, parseFloat(thisLong) + 0.00005))
                        }));
                        //marker.icon = aqi.unhealthy;
                    } else if (thisAverage <= aqivals[pollutant].scale.veryunhealthy.y[0]) {
                        rectangles.push(new google.maps.Rectangle({
                           strokeOpacity: 0,
                           fillColor: '#99004C',
                           fillOpacity: 0.35,
                           map: airQualityMap,
                           bounds: new google.maps.LatLngBounds(
                               new google.maps.LatLng(parseFloat(thisLat) - 0.00005, parseFloat(thisLong) - 0.00005),
                               new google.maps.LatLng(parseFloat(thisLat) + 0.00005, parseFloat(thisLong) + 0.00005))
                        }));
                        //marker.icon = aqi.veryunhealthy;
                    } else if (thisAverage > aqivals[pollutant].scale.veryunhealthy.y[0] ) {
                        rectangles.push(new google.maps.Rectangle({
                           strokeOpacity: 0,
                           fillColor: '#7E0023',
                           fillOpacity: 0.35,
                           map: airQualityMap,
                           bounds: new google.maps.LatLngBounds(
                               new google.maps.LatLng(parseFloat(thisLat) - 0.00005, parseFloat(thisLong) - 0.00005),
                               new google.maps.LatLng(parseFloat(thisLat) + 0.00005, parseFloat(thisLong) + 0.00005))
                        }));
                        //marker.icon = aqi.hazardous;
                    } else {
                        // do nothing
                        //marker.icon = aqi.unknown;
                    }
                }
            // Otherwise set to unknown (black circle for marker)
            } else {
                //marker.icon = aqi.unknown;
            }

            //markers.push(marker);
        });
    });
}

/**
 * Sets the headers and styling for them on the summary table.
 * @param  {string} pollutant      The text name of the specific pollutant type. Do not provide HTML.
 * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes.
 */
function updateSummaryHeaders(pollutant, sensorcategory) {

    var pollutantUnit = pollutant;

    var avgdesc;
    if (sensorcategory == "Stationary") {
        avgdesc = "24-hour ";
    } else if (sensorcategory == "Mobile") {
        avgdesc = "Route ";
    } else {
        avgdesc = "";
    }

    $("#summary-table-container").find("thead").replaceWith("<thead><tr><th data-dynatable-no-sort='true'>Date</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: red;' colspan='3'>" + pollutantUnit + "</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: brown;' colspan='2'>Temperature (&deg;F)</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: blue;'>Pressure</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: blue;'>Windspeed</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: blue;'>Precipitation</th>  </tr>  <tr><th data-dynatable-no-sort='true'></th><th data-dynatable-no-sort='true' style='text-align: right; background-color: red;' data-dynatable-column='pollutant-average'>" + avgdesc + " Average</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: red;' data-dynatable-column='pollutant-max'>" + avgdesc + " Max</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: red;' data-dynatable-column='pollutant-min'>" + avgdesc + " Min</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: brown;' data-dynatable-column='temp-avg'>Average</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: brown;' data-dynatable-column='temp-dewpoint'>Dewpoint</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: blue;' data-dynatable-column='pressure'>In. Hg</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: blue;' data-dynatable-column='windspeed'>MPH</th><th data-dynatable-no-sort='true' style='text-align: right; background-color: blue;' data-dynatable-column='precipitation'>In.</th></tr></thead>");
}

/**
 * Event handler for starting the tutorial
 */
function initIntro() {
    introJs().onchange(function(targetElement) {
    console.log(targetElement.id);
    switch (targetElement.id)
        {
        case "dropdown-community-container":
            selectCommunity("LV");
        break;
        case "dropdown-season-container":
            selectSeason("Summer");
        break;
        case "dropdown-sensorcategory-container":
            selectSensorCategory("Stationary");
        break;
        case "dropdown-pollutant-container":
            selectPollutant("PM2.5");
        break;
        case "map":
            handleSensorClick("metone_pm2.5","SASA_MO1", new google.maps.LatLng(41.846744, -87.707265));
        break;
        case "chart":
            setTimeout(function() {
                $('html, body').animate({
                    scrollTop: ($(".introjs-tooltiptext").offset().top - 50)
                }, 500);
            }, 500);
        break;
        }
    }).start();
}

/**
 * Loads from localStorage the previously-selected state of the app.
 */
// function loadPreviousSelection() {
//     if (typeof(Storage) !== "undefined") {
//         var loadCommunity = localStorage.getItem("community");
//         var loadSeason = localStorage.getItem("season");
//         var loadSensorCategory = localStorage.getItem("sensorcategory");
//         var loadPollutant = localStorage.getItem("pollutant");
//         var loadSensorManufacturer = localStorage.getItem("sensorManufacturer");
//         var loadSensorTitle = localStorage.getItem("sensorTitle");
//         var loadSensorPosition = localStorage.getItem("sensorPosition");
//         if (loadCommunity) {
//             selectCommunity(loadCommunity);
//             if (loadSeason) {
//                 selectSeason(loadSeason);
//                 showDownloadButton(loadCommunity, loadSeason);
//                 if (loadSensorCategory) {
//                     selectSensorCategory(loadSensorCategory);
//                     if (loadPollutant) {
//                         selectPollutant(loadPollutant);
//                         if (loadPollutant && loadSensorManufacturer && loadSensorTitle) {
//                             //TODO: This may trigger before the item appears in the list, causing an inconsistent view.
//                             handleSensorClick(loadSensorManufacturer,loadSensorTitle,loadSensorPosition);
//                         }
//                     }
//                 }
//             }
//         }
//     }
// }
