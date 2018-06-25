<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$community = $_GET['community'];
$type = 'pm25';

// Build the SQL query
$query = 'select community, sum(case when value < 12.0 then 1 else 0 end) as good, sum(case when value > 12.0 and value < 35.4 then 1 else 0 end) as moderate, sum(case when value > 35.4 and value < 55.4 then 1 else 0 end) as unhfsg, sum(case when value > 55.4 and value < 150.4 then 1 else 0 end) as unhealthy, sum(case when value > 150.4 and value < 250.4 then 1 else 0 end) as very_unhealthy, sum(case when value > 250.4 then 1 else 0 end) as hazardous, count(*) as total from metone where community=$1 and error is distinct from 1 AND type = $2 group by community';

// Run the query
$result = pg_query_params($dbconn, $query, array($community, $type)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultRow = pg_fetch_row($result);


// Build the return array with community and other points for plot.ly
$returnarray = ["community" => $resultRow[0],  "aqi" => ["good" => $resultRow[1], "moderate" => $resultRow[2], "unhfsg" => $resultRow[3], "unhealthy" => $resultRow[4], "veryunhealthy" => $resultRow[5], "hazardous" => $resultRow[6] ], "total" => $resultRow[7], "mode" => "markers", "type" => "bar", "name" => "NO<sub>2</sub> (ppb)" ];


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
