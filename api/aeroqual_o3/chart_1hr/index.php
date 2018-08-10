<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the device ID from the URL parameter, and store only numbers into a variable (help prevent SQL injection)
$device = $_GET['device'];

// Get the season to be searching for
$season = $_GET['season'];

// Get the community to be searching for
$community = $_GET['community'];

// Build the SQL query
// $query = "SELECT time AS x, value_avg AS y FROM aeroqualo3_1hr WHERE unit_id = $1 AND season = $2 AND community = $3 AND type = 'pm10' ORDER BY time";
$query = "select aeroqualo3_1hr.date as x,round(aeroqualo3_1hr.o3ppm_avg::numeric,3) as y1,(case when epa_hourly_o3.sample_measurement=0 then -1 else epa_hourly_o3.sample_measurement end) as y2 from aeroqualo3_1hr,epa_sensors_community_lookup,epa_hourly_o3 where aeroqualo3_1hr.unit_id = $1 AND aeroqualo3_1hr.season = $2 AND epa_sensors_community_lookup.pollutant='o3' AND aeroqualo3_1hr.community = $3 AND aeroqualo3_1hr.community=epa_sensors_community_lookup.community and epa_sensors_community_lookup.longitude=epa_hourly_o3.longitude and epa_sensors_community_lookup.latitude=epa_hourly_o3.latitude and to_char(aeroqualo3_1hr.date, 'YYYY-MM-DD HH24')=to_char(epa_hourly_o3.date_local+epa_hourly_o3.time_local, 'YYYY-MM-DD HH24') order by 1";

// Run the query
$result = pg_query_params($dbconn, $query, array($device, $season, $community)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultArray = pg_fetch_all($result);

// Seperate out the X and Y (Time and values) data so that it can be charted by plot.ly
$xarray = [];
$y1array = [];
$y2array = [];

foreach($resultArray as $item) {
	$xarray[] = substr($item['x'], 0, -3);
	$y1array[] = floatval($item['y1']);
	$y2array[] = floatval($item['y2']);
}

// Build the return array with X, Y, type, and name for plot.ly
$returnarray = ["x" => $xarray, "y" => $y1array, "y1" => $y2array, "mode" => "markers", "type" => "scatter", "name" => "PM<sub>2.5</sub> (&mu;g/m<sup>3</sup>)"];

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
