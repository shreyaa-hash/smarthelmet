<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/database.php';

$db = getDB();
$collection = $db->users;

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->username) && !empty($data->password)) {
    $user = $collection->findOne(['username' => $data->username]);

    if($user && password_verify($data->password, $user['password'])) {
        http_response_code(200);
        echo json_encode(array(
            "message" => "Successful login.",
            "user" => array(
                "id" => (string)$user['_id'],
                "username" => $user['username'],
                "role" => $user['role']
            )
        ));
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Login failed."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
