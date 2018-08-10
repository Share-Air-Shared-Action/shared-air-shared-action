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
$table = $_GET['table'];
// Make sure a season and a community are supplied.
if (empty($table)) {
	die(return_error("An error occurred","Please provide table name."));
}

print("<h1>Download started. Please allow any popups.</h1>");

// Output the valid tables to the folder
if ($table == "airterrier"){
	print("<script>window.open('" . $outURL . $table . ".csv')</script>");
	// exec($execConn. " (SELECT * FROM ". $table . " WHERE flag is distinct from 90) to '" . $outDirectory . $table . ".csv' (format CSV,HEADER)\"");
} elseif ($table == "purpleair") {
	exec($execConn. " (SELECT * FROM ". $table . "_lv WHERE flag is distinct from 90) to '" . $outDirectory . $table . "_lv.csv' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $table . "_lv.csv')</script>");
	exec($execConn. " (SELECT * FROM ". $table . "_nb WHERE flag is distinct from 90) to '" . $outDirectory . $table . "_nb.csv' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $table . "_nb.csv')</script>");
	exec($execConn. " (SELECT * FROM ". $table . "_pc WHERE flag is distinct from 90) to '" . $outDirectory . $table . "_pc.csv' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $table . "_pc.csv')</script>");
	exec($execConn. " (SELECT * FROM ". $table . "_sl WHERE flag is distinct from 90) to '" . $outDirectory . $table . "_sl.csv' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $table . "_se.csv')</script>");
	exec($execConn. " (SELECT * FROM ". $table . "_se WHERE flag is distinct from 90) to '" . $outDirectory . $table . "_se.csv' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $table . "_sl.csv')</script>");
} elseif ( $table == "metone" || $table == "aeroqualno2" || $table == "aeroqualo3"){
  $filename = $table . ".csv";
  exec($execConn. " (SELECT * FROM ". $table . " WHERE flag is distinct from 90) to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");
} elseif ( $table == "stationarylocations" || $table == "wundergound" || $table == "airterrier_suspect" || $table == "purpleair_suspect" || $table == "metone_suspect" || $table == "aeroqualno2_suspect" || $table == "aeroqualo3_suspect" || $table == "sasa_no2_1hr" || $table == "sasa_o3_1hr" || $table == "sasa_pm25_1hr" || $table == "sasa_pm10_1hr" || $table == "sasa_no2_24hr" || $table == "sasa_o3_24hr" || $table == "sasa_pm25_24hr" || $table == "sasa_pm10_24hr" || $table == "sasa_no2_summary" || $table == "sasa_o3_summary" || $table == "sasa_pm25_summary" || $table == "sasa_pm10_summary" || $table == "epa_daily_co" || $table == "epa_daily_no2" || $table == "epa_daily_o3" || $table == "epa_daily_pm10" || $table == "epa_daily_pm25" || $table == "epa_hourly_co" || $table == "epa_hourly_no2" || $table == "epa_hourly_o3" || $table == "epa_hourly_pm10" || $table == "epa_hourly_pm25" || $table == "database_table_lookup" || $table == "flag_lookup" || $table == "sasa_o3_8hr" ){
  $filename = $table . ".csv";
  exec($execConn. " (SELECT * FROM ". $table . ") to '" . $outDirectory . $filename . "' (format CSV,HEADER)\"");
	print("<script>window.open('" . $outURL . $filename . "')</script>");
} else {
	print("<h3>Table not found</h3>");
}



function return_error($error_description, $error_details) {
	return '{"error":"' . $error_description . '","error_details":"' . $error_details .'"}';
}
?>
