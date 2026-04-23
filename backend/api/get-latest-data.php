<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$db = getDB();
$collection = $db->sensor_data;

// Get the latest record based on timestamp
$cursor = $collection->find(
    [],
    [
        'sort' => ['timestamp' => -1],
        'limit' => 1
    ]
);

$data = [];
foreach ($cursor as $document) {
    $data = [
        'gas' => $document['gas'],
        'temperature' => $document['temperature'],
        'humidity' => $document['humidity'],
        'distance' => $document['distance'],
        'moisture' => $document['moisture'],
        'timestamp' => $document['timestamp']->toDateTime()->format('Y-m-d H:i:s')
    ];
}

if(!empty($data)) {
    http_response_code(200);
    echo json_encode($data);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No data found."));
}
?>
