<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the device ID from the URL parameter
$device = $_GET['device'];

// Get the season from the URL parameter
$season = $_GET['season'];

// Get the community from the URL parameter
$community = $_GET['community'];

// Build the SQL query
// Agregates from metone and wundergound indvidual for each date and then joined
$query = "SELECT DATE(metone.date_val),ROUND(cast(metone.average as NUMERIC),3) average,ROUND(cast(metone.maximum as NUMERIC),3) AS max,ROUND(cast(metone.minimum as NUMERIC),3) as MIN,weather.temperature,weather.dewpoint,weather.pressure,weather.windspeed,weather.precipitation FROM (SELECT DATE(time) date_val,AVG(value) AS average,max(value) AS maximum,min(value) AS minimum FROM metone WHERE unit_id=$1 AND community=$3 AND season=$2 AND type = 'pm25' AND error IS DISTINCT FROM 1 GROUP BY DATE(time)) AS metone LEFT JOIN (SELECT DATE(observation_time) date_val,ROUND(AVG(CAST(TEMP_F as NUMERIC)),3) AS Temperature, ROUND(AVG(cast(dewpoint_f as NUMERIC)),3) AS DewPoint, ROUND(AVG(CAST(pressure_in AS NUMERIC)),3) AS Pressure, ROUND(AVG(CAST(wind_mph AS NUMERIC)),3) AS WindSpeed, ROUND(SUM(CAST(precip_1hr_in AS NUMERIC)),3) AS Precipitation FROM wundergound WHERE community = $3 GROUP BY DATE(observation_time)) AS weather ON DATE(metone.date_val)=DATE(weather.date_val) ORDER BY metone.date_val";

// Run the query
$result = pg_query_params($dbconn, $query, array($device, $season, $community)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultArray = pg_fetch_all($result);

// Encode the array as JSON and return it.
echo json_encode($resultArray);

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);

function return_error($error_description, $error_details) {
	return '{"error":"' . $error_description . '","error_details":"' . $error_details .'"}';
}
?>
