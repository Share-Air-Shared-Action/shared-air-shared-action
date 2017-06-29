<?php

// Import the keys/secret variables
include("../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter
$mindate = $_GET['mindate'];

// Get the season from the URL parameter
$maxdate = $_GET['maxdate'];

// Build the SQL query
$query = 'SELECT DATE(yrmodahrmn) as "date", round(avg(cast(TEMP as numeric)),3) as Temperature, round(avg(cast(DEWP as numeric)),3) as DewPoint, round(avg(cast(STP as numeric)),3) as Pressure, round(avg(cast(ALT as numeric)),3) as Altitude, round(avg(cast(SPD as numeric)),3) as WindSpeed from weather WHERE DATE(yrmodahrmn) >= DATE($1) AND DATE(yrmodahrmn) <= DATE($2) GROUP BY DATE(yrmodahrmn) ORDER BY DATE(yrmodahrmn)';
// round(avg(cast(PCP01 as numeric)),3) as Precipitation
// Does not work due to some values being 0.00T

// Run the query
$result = pg_query_params($dbconn, $query, array($mindate, $maxdate)) or die (return_error("Query failed.", pg_last_error()));

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
