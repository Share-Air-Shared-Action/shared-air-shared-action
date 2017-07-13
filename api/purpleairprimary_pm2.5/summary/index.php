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
$query = "SELECT DATE(created_at), round(cast(avg(purpleairprimary.pm25_cf_atm_ugm3) as numeric),3) as average, round(cast(max(purpleairprimary.pm25_cf_atm_ugm3) as numeric),3) as max, round(cast(min(purpleairprimary.pm25_cf_atm_ugm3) as numeric),3) as min, round(avg(cast(weather.TEMP as numeric)),3) as Temperature, round(avg(cast(weather.DEWP as numeric)),3) as DewPoint, round(avg(cast(weather.alt as numeric)),3) as Pressure, round(avg(cast(weather.SPD as numeric)),3) as WindSpeed, round(sum(cast(regexp_replace(weather.pcp01, '[^0-9]+', '', 'g') as numeric)),3) as Precipitation FROM purpleairprimary LEFT JOIN weather ON DATE(purpleairprimary.created_at) = DATE(weather.yrmodahrmn) WHERE device_name = $1 AND season = $2 GROUP BY DATE(created_at) ORDER BY DATE(created_at)";

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
