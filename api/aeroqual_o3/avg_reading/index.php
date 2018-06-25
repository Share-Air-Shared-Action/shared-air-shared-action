<?php

// Import the keys/secret variables
include("../../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the community to be searching for
$community = $_GET['community'];

// Build the SQL query
// Agregates from aeroqualo3 and wundergound indvidual for each date and then joined
$query = "select season, day_section, ROUND(cast(avg(o3ppm) as NUMERIC),3) val from (select season, case when tod >= 6 and tod < 10 then 'morning' when tod >= 10 and tod < 14 then 'midday' when tod >= 14 and tod < 16 then 'afternoon' when tod >= 16 and tod < 20 then 'evening' when tod >= 20 and tod < 24 or tod >= 0 and tod < 6  then 'overnight' end day_section, o3ppm from
(select season,to_char(date,'HH24')::integer tod, o3ppm from aeroqualo3 where community=$1 and (season='Summer' or season='Winter') and error is distinct from 1) part_1) part_2 group by season,day_section";

// Run the query
$result = pg_query_params($dbconn, $query, array($community)) or die (return_error("Query failed.", pg_last_error()));

// Create JSON result
$resultArray = pg_fetch_all($result);

// Seperate out the individual columns into independent array
$season = [];
$section = [];
$val = [];

foreach($resultArray as $item) {
	$season[] = $item['season'];
	$section[] = $item['day_section'];
	$val[] = floatval($item['val']);
}

// Build the return array with season, section and val
$returnarray = ["season" => $season, "section" => $section, "val" => $val];

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
