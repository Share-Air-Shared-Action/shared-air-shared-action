<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$community = $_GET['community'];

// Setting the measurment type
$measurement_type = 'Particulate Matter';

// When three distinct pm value is available
$sensor_name='AirBeam2-PM10';


// Build the SQL query
$query = 'select upper(substr(session_title,0,3)) as community, sum(case when measured_value < 54 then 1 else 0 end) as good, sum(case when measured_value > 54 and measured_value < 154 then 1 else 0 end) as moderate, sum(case when measured_value > 154 and measured_value < 254 then 1 else 0 end) as unhfsg, sum(case when measured_value > 254 and measured_value < 354 then 1 else 0 end) as unhealthy, sum(case when measured_value > 354 and measured_value < 424 then 1 else 0 end) as very_unhealthy, sum(case when measured_value > 424 then 1 else 0 end) as hazardous, count(*) as total from airterrier where upper(substr(session_title,0,3))=$1 and error is distinct from 1 and measurement_type = $2 and sensor_name=$3 group by upper(substr(session_title,0,3))';

// Run the query
$result = pg_query_params($dbconn, $query, array($community, $measurement_type,$sensor_name)) or die (return_error("Query failed.", pg_last_error()));

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
