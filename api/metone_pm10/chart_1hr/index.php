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
// $query = "SELECT time AS x, value_avg AS y FROM metone_1hr WHERE unit_id = $1 AND season = $2 AND community = $3 AND type = 'pm10' ORDER BY time";
$query = "select metone_1hr.time as x,round(metone_1hr.avg_value::numeric,3) as y1,(case when epa_hourly_pm10.sample_measurement=0 then -1 else epa_hourly_pm10.sample_measurement end) as y2 from metone_1hr,epa_sensors_community_lookup,epa_hourly_pm10 where metone_1hr.unit_id = $1 AND metone_1hr.season = $2 AND metone_1hr.community = $3 AND metone_1hr.type = 'pm10' and epa_sensors_community_lookup.pollutant='pm10' AND metone_1hr.community=epa_sensors_community_lookup.community and epa_sensors_community_lookup.longitude=epa_hourly_pm10.longitude and epa_sensors_community_lookup.latitude=epa_hourly_pm10.latitude and to_char(metone_1hr.time, 'YYYY-MM-DD HH24:MI:SS')=to_char(epa_hourly_pm10.date_local+epa_hourly_pm10.time_local, 'YYYY-MM-DD HH24:MI:SS') order by 1";

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
