<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$season = $_GET['season'];


// Build the SQL query
$query = 'select location.community as x, coalesce(purpleair.y,0) as y from (select community from stationarylocations group by community) location left join (select purpleair.community AS x, ROUND(CAST(AVG(pm10_cf_atm_ugm3) as NUMERIC),3) AS y FROM purpleair where flag is null and season=$1 group by purpleair.community) purpleair on location.community=purpleair.x order by location.community';

// Run the query
$result = pg_query_params($dbconn, $query, array($season)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultArray = pg_fetch_all($result);

// Seperate out the X and Y (Time and values) data so that it can be charted by plot.ly
$xarray = [];
$yarray = [];

foreach($resultArray as $item) {
	$xarray[] = $item['x'];
	$yarray[] = floatval($item['y']);
}

// Build the return array with X, Y, type, and name for plot.ly
$returnarray = ["x" => $xarray, "y" => $yarray, "text" => $xarray , "mode" => "markers", "type" => "bar", "name" => "PM<sub>10</sub> (&mu;g/m<sup>3</sup>)" ];

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
