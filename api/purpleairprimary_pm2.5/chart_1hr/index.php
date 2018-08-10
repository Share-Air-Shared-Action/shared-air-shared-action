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
// $query = "SELECT time AS x, value_avg AS y FROM aeroqualno2_1hr WHERE unit_id = $1 AND season = $2 AND community = $3 ORDER BY time";
$query = "select hourly.created_at as x,y1,y2 from (select created_at,round(pm25_cf_atm_ugm3_avg::numeric,3) as y1 from purpleair_1hr where purpleair_1hr.device_name = $1 AND purpleair_1hr.season = $2 AND purpleair_1hr.community = $3) hourly left join (select epa_hourly_pm25.date_local+epa_hourly_pm25.time_local date_time, (case when epa_hourly_pm25.sample_measurement=0 then -1 else epa_hourly_pm25.sample_measurement end) as y2 from epa_sensors_community_lookup,epa_hourly_pm25 where epa_sensors_community_lookup.longitude::numeric=epa_hourly_pm25.longitude::numeric and epa_sensors_community_lookup.latitude::numeric=epa_hourly_pm25.latitude::numeric and epa_sensors_community_lookup.community= $3 AND epa_sensors_community_lookup.pollutant='pm2.5') epa on to_char(hourly.created_at, 'YYYY-MM-DD HH24')=to_char(epa.date_time, 'YYYY-MM-DD HH24') order by 1";

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
