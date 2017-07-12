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

// Build the SQL query
$query = "SELECT DATE(time), round(cast(avg(airterrier.measured_value) as numeric),3) as average, round(cast(max(airterrier.measured_value) as numeric),3) as max, round(cast(min(airterrier.measured_value) as numeric),3) as min, round(avg(cast(weather.TEMP as numeric)),3) as Temperature, round(avg(cast(weather.DEWP as numeric)),3) as DewPoint, round(avg(cast(weather.STP as numeric)),3) as Pressure, round(avg(cast(weather.SPD as numeric)),3) as WindSpeed, round(sum(cast(regexp_replace(weather.pcp01, '[^0-9]+', '', 'g') as numeric)),3) as Precipitation FROM airterrier LEFT JOIN weather ON DATE(airterrier.time) = DATE(weather.yrmodahrmn) WHERE measurement_type = 'CO2 concentration' AND session_title = $1 AND season = $2 GROUP BY DATE(time) ORDER BY DATE(time)";

// Run the query
$result = pg_query_params($dbconn, $query, array($device, $season)) or die (return_error("Query failed.", pg_last_error()));

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
