<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$community = $_GET['community'];


// Build the SQL query
$query = 'select community, (sum(case when no2ppm<0.053 then 1 else 0 end)*100)/count(*) as good,  (sum(case when no2ppm>0.053 and no2ppm<0.1 then 1 else 0 end)*100)/count(*) as moderate,  (sum(case when no2ppm>0.1 and no2ppm<0.36 then 1 else 0 end)*100)/count(*) as unhfsg,  (sum(case when no2ppm>0.36 and no2ppm<0.649 then 1 else 0 end)*100)/count(*) as unhealthy,  (sum(case when no2ppm>0.649 and no2ppm<1.249 then 1 else 0 end)*100)/count(*) as veryunhealthy,  (sum(case when no2ppm>1.249 then 1 else 0 end)*100)/count(*) as hazardous  from aeroqualno2 where community=$1 and error is distinct from 1 group by community';

// Run the query
$result = pg_query_params($dbconn, $query, array($community)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultRow = pg_fetch_row($result);


// Build the return array with community and other points for plot.ly
$returnarray = ["community" => $resultRow[0],  "good" => $resultRow[1], "moderate" => $resultRow[2], "unhfsg" => $resultRow[3], "unhealthy" => $resultRow[4], "veryunhealthy" => $resultRow[5], "hazardous" => $resultRow[6], "mode" => "markers", "type" => "bar", "name" => "NO<sub>2</sub> (ppb)" ];

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
