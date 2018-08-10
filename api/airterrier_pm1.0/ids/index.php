<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$season = $_GET['season'];
$sensor_name='AirBeam2-PM1';
$community = $_GET['community'];

// Build the SQL query
$query = "SELECT DISTINCT session_title, community, season FROM airterrier WHERE measurement_type = 'Particulate Matter' AND season = $1 AND sensor_name=$2 AND community=$3 AND flag is null";

// Run the query
$result = pg_query_params($dbconn, $query, array($season,$sensor_name,$community)) or die (return_error("Query failed.", pg_last_error()));

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
