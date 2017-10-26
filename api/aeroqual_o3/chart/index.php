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
$query = 'SELECT date AS x, o3ppm AS y FROM aeroqualo3 WHERE unit_id = $1 AND season = $2 AND community = $3 AND error IS DISTINCT FROM 1 ORDER BY date';

// Run the query
$result = pg_query_params($dbconn, $query, array($device, $season, $community)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultArray = pg_fetch_all($result);

// Seperate out the X and Y (Time and values) data so that it can be charted by plot.ly
$xarray = [];
$yarray = [];

foreach($resultArray as $item) {
	$xarray[] = substr($item['x'], 0, -3);
	$yarray[] = floatval($item['y']);
}

// Build the return array with X, Y, type, and name for plot.ly
$returnarray = ["x" => $xarray, "y" => $yarray, "type" => "scatter", "name" => "O<sub>3</sub> (ppm)"];

// Encode the array as JSON and return it.
echo json_encode($returnarray);

// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);

function return_error($error_description, $error_details) {
	return '{"error":"' . $error_description . '","error_details":"' . $error_details .'"}';
}
?>
