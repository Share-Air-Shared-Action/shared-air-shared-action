<?php

// Import the keys/secret variables
include("../keys.php");


// Output directory
$outDirectory = "/data/sasa_airquality/public_html/airquality/downloads/";

// Output URL
$outURL = "/airquality/downloads/";

// Build prefix of the psql command to execute on unix cmd
$execConn = 'PGPASSWORD='. $dbpass.' psql -p 5432 -h postgresql.cs.ksu.edu -d sasaairqualityproject -U sasaairqualityproject -c "\COPY';

// Get the season from the URL parameter -- Escape any bad characters
$season = pg_escape_string(preg_replace('/[^A-Za-z0-9_\-]/', '_', $_GET['season']));

// Get the community to be searching for -- Escape any bad characters
$community = pg_escape_string(preg_replace('/[^A-Za-z0-9_\-]/', '_', $_GET['community']));

// Make sure a season and a community are supplied.
if (empty($season) || empty($community)) {
	die(return_error("An error occurred","Please provide both a season and a community."));
}

print("<h1>Download started. Please allow any popups.</h1>");

// Build the SQL query for airterrier
$filename =  $community . "_" . $season . "_airterrier.csv";
// Execute the command to create csv for airterrier
exec($execConn. " (SELECT * FROM airterrier WHERE upper(SUBSTRING(session_title, 1, 2)) = '" . $community . "' AND season = '" . $season . "' AND error IS NOT NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
// Download the file to client
print("<script>window.open('" . $outURL . $filename . "')</script>");

// Build the SQL query for aeroqualno2
$filename = $community . "_" . $season . "_aeroqualno2.csv";
exec($execConn. " (SELECT * FROM aeroqualno2 WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS NOT NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
print("<script>window.open('" . $outURL . $filename . "')</script>");

// Build the SQL query for aeroqualo3
$filename = $community . "_" . $season . "_aeroqualo3.csv";
exec($execConn. " (SELECT * FROM aeroqualo3 WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS NOT NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
print("<script>window.open('" . $outURL . $filename . "')</script>");


// Build the SQL query for metone
$filename = $community . "_" . $season . "_metone.csv";
exec($execConn. " (SELECT * FROM metone WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS NOT NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
print("<script>window.open('" . $outURL . $filename . "')</script>");


// Build the SQL query for purpleairprimary
$filename = $community . "_" . $season . "_purpleairprimary.csv";

exec($execConn. " (SELECT * FROM purpleair WHERE community = '" . $community . "' AND season = '" . $season . "' AND error IS NOT NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
print("<script>window.open('" . $outURL . $filename . "')</script>");


// Build the SQL query for stationarylocations
// TODO: Fix for additional seasons. Currently the season column is null for all values
$filename = $community . "_" . $season . "_stationarylocations.csv";
exec($execConn. " (SELECT * FROM stationarylocations WHERE community = '" . $community . "') to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
print("<script>window.open('" . $outURL . $filename . "')</script>");


// Free resultset
//pg_free_result($result);

// Closing connection
//pg_close($dbconn);

function return_error($error_description, $error_details) {
	return '{"error":"' . $error_description . '","error_details":"' . $error_details .'"}';
}
?>
