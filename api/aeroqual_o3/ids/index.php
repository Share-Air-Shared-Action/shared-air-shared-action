<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$season = $_GET['season'];

// Build the SQL query
$query = 'SELECT DISTINCT aeroqualo3.unit_id as device, stationarylocations.latitude, stationarylocations.longitude, stationarylocations.community FROM aeroqualo3 INNER JOIN stationarylocations ON (aeroqualo3.unit_id = stationarylocations.unit_id) WHERE aeroqualo3.season = $1';

// Run the query
$result = pg_query_params($dbconn, $query, array($season)) or die (return_error("Query failed.", pg_last_error()));

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
