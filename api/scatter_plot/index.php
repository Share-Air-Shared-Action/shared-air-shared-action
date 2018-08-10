<?php

// Import the keys/secret variables
include("../keys.php");

// Set the header Content-Type for JSON
header('Content-Type: application/json');

// Open connection to database using variables set in keys
$dbconn = pg_connect("host=" . $dbhost . " port=". $dbport . " dbname=" . $dbname . " user=" . $dbuser . " password=" . $dbpass) or die(return_error("Could not connect to database.", pg_last_error()));

// Get the device ID from the URL parameter
$device = $_GET['device'];

// // Get the season from the URL parameter
// $season = $_GET['season'];
//
// // Get the community to be searching for
// $community = $_GET['community'];
//
// Get the pollutatnt from the URL parameter
$pollutant = $_GET['pollutant'];

$sensorA=$device;
$sensorB=$device."B";

$query = 'select count(distinct device_name) count_n from purpleair where (device_name=$1 or device_name=$2)';
// Run the query
$result = pg_query_params($dbconn, $query, array($sensorA, $sensorB)) or die (return_error("Query 1 failed.", pg_last_error()));
// Create JSON result
$resultArray = pg_fetch_all($result);

if ($resultArray[0]['count_n']==2){

	// Build the SQL query
	if($sensorA=='SASA_PA6_SL_W'){
		$query = 'select a.' . $pollutant . ' sensora,b.' . $pollutant . ' sensorb,a.created_at y,b.created_at y1,(a.created_at-b.created_at) time_shift from (select pm25_cf_atm_ugm3,created_at,row_number() over (order by created_at) as rownum from purpleair_sl where device_name=$1 and (flag is null or flag=9)) a,(select pm25_cf_atm_ugm3,created_at,row_number() over (order by created_at) as rownum from purpleair_sl where device_name=$2 and (flag is null or flag=9)) b where a.rownum=b.rownum';
	} else {
		$query = 'select a.' . $pollutant . ' sensora,b.' . $pollutant . ' sensorb,a.created_at y,(a.created_at-b.created_at) time_shift  from purpleair a,purpleair b where a.device_name=$1 and b.device_name=$2 and (a.flag is null or a.flag=9) and (b.flag is null or b.flag=9) and a.created_at=b.created_at+((select min(created_at) from purpleair where device_name=$1 and (flag is null or flag=9))-(select min(created_at) from purpleair where device_name=$2 and (flag is null or flag=9)))';
	}

	// Run the query
	$result = pg_query_params($dbconn, $query, array($sensorA,$sensorB)) or die (return_error("Query 2 failed.", pg_last_error()));

	// Create JSON result
	$resultArray = pg_fetch_all($result);

	// Seperate out the X and Y (Time and values) data so that it can be charted by plot.ly
	$xAarray = [];
	$xBarray = [];
	$yarray = [];
	$timeShift = $resultArray[0]['time_shift'];

	foreach($resultArray as $item) {
		$yarray[] = substr($item['y'], 0, -3);
		$xAarray[] = floatval($item['sensora']);
		$xBarray[] = floatval($item['sensorb']);
	}

$name = str_replace($pollutant,'_cf_atm_ugm3','');
$pm = strtoupper(substr($name,0,2)) ."<sub>" . substr($name,2) . "</sub> (&mu;g/m<sup>3</sup>)";
	// Build the return array with X, Y, type, and name for plot.ly
	$returnarray = ["status"=>true,"xA" => $xAarray, "xB" => $xBarray, "y" => $yarray, "mode" => "markers", "type" => "scatter", "name" => $pm , "device"=>$device, "timeshift" =>$timeShift];

} else {
	$returnarray = ["status"=>false,"count"=>$resultArray[0]['count_n']];
}


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
