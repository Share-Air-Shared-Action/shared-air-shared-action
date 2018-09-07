// Initialize the variable for the map
var airQualityMap;
var communityNames = new Map();
communityNames.set("SE", "South East");
communityNames.set("SL", "South Loop");
communityNames.set("PC", "Altgeld Garden");
communityNames.set("NB", "Northbrook");
communityNames.set("LV", "Little Village");

// Initialize arrays for markers and routes
var markers = [];
var routes = [];
var rectangles = [];
var selectedLineData = [];
var heatmapdata = [];

// Initialize variables for each selection menu
var selected_community;
var selected_season;
var selected_sensorcategory;
var selected_pollutant;
var selected_sensor;
var selected_pollutantHTML;
const COMPARE = "compare";
const AVERAGE = "average";
const AQIREADING = "aqi_reading";
const STATIONARY_REP = "Stationary (Reported Values)";
const STATIONARY_15MIN = "Stationary (15 minutes averages)";
const STATIONARY_1HR = "Stationary (1 hour averages)";

// pollutant category that have AQI scales
var pollutantScale = new Map();
pollutantScale.set("CO", [0.0, 4.4, 9.4, 12.4, 15.4, 30.4, 99999]);
pollutantScale.set("NO2", [0.0, 0.053, 0.1, 0.36, 0.649, 1.249, 99999]);
pollutantScale.set("O3", [0.0, 0.054, 0.070, 0.085, 0.105, 0.200, 99999]);
pollutantScale.set("PM2.5", [0.0, 12.0, 35.4, 55.4, 150.4, 250.4, 99999]);
pollutantScale.set("PM10", [0, 54, 154, 254, 354, 424, 99999]);

// transpose of colors for CO, NO2, O3, PM2.5, PM10 for AQI scales
var pollutantColors = [];
pollutantColors.push(["rgba(0,228,0,0.5)", "rgba(0,228,0,0.5)", "rgba(0,228,0,0.5)", "rgba(0,228,0,0.5)", "rgba(0,228,0,0.5)"]);
pollutantColors.push(["rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)", "rgba(255,255,0,0.5)"]);
pollutantColors.push(["rgba(255,126,0,0.5)", "rgba(255,126,0,0.5)", "rgba(255,126,0,0.5)", "rgba(255,126,0,0.5)", "rgba(255,126,0,0.5)"]);
pollutantColors.push(["rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)", "rgba(255,0,0,0.5)"]);
pollutantColors.push(["rgba(153,0,76,0.5)", "rgba(153,0,76,0.5)", "rgba(153,0,76,0.5)", "rgba(153,0,76,0.5)", "rgba(153,0,76,0.5)"]);
pollutantColors.push(["rgba(126,0,35,0.5)", "rgba(126,0,35,0.5)", "rgba(126,0,35,0.5)", "rgba(126,0,35,0.5)", "rgba(126,0,35,0.5)"]);

// Adding sentence case operation to String variable
String.prototype.toSentenceCase = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
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
      //var communityAbbreviation=Object.keys(communityNames).find(key => object[key] === $(this).text());
      selectCommunity($(this).text());
      //   showStatistics();

    });
  });
  // $("#summary-statistics-container").css("display","inherit");
});

//showStatistics();

// show view summary statistics
function showStatistics() {

  $("#summary-statistics-container").css("display", "inherit");

}

// hide view summary statistics
function hideSummaryStatistics() {

  //	$("#summary-statistics-container").html("");
  $("#summary-statistics-container").css("display", "none");
}

// open view summary statistics
function viewSummary() {
  //window.open("view_summary.html");
  $.get("view-summary/index.html");
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
 * Loads the Google Map object for view summary statistics page on callback from Google Maps API and loads the community specific summary data
 */
function renderSummaryPage() {

  // read GET parameter from URL string
  var urlString = window.location.href;
  var url = new URL(urlString);
  var community = url.searchParams.get("community");

  // fetch data and render map if the community is recognizable
  if (communityNames.has(community)) {
    fetchPollutant(community);
    loadShapefile(community);
  } else {
    // center the map to chicago and display the error message
    $("#community-name").text("The " + community + " neighborhood could not be identified");
    var location = new google.maps.LatLng(41.7923412, -87.6030669);
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: location,
      panControl: true,
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
  } // if else

} // function renderSummaryPage

/**
 * function to load shape file and display map for listed communityNames
 * * @param  {string}  community     Name of the community to display the summary page
 */
function loadShapefile(community) {

  $("#community-name").text("Summary Statistics for " + communityNames.get(community));
  if (community != "NB") {
    $("#map").append('<object type="text/html"  data="/airquality/shape_file/' + community + '/index.html" width="1000" height="600" ></object>');
  } else {
    // Centering at Northbrook as shapefile is not avaliable for it
    var location = new google.maps.LatLng(42.13999619, -87.79922692);
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 12,
      center: location
    });
  }

} // function loadShapefile

/**
 * called when view-summary page is called to display the chart
 * @param  {String} community     The name of the neighborhood
 */
