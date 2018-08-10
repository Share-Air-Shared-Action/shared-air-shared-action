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

// Get the community to be searching for -- Escape any bad characters
$sensorcategory = pg_escape_string(preg_replace('/[^A-Za-z0-9_\-]/', '_', $_GET['sensorcategory']));


// Make sure a season and a community are supplied.
if (empty($season) || empty($community) || empty($sensorcategory)) {
	die(return_error("An error occurred","Please provide Season, Community and Sensorcategory."));
}

print("<h1>Download started. Please allow any popups.</h1>");

if($sensorcategory=="mobile") {
	// Build the SQL query for airterrier
	$filename =  $community . "_" . $season . "_" . $sensorcategory . "_airterrier.csv";
	// Execute the command to create csv for airterrier
	exec($execConn. " (SELECT * FROM airterrier WHERE community = '" . $community . "' AND season = '" . $season . "' AND flag IS NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	// Download the file to client
	print("<script>window.open('" . $outURL . $filename . "')</script>");
} elseif ($sensorcategory == "reported") {

	// Build the SQL query for aeroqualno2
	$filename = $community . "_" . $season . "_" . ucwords($sensorcategory) . "_aeroqualno2.csv";
	exec($execConn. " (SELECT * FROM aeroqualno2 WHERE community = '" . $community . "' AND season = '" . $season . "' AND flag IS NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for aeroqualo3
	$filename = $community . "_" . $season . "_" . ucwords($sensorcategory) . "_aeroqualo3.csv";
	exec($execConn. " (SELECT * FROM aeroqualo3 WHERE community = '" . $community . "' AND season = '" . $season . "' AND flag IS NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");


	// Build the SQL query for metone
	$filename = $community . "_" . $season . "_" . ucwords($sensorcategory) . "_metone.csv";
	exec($execConn. " (SELECT * FROM metone WHERE community = '" . $community . "' AND season = '" . $season . "' AND flag IS NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for purpleairprimary
	$filename = $community . "_" . $season . "_" . ucwords($sensorcategory) . "_purpleairprimary.csv";
	exec($execConn. " (SELECT * FROM purpleair WHERE community = '" . $community . "' AND season = '" . $season . "' AND flag IS NULL) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

} elseif ($sensorcategory=="15min") {

	// Build the SQL query for aeroqualno2
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_aeroqualno2.csv";
	exec($execConn. " (SELECT * FROM aeroqualno2_15min WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for aeroqualo3
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_aeroqualo3.csv";
	exec($execConn. " (SELECT * FROM aeroqualo3_15min WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for metone
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_metone.csv";
	exec($execConn. " (SELECT * FROM metone_15min WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for purpleairprimary
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_purpleairprimary.csv";
	exec($execConn. " (SELECT * FROM purpleair_15min WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

} elseif ($sensorcategory=="1hr") {

	// Build the SQL query for aeroqualno2
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_aeroqualno2.csv";
	exec($execConn. " (SELECT * FROM aeroqualno2_1hr WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for aeroqualo3
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_aeroqualo3.csv";
	exec($execConn. " (SELECT * FROM aeroqualo3_1hr WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for metone
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_metone.csv";
	exec($execConn. " (SELECT * FROM metone_1hr WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

	// Build the SQL query for purpleairprimary
	$filename = $community . "_" . $season . "_" . $sensorcategory . "_avg_purpleairprimary.csv";
	exec($execConn. " (SELECT * FROM purpleair_1hr WHERE community = '" . $community . "' AND season = '" . $season . "' ) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");

}


// Build the SQL query for stationarylocations
// TODO: Fix for additional seasons. Currently the season column is null for all values
$filename = $community . "_" . $season . "_" . $sensorcategory . "_stationarylocations.csv";
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
