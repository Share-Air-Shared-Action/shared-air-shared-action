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
$query = 'select location.community as x, coalesce(aeroqualo3.y,0) as y from (select community from stationarylocations group by community) location left join (SELECT aeroqualo3.community AS x, ROUND(CAST(AVG(o3ppm) as NUMERIC),3) AS y FROM aeroqualo3 WHERE season=$1 AND error IS distinct FROM 1 GROUP BY aeroqualo3.community) aeroqualo3 on location.community=aeroqualo3.x order by location.community';

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
$returnarray = ["x" => $xarray, "y" => $yarray, "text" => $xarray , "mode" => "markers", "type" => "bar", "name" => "O<sub>3</sub> (ppm)" ];

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
