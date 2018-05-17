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

// Get the community to be searching for
$community = $_GET['community'];

// Build the SQL query
// Agregates from aeroqualo3 and wundergound indvidual for each date and then joined
$query = "SELECT DATE(aeroqualo3.date_val),ROUND(cast(aeroqualo3.average as NUMERIC),3) average,ROUND(cast(aeroqualo3.maximum as NUMERIC),3) AS max,ROUND(cast(aeroqualo3.minimum as NUMERIC),3) as MIN,weather.temperature,weather.dewpoint,weather.pressure,weather.windspeed,weather.precipitation FROM (SELECT DATE(date) date_val,AVG(o3ppm) AS average,max(o3ppm) AS maximum,min(o3ppm) AS minimum FROM aeroqualo3 WHERE unit_id = $1 AND season = $2 AND community= $3 AND error IS DISTINCT FROM 1 GROUP BY DATE(date)) AS aeroqualo3 LEFT JOIN (SELECT DATE(observation_time) date_val,ROUND(AVG(CAST(TEMP_F as NUMERIC)),3) AS Temperature, ROUND(AVG(cast(dewpoint_f as NUMERIC)),3) AS DewPoint, ROUND(AVG(CAST(pressure_in AS NUMERIC)),3) AS Pressure, ROUND(AVG(CAST(wind_mph AS NUMERIC)),3) AS WindSpeed, ROUND(SUM(CAST(precip_1hr_in AS NUMERIC)),3) AS Precipitation FROM wundergound WHERE community = $3 GROUP BY DATE(observation_time)) AS weather ON DATE(aeroqualo3.date_val)=DATE(weather.date_val) ORDER BY aeroqualo3.date_val";

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
