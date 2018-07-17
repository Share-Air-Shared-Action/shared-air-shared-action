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
$query = 'SELECT DISTINCT aeroqualno2.unit_id as device, averages.average, stationarylocations.latitude, stationarylocations.longitude, stationarylocations.community FROM aeroqualno2 INNER JOIN stationarylocations ON (aeroqualno2.unit_id = stationarylocations.unit_id) INNER JOIN (SELECT avg(aeroqualno2.no2ppm) as average, unit_id FROM aeroqualno2 WHERE season = $1 AND community = $2 AND flag is null GROUP BY unit_id) as averages ON (averages.unit_id = aeroqualno2.unit_id) WHERE aeroqualno2.season = $1 AND aeroqualno2.community = $2 AND stationarylocations.community = $2';

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
