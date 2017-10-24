<?php

// Import the keys/secret variables
include("../keys.php");

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the season from the URL parameter -- Escape any bad characters
$season = pg_escape_string(preg_replace('/[^A-Za-z0-9_\-]/', '_', $_GET['season']));

// Get the community to be searching for -- Escape any bad characters
$community = pg_escape_string(preg_replace('/[^A-Za-z0-9_\-]/', '_', $_GET['community']));

// Make sure a season and a community are supplied.
if (empty($season) || empty($community)) {
	die(return_error("An error occurred","Please provide both a season and a community."));
}

print("<h1>Download started. Please allow any popups.</h1>");

// Output directory
$outDirectory = "/data/sasa_airquality/public_html/airquality/downloads/";

// Output URL
$outURL = "/airquality/downloads/";

// Build the SQL query for airterrier
$filename =  $community . "_" . $season . "_airterrier.csv";
$query = "COPY (SELECT * FROM airterrier WHERE upper(SUBSTRING(session_title, 1, 2)) = '" . $community . "' AND season = '" . $season . "' AND error IS DISTINCT FROM 1) TO '" . $outDirectory . $filename . "' (format CSV, HEADER);";
$result = pg_query($dbconn, $query) or die (return_error("Query failed.", pg_last_error()));

print("<script>window.open('" . $outURL . $filename . "')</script>");

// Build the SQL query for aeroqualno2
$filename = $community . "_" . $season . "_aeroqualno2.csv";
$query = "COPY (SELECT * FROM aeroqualno2 WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS DISTINCT FROM 1) TO '" . $outDirectory . $filename . "' (format CSV, HEADER);";
$result = pg_query($dbconn, $query) or die (return_error("Query failed.", pg_last_error()));

print("<script>window.open('" . $outURL . $filename . "')</script>");

// Build the SQL query for aeroqualo3
$filename = $community . "_" . $season . "_aeroqualo3.csv";
$query = "COPY (SELECT * FROM aeroqualo3 WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS DISTINCT FROM 1) TO '" . $outDirectory . $filename . "' (format CSV, HEADER);";
$result = pg_query($dbconn, $query) or die (return_error("Query failed.", pg_last_error()));

print("<script>window.open('" . $outURL . $filename . "')</script>");


// Build the SQL query for metone
$filename = $community . "_" . $season . "_metone.csv";
$query = "COPY (SELECT * FROM metone WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS DISTINCT FROM 1) TO '" . $outDirectory . $filename . "' (format CSV, HEADER);";
$result = pg_query($dbconn, $query) or die (return_error("Query failed.", pg_last_error()));

print("<script>window.open('" . $outURL . $filename . "')</script>");


// Build the SQL query for purpleairprimary
$filename = $community . "_" . $season . "_purpleairprimary.csv";
$query = "COPY (SELECT * FROM purpleairprimary WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS DISTINCT FROM 1) TO '" . $outDirectory . $filename . "' (format CSV, HEADER);";
$result = pg_query($dbconn, $query) or die (return_error("Query failed.", pg_last_error()));

print("<script>window.open('" . $outURL . $filename . "')</script>");


// Build the SQL query for stationarylocations
// TODO: Fix for additional seasons. Currently the season column is null for all values
$filename = $community . "_" . $season . "_stationarylocations.csv";
$query = "COPY (SELECT * FROM stationarylocations WHERE community = '" . $community . "') TO '" . $outDirectory . $filename . "' (format CSV, HEADER)";
$result = pg_query($dbconn, $query) or die (return_error("Query failed.", pg_last_error()));

print("<script>window.open('" . $outURL . $filename . "')</script>");


// Free resultset
pg_free_result($result);

// Closing connection
pg_close($dbconn);

function return_error($error_description, $error_details) {
	return '{"error":"' . $error_description . '","error_details":"' . $error_details .'"}';
}
?>