function fetchPollutant(community) {
  $("#aqi-shares-chart").html("<h4 class='info-message'>Loading ... AQI reading graph for " + communityNames.get(community) + " neighborhood.</h4>");
  $("#pollutant-no2-chart").html("<h4 class='info-message'>Loading ... Average reading graph of NO<sub>2</sub> for " + communityNames.get(community) + " neighborhood.</h4>");
  $("#pollutant-co-chart").html("<h4 class='info-message'>Loading ... Average reading graph of CO for " + communityNames.get(community) + " neighborhood.</h4>");
  $("#pollutant-o3-chart").html("<h4 class='info-message'>Loading ... Average reading graph of O<sub>3</sub> for " + communityNames.get(community) + " neighborhood.</h4>");
  $("#pollutant-pm25-chart").html("<h4 class='info-message'>Loading ... Average reading graph of PM<sub>2.5</sub> for " + communityNames.get(community) + " neighborhood.</h4>");
  $("#pollutant-pm10-chart").html("<h4 class='info-message'>Loading ... Average reading graph of PM<sub>10</sub> for " + communityNames.get(community) + " neighborhood.</h4>");

  var api = AVERAGE;

  $.getJSON("/airquality/api/aqi/", function(aqivals) {

    // list of pollutants and its manufacture to display the average reading
    var pollutants = {
      "CO": {
        "manufacturers": ["airterrier_co"],
        "hasaqi": true
      },
      "CO2": {
        "manufacturers": ["airterrier_co2"],
        "hasaqi": false
      },
      "NO": {
        "manufacturers": ["airterrier_no"],
        "hasaqi": false
      },
      "NO2": {
        "manufacturers": ["aeroqual_no2"],
        "hasaqi": true
      },
      "O3": {
        "manufacturers": ["aeroqual_o3"],
        "hasaqi": true
      },
      "PM1.0": {
        "manufacturers": ["airterrier_pm1.0", "purpleairprimary_pm1.0"],
        "hasaqi": false
      },
      "PM2.5": {
        "manufacturers": ["airterrier_pm2.5", "purpleairprimary_pm2.5", "metone_pm2.5"],
        "hasaqi": true
      },
      "PM10": {
        "manufacturers": ["airterrier_pm10", "purpleairprimary_pm10", "metone_pm10"],
        "hasaqi": true
      }
    };

    var aqivals1 = JSON.parse(JSON.stringify(aqivals));
    // plot bar chart for displaying pollutant average as percentage shares
    fetchAQISharesData(aqivals1, pollutants, api, community).then((result) => {
      //return aggregateAQIShares(aqivals1, pollutantAVG);
      console.log(result);
      let pollutantNames = [];
      let pollutantReadings = [];
      result.forEach((value, key, map) => {
        pollutantNames.push(key);
        pollutantReadings.push(value);
      });
      console.log(pollutantNames);
      console.log(pollutantReadings);
      return plotAQIShares(pollutantNames, pollutantReadings, community);
    }); // fetchAQISharesData call

  }); // getJSON
}

/**
 * calls to reterive data and plot graph for each manufacturer in the pollutant
 * @param  {json}   aqivals
 * @param  {json}   pollutants    The list of pollutants and the manufacturer
 * @param  {String} api           Singifies whether to render comparision or average summary graph
 * @param  {String} community     The name of the neighborhood
 */
function fetchAQISharesData(aqivals, pollutants, api, community) {
  return new Promise(function(resolve, reject) {

    var pollutantAVG = new Map();
    var promises = [];
    var aqipromises = [];
    var selectedpollutant = [];

    // loop through each pollutant and generate graph
    for (const pollutant of Object.keys(pollutants)) {
      // skip if aqi is not present
      if (pollutants[pollutant].hasaqi) {
        //selectedpollutant.push(pollutant);
        // fetches average reading from database and calls function for ploting graph
        getAveragePollutantData(pollutants[pollutant].manufacturers, pollutant, AVERAGE, community, aqivals);

        aqipromises.push(getAveragePollutantData(pollutants[pollutant].manufacturers, pollutant, AQIREADING, community, aqivals).then((pollutantavg) => {
          // return value contains the overall average pollutant used for plotting AQI share graph
          console.log(pollutant);
          console.log(pollutantavg);
          //pollutantAVG.push(pollutantavg);
          pollutantAVG.set(pollutant, pollutantavg);
        }));
      } // if
    } // for loop

    Promise.all(aqipromises).then(() => {
      resolve(pollutantAVG);
    }); // Promise all

  }); // promise
} // function fetchAQISharesData

/**
 * fetches average reading from database and calls function for ploting graph
 * @param  {String} community    The name of the neighborhood
 * @param  {Array}  manufacturer  The list of manufacturer
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 * @param  {json} aqivals
 * @param  {String}  api     Singifies whether to render comparision or average summary graph
 */
function getAveragePollutantData(manufacturer, pollutant, api, community, aqivals) {
  return new Promise((resolve, reject) => {

    // boolean variable to identify any data retrieved for pollutant
    var haserrors = true;
    // store the pollutant data to display using chart
    var data = [];
    var promises = [];

    manufacturer.forEach(function(item) {
      // creating a promise call, handling success case in then block and error in catch block
      promises.push(fetchGraphData(item, pollutant, api, "season", community)
        .then(function(result) {
          data.push(result);
          haserrors = haserrors && false;
        }).catch(function(error) {
          console.warn(error);
        }) // catch
      ); // push
    }); // manufacturer foreach

    // executes promises to fetch pollutant data from all manufacturer
    Promise.all(promises).then(function() {

        if (data.length == 0) {
          console.warn("The " + pollutant + " pollutant for " + manufacturer + " manufacturer did not return any data.")
        }
        if (api == AVERAGE) {
          // plot average chart when all the data for pollutant is fetched
          plotAveragePollutantChart(community, data, pollutant, aqivals);
        } else if (api == AQIREADING) {
          // aggregates data across all manufacturer for a pollutant and returns for plotting on a graph
          aggregateAQIReading(community, data, pollutant).then((aggregateData) => {
            resolve(aggregateData);
          }).catch((error) => {
            console.warn(error);
          });
        } // else if
      }) // Promise all
      .catch(function(error) {
        console.warn(error);
        $("#dropdown-helptext").html("<span class='error-message'>The " + pollutant + " pollutant did not return any data.</span>");
        resetMapAndChart(false);
      }); // catch

  }); // promise
} // function getAveragePollutantData

/**
 * aggregates the pollutant data from different manufactures and computes the aqi shares in percentage
 * @param  {String} community    The name of the neighborhood
 * @param  {Array}  data         The pollutant count based on scales across many manufacturer
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 */
function aggregateAQIReading(community, data, pollutant) {
  return new Promise(function(resolve, reject) {

    var aggData = new Map();
    var totalCount = 0;
    var values = [];
    for (let i = 0; i < data.length; i++) {
      let loopdata = JSON.parse(JSON.stringify(data[i]));
      let keys = Object.keys(loopdata.aqi);
      for (let aqitype of keys) {
        let numb = Number(loopdata.aqi[aqitype]);
        // If the value is null then set the value to 0
        let newvalue = numb ? numb : 0;
        // If the key is already present then add the value then add new key, value pairs
        let value = aggData.has(aqitype) ? (aggData.get(aqitype) + newvalue) : newvalue;
        // add the values to the map
        aggData.set(aqitype, value);
      } // for loop inner
      // If the total is null then set the value to 0
      totalCount += Number(loopdata.total) ? Number(loopdata.total) : 0;
    } // for loop outer

    // calculate the percentage on aggregated data for a pollutant
    aggData.forEach((value, key, map) => {
      values.push(Math.round(value / totalCount * 10000) / 100);
    });
    resolve(values);
  }); // promise
} // function aggregateAQIReading

