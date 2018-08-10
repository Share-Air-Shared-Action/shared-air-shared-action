<?php

// Import the keys/secret variables
include("../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

$query = "select device_name from purpleair where (community='NB' and device_name not like '%BB') or (community!='NB' and device_name not like '%B') group by device_name order by device_name";
// Run the query
$result = pg_query_params($dbconn, $query, array()) or die (return_error("Query 1 failed.", pg_last_error()));
// Create JSON result
$resultArray = pg_fetch_all($result);

// Seperate out the X and Y (Time and values) data so that it can be charted by plot.ly
$deviceName = [];

foreach($resultArray as $item) {
	$deviceName[] = $item['device_name'];
}

$returnarray = ["devices"=>$deviceName];

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
