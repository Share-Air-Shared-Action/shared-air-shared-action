<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$season = $_GET['season'];

// Get the season from the URL parameter
$community = $_GET['community'];

// Build the SQL query
$query = 'SELECT DISTINCT purpleairprimary.device_name as device, averages.average, stationarylocations.latitude, stationarylocations.longitude, stationarylocations.community FROM purpleairprimary INNER JOIN stationarylocations ON (purpleairprimary.device_name = stationarylocations.unit_id) INNER JOIN (SELECT avg(purpleairprimary.pm1_cf_atm_ugm3) as average, device_name FROM purpleairprimary WHERE purpleairprimary.season = $1 AND purpleairprimary.community = $2 GROUP BY device_name) as averages ON (averages.device_name = purpleairprimary.device_name) WHERE purpleairprimary.season = $1 AND purpleairprimary.community = $2';

// Run the query
$result = pg_query_params($dbconn, $query, array($season, $community)) or die (return_error("Query failed.", pg_last_error()));

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