/**
 * Builds a Plot.ly chart from using the provided parameters.
 * @param  {String} community  The name of the neighborhood
 * @param  {string} data         The average pollutant value across all the communities
 * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
 * @param  {string} aqivals
 */
function plotAveragePollutantChart(community, data, pollutant, aqivals) {
  return new Promise(function(resolve, reject) {

    // to identify the max value in y axis
    var ydata = [];
    // variable that will aggreate from all the manufacturer data
    var summersum = [];
    var wintersum = [];
    var allvalues = [];
    var timeofday = new Map();

    timeofday.set("Morning", []);
    timeofday.set("Midday", []);
    timeofday.set("Afternoon", []);
    timeofday.set("Evening", []);
    timeofday.set("Overnight", []);

    var summertime = new Map(timeofday);
    var wintertime = new Map(timeofday);

    // if more than one manufacturer then calculate concat the data from all to calculate max height of y-axis
    for (var i = 0; i < data.length; i++) {

      // divide the data among summer and winter as grouped bar chart
      for (let j = 0; j < data[i].season.length; j++) {

        let key = data[i].section[j].toSentenceCase();
        let value = data[i].val[j];
        allvalues.push(value);
        // build seperate array for summer and winter for bar chart display
        if (data[i].season[j] == "Summer") {
          // append the new value to the array
          summertime.set(key, summertime.get(key).concat(value));
          // average is calcuated by dividing every consequtive value by 2, if the value is first then it is added with itself for calculating average
          summersum.push(value);
        } else {
          // append the new value to the array
          wintertime.set(key, wintertime.get(key).concat(value));
          wintersum.push(value);
        }
      }
      // append to the array to create a linear array across all manufacturer to calculate the max height of y axis
      ydata.concat(data[i].val);
    }

    let dataError = true;
    allvalues.forEach((element) => {
      if (!isNaN(element)) {
        dataError = false;
      }
    });

    // if no data to display return with a error message
    if (dataError) {
      console.log(pollutant + ":" + dataError);
      $("#pollutant-" + pollutant.toLowerCase().replace(".","") + "-chart").html("<h4 class='error-message'>No data readings available for " + pollutant + " in " + communityNames.get(community) + " neighborhood.</h4>");
      resolve(dataError);
    } else {

      console.log("after");
      // add the array from each manufacturer and calculate the average
      summertime.forEach((value, key, map) => {
        map.set(key, value.reduce((a, b) => a + b, 0) / value.length);
      });
      wintertime.forEach((value, key, map) => {
        map.set(key, value.reduce((a, b) => a + b, 0) / value.length);
      });

      // Max data point
      var max_data = Math.max.apply(null, ydata);

      // add 24 hours average reading
      summertime.set("All day", (summersum.reduce((a, b) => a + b, 0) / summersum.length));
      wintertime.set("All day", (wintersum.reduce((a, b) => a + b, 0) / wintersum.length));

      let xaxis = Array.from(summertime.keys());
      let xaxisNames = ["Morning (09AM-10AM)", "Midday (10AM-2PM)", "Afternoon (2PM-4PM)", "Evening (4PM-8PM)", "Overnight (8PM-6AM)", "All day "];
      let summervalues = [];
      let wintervalues = [];

      // populating the values of for summer and winter averages
      xaxis.forEach((key) => {
        if (summertime.get(key) < 1.0) {
          summervalues.push(Math.round(summertime.get(key) * 100) / 100); // rounding to two decimal places
        } else {
          summervalues.push(Math.round(summertime.get(key)));
        }
      });
      xaxis.forEach((key) => {
        if (wintertime.get(key) < 1.0) {
          wintervalues.push(Math.round(wintertime.get(key) * 100) / 100);
        } else {
          wintervalues.push(Math.round(wintertime.get(key)));
        }
      });

      var summerplotdata = {
        "x": xaxisNames,
        "y": summervalues,
        "text": summervalues,
        "textposition": "outside",
        "hoverinfo": 'none',
        "name": "Summer",
        "type": "bar",
        "mode": "markers",
      };

      var winterplotdata = {
        "x": xaxisNames,
        "y": wintervalues,
        "text": wintervalues,
        "textposition": "outside",
        "hoverinfo": 'none',
        "name": "Winter",
        "type": "bar",
        "mode": "markers",
      };

      // Set the chart width to the width of the chart's HTML element
      var chart_width = $("#pollutant-" + pollutant.toLowerCase().replace(".","") + "-chart").width();

      // Set layout settings
      var layout = {
        title: "Average reading for " + aqivals[pollutant].name + " pollutant for " + communityNames.get(community) + " neighborhood",
        yaxis: {
          title: "Pollutant",
          range: [0, max_data + (0.1 * max_data)]
        },
        textposition: 'auto',
        hoverinfo: 'none',
        // xaxis: {
        //   range: xaxisNames,
        //   title: 'Day breakdown'
        // },
        width: chart_width - 25,
        height: 700,
        autosize: true,
        barmode: 'group'
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
          colorBars(winterplotdata, aqivals, pollutant, 2) // width of line = 2
            .then((plotdata) => {
              winterplotdata = plotdata;
              return colorBars(summerplotdata, aqivals, pollutant, 0.5); // width of line = 0.5
            })
            .then((plotdata) => {
              summerplotdata = plotdata;

              // setting the value of y for pollutant scale to 0
              $.each(aqivals[pollutant].scale, function(thisscale) {
                aqivals[pollutant].scale[thisscale].y[0] = max_data;
                aqivals[pollutant].scale[thisscale].y[1] = max_data;
              });

              return;
            })
            .then(() => {
              $("#pollutant-" + pollutant.toLowerCase().replace(".","") + "-chart").html("");
              Plotly.newPlot("pollutant-" + pollutant.toLowerCase().replace(".","") + "-chart", [summerplotdata, winterplotdata, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
              //Plotly.newPlot("pollutant-" + pollutant.toLowerCase() + "-chart", [summerplotdata, winterplotdata], layout);
            });

          // return result to plot AQI shares graph
          resolve(allvalues.length > 0 ? allvalues.reduce((a, b) => a + b) / allvalues.length : 0);
        }
        // return empty result for AQI not available
        resolve();
      }
    } // if-else
  });
} // function plotComparisonChart

/**
 * color the graph bar based on the pollutant range
 * @param  {json}    plotdata     json for rendering graph layout
 * @param  {json}    aqivals      Pollutant sepecific aqi values
 * @param  {string}  pollutant    The name of the pollutant
 * @param  {number}  width        The value of width for rendering graph bar border
 */
function colorBars(plotdata, aqivals, pollutant, width) {
  return new Promise(function(resolve, reject) {

    // color values for each bar
    let color = [];
    // color the bar
    var pollutantRange = pollutantScale.get(pollutant);
    $.each(plotdata.y, function(yindex) {
      var yvalue = plotdata.y[yindex] ? plotdata.y[yindex] : 0;
      if (yvalue >= pollutantRange[0] && yvalue < pollutantRange[1]) {
        color.push(aqivals[pollutant].scale.good.fillcolor);
      } else if (yvalue >= pollutantRange[1] && yvalue < pollutantRange[2]) {
        color.push(aqivals[pollutant].scale.moderate.fillcolor);
      } else if (yvalue >= pollutantRange[2] && yvalue < pollutantRange[3]) {
        color.push(aqivals[pollutant].scale.unhfsg.fillcolor);
      } else if (yvalue >= pollutantRange[3] && yvalue < pollutantRange[4]) {
        color.push(aqivals[pollutant].scale.unhealthy.fillcolor);
      } else if (yvalue >= pollutantRange[4] && yvalue < pollutantRange[5]) {
        color.push(aqivals[pollutant].scale.veryunhealthy.fillcolor);
      } else if (yvalue >= pollutantRange[5]) {
        color.push(aqivals[pollutant].scale.hazardous.fillcolor);
      }
    });
    plotdata["marker"] = {
      "color": color,
      line: {
        color: 'rbg(8,48,107)',
        width: width
      }
    };
    resolve(plotdata);

  });
} // function colorBars

/**
 * Creates markers and adds each sensor the list
 * @param  {string} manufacturer The name of the API folder to open.
 * @param  {string} community    The name of the community.
 * @param  {string} season       The name of the season from which you want to get data.
 * @param  {string} pollutant    The name of the pollutant
 */
  function createMarkers(manufacturer, community, season, pollutant, manufacturerChecked) {
  // Create colored markers for each different AQI
  $("#dropdown-helptext").html("<div class='loading'></div>");
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
      manufacturerChecked.set(manufacturer, true);
      console.log(manufacturerChecked);
      var allSensorsFetched = new Boolean(true);
      for (var key of manufacturerChecked) {
        console.log(manufacturerChecked.get(key[0]));
        if (!manufacturerChecked.get(key[0])) {
          allSensorsFetched = false;
        }
      }
      // Display info or error message based on the number of manufacturer checked
      console.log(allSensorsFetched);
      if (!(devices) && allSensorsFetched) {
        $("#dropdown-sensor-container").css("display", "none");
        $("#dropdown-helptext").html("<span class='error-text'>No sensors found with the selected parameters.</span>");
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
              } else if (device.average > aqivals[pollutant].scale.veryunhealthy.y[0]) {
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
          if(allSensorsFetched){
            $("#dropdown-helptext").html("");
            $("#dropdown-sensor-container").css("display", "inherit");
          }
        }
      });
    });
  });
} // function createMarkers

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

  // Identify whether the chart to display is reported or 15 min average
  var sensorcategory = $("#selected-sensorcategory").text();
  // Identify whether the chart type to be displayed is reported chart or 15mins average or 1 hour average
  var chart = "chart";
  // Chart title to display on the graph
  var title = "";

  if (sensorcategory === STATIONARY_1HR) {
    chart += "_1hr";
    title = "1 hour averages of ";
  } else if (sensorcategory === STATIONARY_15MIN) {
    chart += "_15min";
    title = "15 minute averages of ";
  }
  // Build the API URL
  var url = "/airquality/api/" + manufacturer + "/" + chart + "/?device=" + device + "&season=" + season + "&community=" + community;
  // Request the data from API
  console.log(url);
  d3.json(url, function(error, data) {
      if (error) {
        return console.warn(error);
        $("#chart").html("<div class='error-message'>" + error + "</div>");
      }
      if (data.x.length == 0) {
        $("#chart").html("<div class='error-message'>The selected sensor did not return any data.</div>");
        resetMapAndChart(false);
        return console.warn("The selected sensor did not return any data.");
      } else {
        $("#dropdown-helptext").html("");
      }
      // Get the max and min date to center chart on
      var max_date = data.x[data.x.length - 1];
      var min_date = data.x['0'];

      // Max data point
      var max_data = Math.max.apply(null, data.y);

      // Set the chart width to the width of the chart's HTML element
      var chart_width = $("#chart").width();

      title += device + " data for " + season + " season";
      var max_data = Math.max.apply((chart == "chart_1hr") ? data.y1 : null, data.y);
      // Set layout settings
      var layout = {
        //barmode: "group",
        title: title,
        yaxis: {
          title: pollutant,
          range: [0, max_data + (0.1 * max_data)]
        },
        xaxis: {
          range: [min_date, max_date],
          title: "Date and Time"
        },
        width: chart_width - 25,
        height: 700,
        autosize: false
      };

      // Remove the info text and plot graph in it's place
      console.log("Clearning the information");

      // Assigning chart title based on whether the chart is 15 min or 1 hour average or the normal chart
      if (chart == "chart_15min") {

      } else if (chart == "chart_1hr") {
        x = [];
        y = [];
        y1 = [];
        $.each(data.x, (index, value) => {
          x.push(value);
        });
        $.each(data.y, (index, value) => {
          y.push(value);
        });
        $.each(data.y1, (index, value) => {
          // if epa data is not present then it is not displayed on the graph
          y1.push((value===0)?null:value);
        });
        var trace = {
          x: x,
          y: y,
          mode: 'markers',
          type: 'scatter',
          name: 'SASA data for ' + device
        };
        var trace1 = {
          x: x,
          y: y1,
          mode: 'markers',
          type: 'scatter',
          name: 'EPA standard data for ' + device,
          color: ['white']
        };
        var data = [trace, trace1];
        var max_data = Math.max.apply(null,y1.concat(y));
        console.log(max_data);
        var layout = {
          title: title,
          yaxis: {
            title: pollutant,
            range: [0, max_data + (0.1 * max_data)]
          },
          textposition: 'auto',
          hoverinfo: 'none',
          xaxis: {
            range: [x[0], x[x.length - 1]],
            title: "Date and Time"
          },
          width: chart_width - 25,
          height: 700,
          autosize: true
          // ,
          // barmode: 'group'
        };


        // Plot the data with AQI scale, unit, and range if they are available
        $.getJSON("/airquality/api/aqi/", function(aqivals) {
          // Clearing the info text
          console.log(data);
          $("#chart").empty();
            if (aqivals.hasOwnProperty(pollutant)) {
              if (aqivals[pollutant].hasOwnProperty("unit")) {
                layout.yaxis.title = aqivals[pollutant].unit;
              }
              if (aqivals[pollutant].hasOwnProperty("scale")) {
                $.each(aqivals[pollutant].scale, function(thisscale) {
                  aqivals[pollutant].scale[thisscale].x[0] = min_date;
                  aqivals[pollutant].scale[thisscale].x[1] = max_date;
                });
                Plotly.newPlot("chart", data.concat([aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous]), layout);
              } else {
                Plotly.newPlot("chart", data, layout);
              }
            } else {
              Plotly.newPlot("chart", data, layout);
            }
        });
        return;
      }

        // Plot the data with AQI scale, unit, and range if they are available
        $.getJSON("/airquality/api/aqi/", function(aqivals) {
          // Clearing the info text

          // adding color to the scatter plot based on presence or absence of comments
          data['marker']={color :data.color};
          $("#chart").empty();
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
        }); // getjson aqi
      });
  } // function buildChart

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
    hideSummaryStatistics();
  } // function selectSeason

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
  } // function selectCommunity

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
    $("#dropdown-pollutant-container").css("display", "inherit");
    resetPollutantandSensor();
    hideSummaryStatistics();
    var sensor = "";
    switch (selected_sensorcategory) {
      case STATIONARY_REP:
        sensor = "reported";
        break;
      case STATIONARY_15MIN:
        sensor = "15min";
        break;
      case STATIONARY_1HR:
        sensor = "1hr"
        break;
      case "Mobile":
        sensor = "mobile";
        break;
      default:

    }
    showDownloadButton(selected_community, selected_season, sensor);
  } // function selectSensorCategory

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
    $("#dropdown-sensor-container").css("display", "none");

    // Reset the selected sensor
    selected_sensor = "";
    if (typeof(Storage) !== "undefined") {
      localStorage.setItem("sensor", "");
    }

    // Hide the download button
    $("#download-button").hide();

    // Hide the heatmap button
    $("#heatmap-button").hide();

  } // function resetPollutantandSensor

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

    // hide summary statistics button on main page
    hideSummaryStatistics();
    $("#download-button").hide();
  } // function selectPollutant

  /**
   * load appropriate manufacturers for the api
   * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes
   * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
   * @param  {string} api          Signifies whether to fetch data for comparision or average reading
   */
  function loadManufacturers(sensorcategory, pollutant, api) {
    return new Promise((resolve, reject) => {
      var manufacturer = [];

      // Identify the API path for sensorcategory and pollutant
      if (api == COMPARE) {
        if (sensorcategory == "Mobile") {
          if (pollutant == "CO") {
            manufacturer.push("airterrier_co");
          } else if (pollutant == "CO2") {
            manufacturer.push("airterrier_co2");
          } else if (pollutant == "NO") {
            manufacturer.push("airterrier_no");
          } else if (pollutant == "PM1.0") {
            manufacturer.push("airterrier_pm1.0");
          } else if (pollutant == "PM2.5") {
            manufacturer.push("airterrier_pm2.5");
          } else if (pollutant == "PM10") {
            manufacturer.push("airterrier_pm10");
          }
        } else if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
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
        resolve(manufacturer);
      }
    }); // promise
  } // function loadManufacturers

  /**
   * fetches the manufacturers for given parameter extracts the data from database using api and call plot graph function for comparision and average type of graph plotting
   * @param  {string} season         The name of the season from which you want to get data.
   * @param  {string} sensorcategory Mobile or Stationary, used to load correct sensors/routes
   * @param  {string} pollutant      The pollutant to load.
   * @param  {string} api          Signifies whether to fetch data for comparision or average reading
   */
  function plotCommunities(season, sensorcategory, pollutant, api) {

    $("#chart").html("<div class='info-message'>Loading data to plot "+ pollutant +" for "+ season +" season </div>"); //
    // $("#summary-table-container").html("<div class='info-message'>Loading data of daily summary for "+pollutant+"</div>"); // The table does not load with this info message
    $("#comparison-chart").html("<div class='info-message'>Loading data to plot comparision of average "+pollutant+" across all communities</div>");
    // a promise that extract the list of manufacturers for comparing communities
    loadManufacturers(sensorcategory, pollutant, api).then((manufacturer) => {

      // store the pollutant data to display using chart
      var data = [];

      // boolean variable to identify any data retrieved for pollutant
      var haserrors = true;

      //buildComparisonChart(season,manufacturer[0],pollutant,true);
      var promises = [];

      manufacturer.forEach(function(item) {
        // creating a promise call, handling success case in then block and error in catch block
        promises.push(fetchGraphData(item, pollutant, api, season)
          .then(function(result) {
            data.push(result);
            haserrors = haserrors && false;
          }).catch(function(error) {
            console.warn(error);
            $("#dropdown-helptext").html("<span class='error-text'>The selected pollutant did not return any data.</span>");
          }) // catch
        ) // push
      }); // foreach

      // executes promises to fetch pollutant data from all manufacturer
      Promise.all(promises).then(function(result) {

          if (data.length == 0 || data.length == 1 && data[0].x.length == 0) {
            console.warn("The selected pollutant did not return any data.")
          }
          // plot chart when all the data for pollutant is fetched

          plotComparisonChart(season, data, pollutant, sensorcategory);
        })
        .catch(function(error) {
          console.warn(error);
          $("#dropdown-helptext").html("<span class='error-message'>The selected pollutant did not return any data.</span>");
          resetMapAndChart(false);
        });

    });

  } // function plotCommunities


  /**
   * Extracts average pollutant across all communities for the give Season
   * @param  {string} manufacturer The name of the manufacturer from which you want to get data.
   * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
   * @param  {string} api          Signifies whether to fetch data for comparision or average reading
   * @param  {string} season       The name of the season from which you want to get data.
   * @param  {string} community    The name of the neighborhood
   */
  function fetchGraphData(manufacturer, pollutant, api, season, community) {
    return new Promise((resolve, reject) => {
      // Build the API URL
      var url = "";
      if (api == COMPARE) {
        url = "/airquality/api/" + manufacturer + "/comparison/?season=" + season;
      } else if (api == AVERAGE) {
        url = "/airquality/api/" + manufacturer + "/avg_reading/?community=" + community;
        console.log(url);
      } else if (api == AQIREADING) {
        url = "/airquality/api/" + manufacturer + "/aqi_count/?community=" + community;
      }

      // Request the data from API
      d3.json(url, function(error, data) {
        if (error) {
          console.warn(url);
          console.warn(error);
          reject(error);
        }
        if (api == AVERAGE) {
          if (typeof data.section != "undefined" && data.section.length == 0) {
            console.warn("No data returned for " + community + " community");
            reject("The selected pollutant did not return any data.");
          }
        } else {
          $("#dropdown-helptext").html("");
        }
        resolve(data);
      }); // d3.json
    })
    // Build the API url

  } // function fetchGraphData

  /**
   * Builds a Plot.ly chart from using the provided parameters.
   * @param  {string} data           The average pollutant value across all the communities
   * @param  {string} pollutant      The text name of the specific pollutant type. Do not provide HTML.
   * @param  {string} season         The name of the season from which you want to get data.
   * @param  {string} sensorcategory Singifies whether rendering is for comparision chart or average summary
   */
  function plotComparisonChart(season, data, pollutant, sensorcategory) {

    // to identify the max value in y axis
    var ydata = [];

    // color values for each bar
    var color = [];

    // variable that will aggreate from all the manufacturer data
    var plotdata = data[0];

    var border = [];
    let arraysum = [];
    // if more than one manufacturer then calculate average across them
    if (data.length > 1) {
      for (var i = 0; i < data[0].y.length; i++) {
        for (let j = 0; j < data.length; j++) {
          if (data[j].y[i] > 0) {
            arraysum.push(data[j].y[i]);
          }
        }
        ydata.push(arraysum.length > 0 ? arraysum.reduce((a, b) => a + b, 0) / arraysum.length : 0);
        border.push(0.2);
        arraysum = [];
      } // for
      plotdata.y = ydata;
    }

    // Max data point
    var max_data = Math.max.apply(null, plotdata.y);

    // Set the chart width to the width of the chart's HTML element
    var chart_width = $("#comparison-chart").width();

    // Plot the data with AQI scale, unit, and range if they are available
    $.getJSON("/airquality/api/aqi/", function(aqivals) {

      // Set layout settings
      var layout = {
        title: "Comparison of average " + aqivals[pollutant].name + " of " + sensorcategory.toLowerCase() + " sensor for " + season.toLowerCase() + " season across all neighborhood",
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

      $("#comparison-chart").html("");
      if (aqivals.hasOwnProperty(pollutant)) {
        if (aqivals[pollutant].hasOwnProperty("unit")) {
          layout.yaxis.title = aqivals[pollutant].unit;
        }


        if (aqivals[pollutant].hasOwnProperty("scale")) {
          // setting x axis to value as this is not used in plotting graph rather community names
          $.each(aqivals[pollutant].scale, function(thisscale) {
            aqivals[pollutant].scale[thisscale].x[0] = "0";
            aqivals[pollutant].scale[thisscale].x[1] = "0";
          });

          // coloring the bar with its aqi range color for the pollutant value
          $.each(plotdata.y, function(yindex) {
            var yvalue = plotdata.y[yindex];
            if (yvalue >= 0 && yvalue < aqivals[pollutant].scale.good.y[0]) {
              color.push(aqivals[pollutant].scale.good.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.good.y[0] && yvalue < aqivals[pollutant].scale.moderate.y[0]) {
              color.push(aqivals[pollutant].scale.moderate.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.moderate.y[0] && yvalue < aqivals[pollutant].scale.unhfsg.y[0]) {
              color.push(aqivals[pollutant].scale.unhfsg.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.unhfsg.y[0] && yvalue < aqivals[pollutant].scale.unhealthy.y[0]) {
              color.push(aqivals[pollutant].scale.unhealthy.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.unhealthy.y[0] && yvalue < aqivals[pollutant].scale.veryunhealthy.y[0]) {
              color.push(aqivals[pollutant].scale.veryunhealthy.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.veryunhealthy.y[0]) {
              color.push(aqivals[pollutant].scale.hazardous.fillcolor);
            }
          });

          plotdata["marker"] = {
            "color": color,
          };

          plotdata["showlegend"] = false;

          Plotly.newPlot("comparison-chart", [plotdata, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
        } else {
          Plotly.newPlot("comparison-chart", [plotdata], layout);
        }
      } else {
        Plotly.newPlot("comparison-chart", [plotdata], layout);
      }

      $("#dropdown-helptext").html("");

    }); // getJSON aqi

  } // function plotComparisonChart

  /**
   * plots the AQI shares graph according to overall average pollutant in scale percentage breakdown
   * @param{percentageBreakdown} average value of pollutant distributed in percentage with each pollutant range
   * @param{community} neighborhood the values belong to
   */
  function plotAQIShares(pollutants, percentageBreakdown, community) {

    // Set the chart width to the width of the chart's HTML element
    var chart_width = $("#aqi-shares-chart").width();

    // transposing to distribute value according to each stack
    var transpose = m => m[0].map((x, i) => m.map(x => x[i]));
    percentageBreakdown = transpose(percentageBreakdown);

    // values to render each pollutant range
    var good = {
      x: pollutants,
      y: percentageBreakdown[0],
      type: 'bar',
      text: percentageBreakdown[0].map(m => m + "%"),
      marker: {
        color: pollutantColors[0],
      },
      textposition: 'auto',
      hoverinfo: 'none',
      showlegend: false
    };
    var moderate = {
      x: pollutants,
      y: percentageBreakdown[1],
      type: 'bar',
      marker: {
        color: pollutantColors[1],
      },
      text: percentageBreakdown[1].map(m => m + "%"),
      textposition: 'auto',
      hoverinfo: 'none',
      showlegend: false
    };
    var unhfsg = {
      x: pollutants,
      y: percentageBreakdown[2],
      type: 'bar',
      text: percentageBreakdown[2].map(m => m + "%"),
      marker: {
        color: pollutantColors[2],
      },
      textposition: 'auto',
      hoverinfo: 'none',
      showlegend: false
    };
    var unhealthy = {
      x: pollutants,
      y: percentageBreakdown[3],
      type: 'bar',
      marker: {
        color: pollutantColors[3],
      },
      text: percentageBreakdown[3].map(m => m + "%"),
      textposition: 'auto',
      hoverinfo: 'none',
      showlegend: false
    };
    var veryunhealthy = {
      x: pollutants,
      y: percentageBreakdown[4],
      type: 'bar',
      marker: {
        color: pollutantColors[4],
      },
      text: percentageBreakdown[4].map(m => m + "%"),
      textposition: 'auto',
      hoverinfo: 'none',
      showlegend: false
    };
    var hazardous = {
      x: pollutants,
      y: percentageBreakdown[5],
      type: 'bar',
      marker: {
        color: pollutantColors[5],
      },
      text: percentageBreakdown[5].map(m => m + "%"), // adds percentage symbol for each value
      textposition: 'auto',
      hoverinfo: 'none',
      showlegend: false
    };

    // Set layout settings
    var layout = {
      title: "AQI readings for " + communityNames.get(community) + " neighborhood",
      textposition: 'auto',
      yaxis: {
        title: 'Percentage'
      },
      xaxis: {
        title: 'Pollutants'
      },
      width: chart_width - 25,
      height: 700,
      autosize: true,
      barmode: 'stack',
      showlegend: false
    }; // layout
    $("#aqi-shares-chart").html("");
    Plotly.newPlot("aqi-shares-chart", [good, moderate, unhfsg, unhealthy, veryunhealthy, hazardous], layout);

  } // function plotAQIShares

  /**
   * Builds a Plot.ly chart from using the provided parameters.
   * @param  {string} data         The average pollutant value across all the communities
   * @param  {string} pollutant    The text name of the specific pollutant type. Do not provide HTML.
   * @param  {string} season       The name of the season from which you want to get data.
   */
  function plotSummaryChart(community, season, data, pollutant, sensorcategory) {

    // to identify the max value in y axis
    var ydata = [];

    // color values for each bar
    var color = [];

    // variable that will aggreate from all the manufacturer data
    var plotdata = data[0];

    // TODO: Write this in seperate function
    // *******************

    var dailyAVG = new Map();
    dailyAVG.set("morning", 0.0);
    dailyAVG.set("midday", 0.0);
    dailyAVG.set("afternoon", 0.0);
    dailyAVG.set("evening", 0.0);
    dailyAVG.set("overnight", 0.0);
    var seasonMap = new Map();
    seasonMap.set("Summer", dailyAVG);
    seasonMap.set("Winter", dailyAVG);
    pollutantAGG.set(pollutant, 0.0);


    // aggregate data across multiple manufacturers by daily section
    for (var j = 0; j < data.length; j++) {
      for (var k = 0; k < data[j].section.length; k++) {

        // declare variables to access map
        let key = data[j].section[k];
        let value = data[j].value[k];
        let season = data[j].season[k];

        // stores the value into the Map for each pollutant graph plot
        seasonMap.set(season, dailyAVG.set(key, dailyAVG.get(key) + value));

        //stores the value for display of AQI share
        pollutantAGG.set(pollutant, pollutantAGG.get(pollutant) + value);

      }
    }
    // **************


    // Max data point
    var max_data = Math.max.apply(null, plotdata.y);

    // Set the chart width to the width of the chart's HTML element
    var chart_width = $("#comparison-chart").width();

    // Plot the data with AQI scale, unit, and range if they are available
    $.getJSON("/airquality/api/aqi/", function(aqivals) {



      // Set layout settings
      var layout = {
        title: "Average reading of pollutants for " + communityNames.get(community) + " neighborhood",
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
          $.each(plotdata.y, function(yindex) {
            var yvalue = plotdata.y[yindex];
            if (yvalue >= 0 && yvalue < aqivals[pollutant].scale.good.y[0]) {
              color.push(aqivals[pollutant].scale.good.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.good.y[0] && yvalue < aqivals[pollutant].scale.moderate.y[0]) {
              color.push(aqivals[pollutant].scale.moderate.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.moderate.y[0] && yvalue < aqivals[pollutant].scale.unhfsg.y[0]) {
              color.push(aqivals[pollutant].scale.unhfsg.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.unhfsg.y[0] && yvalue < aqivals[pollutant].scale.unhealthy.y[0]) {
              color.push(aqivals[pollutant].scale.unhealthy.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.unhealthy.y[0] && yvalue < aqivals[pollutant].scale.veryunhealthy.y[0]) {
              color.push(aqivals[pollutant].scale.veryunhealthy.fillcolor);
            } else if (yvalue >= aqivals[pollutant].scale.veryunhealthy.y[0]) {
              color.push(aqivals[pollutant].scale.hazardous.fillcolor);
            }
          });

          plotdata["marker"] = {
            "color": color
          };
          Plotly.newPlot("comparison-chart", [plotdata, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
        } else {
          Plotly.newPlot("comparison-chart", [plotdata, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
        }
      } else {
        Plotly.newPlot("comparison-chart", [plotdata, aqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous], layout);
      }
      //Plotly.newPlot("chart", dataaqivals[pollutant].scale.good, aqivals[pollutant].scale.moderate, aqivals[pollutant].scale.unhfsg, aqivals[pollutant].scale.unhealthy, aqivals[pollutant].scale.veryunhealthy, aqivals[pollutant].scale.hazardous , layout);

      $("#dropdown-helptext").html("");

    }); // getJSON aqi

  } // function plotSummaryChart

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
    if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
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
      // Identifies whether all the sensor are tested and display error message
      var manufacturerChecked = new Map();
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
        if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
          manufacturerChecked.set("aeroqual_no2", false);
          createMarkers("aeroqual_no2", community, season, pollutant, manufacturerChecked);
          showSensorPicker();
        }
      } else if (selected_pollutant == "O3") {
        if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
          manufacturerChecked.set("aeroqual_o3", false);
          createMarkers("aeroqual_o3", community, season, pollutant, manufacturerChecked);
          showSensorPicker();
        }
      } else if (selected_pollutant == "PM1.0") {
        if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
          manufacturerChecked.set("purpleairprimary_pm1.0", false);
          createMarkers("purpleairprimary_pm1.0", community, season, pollutant, manufacturerChecked);
          showSensorPicker();
        } else if (sensorcategory == "Mobile") {
          loadMobile("airterrier_pm1.0", community, season);
        }
      } else if (selected_pollutant == "PM2.5") {
        if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
          manufacturerChecked.set("purpleairprimary_pm2.5", false);
          manufacturerChecked.set("metone_pm2.5", false);
          createMarkers("purpleairprimary_pm2.5", community, season, pollutant, manufacturerChecked);
          createMarkers("metone_pm2.5", community, season, pollutant, manufacturerChecked);
          showSensorPicker();
        } else if (sensorcategory == "Mobile") {
          loadMobile("airterrier_pm2.5", community, season);
        }
      } else if (selected_pollutant == "PM10") {
        if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
          manufacturerChecked.set("purpleairprimary_pm10", false);
          manufacturerChecked.set("metone_pm10", false);
          // Load purpleairprimary_pm10
          createMarkers("purpleairprimary_pm10", community, season, pollutant, manufacturerChecked);
          createMarkers("metone_pm10", community, season, pollutant, manufacturerChecked);
          showSensorPicker();
        } else if (sensorcategory == "Mobile") {
          loadMobile("airterrier_pm10", community, season);
        }
      }
  }

  /**
   * Shows the sensor/route picker menu, and changes the text to be relevant
   */
  function showSensorPicker() {
    $("#dropdown-sensor-container").css("display", "inherit");
    if (selected_sensorcategory == STATIONARY_REP || selected_sensorcategory == STATIONARY_15MIN || selected_sensorcategory == STATIONARY_1HR) {
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
    $("#dropdown-helptext").html("<div class='loading'></div>");
    buildChart(manufacturer, device, selected_pollutant, selected_season, scrollto, selected_community);
    createSummaryTable(manufacturer, device, selected_season, selected_pollutant, selected_community);
    plotCommunities(selected_season, selected_sensorcategory, selected_pollutant, COMPARE); // api = "compare"

    // Set the menu to show the selected Sensor
    $("#selected-sensor").text(device);

    if (position) {
      // Center the map on the selected sensor
      airQualityMap.setCenter(position);
      airQualityMap.setZoom(18);
    } else {
      $("#dropdown-helptext").html("<div class='loading'></div>");
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
    $("#comparison-chart").html("");

    if (resetSensorList) {
      // Reset the sensor list
      $("#dropdown-sensor-container li").remove();
      if (selected_sensorcategory == STATIONARY_REP || selected_sensorcategory == STATIONARY_15MIN || selected_sensorcategory == STATIONARY_1HR) {
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
      $("#dropdown-helptext").html("<div class='loading'></div>");
      var bounds = new google.maps.LatLngBounds();
      console.log("/airquality/api/" + manufacturer + "/ids/?season=" + season +"&community="+community);
      $.getJSON("/airquality/api/" + manufacturer + "/ids/?season=" + season +"&community="+community, function(eachroute) {
        var numRoutesDisplayed = eachroute.length;
        $.each(eachroute, function(route) {
          createLine(manufacturer, eachroute[route].session_title, season);
        });
        if (eachroute == false) {
          $("#dropdown-helptext").html("<span class='error-text'>No sensors found with the selected parameters.</span>");
        } else {
          $("#dropdown-helptext").html("");
          showSensorPicker();
          showHeatmapButton();
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
      heatmapdata = [];
      // Send the request to the api for the specified manufacturer
      $.getJSON("/airquality/api/" + manufacturer + "/routes/?route=" + route + "&season=" + season, function(devices) {
        // For each device returned
        $.each(devices, function(key, device) {
          // put the data into the array
          var thislatlng = new google.maps.LatLng(device.latitude, device.longitude);
          polylinedata.push(thislatlng);
          var thisweightedlocation = {
            lat: device.latitude,
            long: device.longitude,
            weight: device.data
          };
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
          routes.push({
            "line": line,
            "name": route
          });
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

        } else {
          $("#dropdown-helptext").html("<span class='error-text'>No sensors found with the selected parameters.</span>");
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
          console.warn("There are " + devices.length + " points in the selected route. Showing every 4th point on map.");
          everyother = true;
        }
        var counter = 0;
        $.each(devices, function(key, device) {
          counter++;
          if (everyother) {
            if (counter % 4) {
              // Skip this data point.
              return (true);
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
              } else if (device.data > aqivals[pollutant].scale.veryunhealthy.y[0]) {
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
  function showDownloadButton(community, season, sensor) {
    $("#download-button").off();
    $("#download-button").click(function() {
      window.open("/airquality/api/download/?community=" + community + "&season=" + season + "&sensorcategory=" + sensor);
    });
    $("#download-button").show();
    var sensor_type='';
    switch(sensor){
      case "mobile":
        sensor_type="mobile";
        break;
      case "reported":
        sensor_type="stationary";
        break;
      case "15min":
        sensor_type="15 minute stationary";
        break;
      case "1hr":
        sensor_type="hourly stationary";
        break;
    }
    $("#download-button span").text("Download " +sensor_type+ " data of " + community + " community for " + season.toLowerCase());
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
      $("#dropdown-sensor-container").css("display", "none");
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
    $("#summary-table-container").html("<table id='summary-table'><caption>Weather data source: <a target='_blank' href='https://www.wunderground.com/'>wunderground.com</a></caption><thead><th data-dynatable-no-sort='true'>Date</th><th data-dynatable-no-sort='true' style='text-align: right;'>Average</th><th data-dynatable-no-sort='true' style='text-align: right;'>Max</th><th data-dynatable-no-sort='true' style='text-align: right;'>Min</th><th data-dynatable-no-sort='true' style='text-align: right;'>Temperature</th><th data-dynatable-no-sort='true' style='text-align: right;'>Dewpoint</th><th data-dynatable-no-sort='true' style='text-align: right;'>Pressure</th><th data-dynatable-no-sort='true' style='text-align: right;'>Windspeed</th><th data-dynatable-no-sort='true' style='text-align: right;'>Precipitation</th></thead><tbody></tbody></table>");

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
            } else if (thisAverage > aqivals[pollutant].scale.veryunhealthy.y[0]) {
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
            } else if (thisMax > aqivals[pollutant].scale.veryunhealthy.y[0]) {
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
            } else if (thisMin > aqivals[pollutant].scale.veryunhealthy.y[0]) {
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
            } else if (thisAverage > aqivals[pollutant].scale.veryunhealthy.y[0]) {
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
    if (sensorcategory == STATIONARY_REP || sensorcategory == STATIONARY_15MIN || sensorcategory == STATIONARY_1HR) {
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
      switch (targetElement.id) {
        case "dropdown-community-container":
          selectCommunity("LV");
          break;
        case "dropdown-season-container":
          selectSeason("Summer");
          break;
        case "dropdown-sensorcategory-container":
          selectSensorCategory(STATIONARY_REP);
          break;
        case "dropdown-pollutant-container":
          selectPollutant("PM2.5");
          break;
        case "map":
          handleSensorClick("metone_pm2.5", "SASA_MO1", new google.maps.LatLng(41.846744, -87.707265));
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
