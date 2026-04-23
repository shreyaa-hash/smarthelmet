<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$db = getDB();
$collection = $db->sensor_data;

$data = json_decode(file_get_contents("php://input"));

if(
    isset($data->gas) &&
    isset($data->temperature) &&
    isset($data->humidity) &&
    isset($data->distance) &&
    isset($data->moisture)
) {
    $insertResult = $collection->insertOne([
        'gas' => $data->gas,
        'temperature' => $data->temperature,
        'humidity' => $data->humidity,
        'distance' => $data->distance,
        'moisture' => $data->moisture,
        'timestamp' => new MongoDB\BSON\UTCDateTime()
    ]);

    if($insertResult->getInsertedCount() > 0) {
        http_response_code(201);
        echo json_encode(array("message" => "Sensor data saved."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to save sensor data."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
