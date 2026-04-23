<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$db = getDB();
$collection = $db->users;

$data = json_decode(file_get_contents("php://input"));

try {
    if(!empty($data->username) && !empty($data->password) && !empty($data->role)) {
        $user = $collection->findOne(['username' => $data->username]);
        if($user) {
            http_response_code(400);
            echo json_encode(array("message" => "Username already exists."));
            exit;
        }

        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);

        $insertResult = $collection->insertOne([
            'username' => $data->username,
            'password' => $hashed_password,
            'role' => $data->role
        ]);

        if($insertResult->getInsertedCount() > 0) {
            http_response_code(201);
            echo json_encode(array("message" => "Registration successful! Please login."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create user."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array("message" => "Database Error: " . $e->getMessage()));
}
?>
