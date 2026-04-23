<?php
require_once __DIR__ . '/../vendor/autoload.php';

function getDB() {
    // Swapped to use your working cluster from the skill_swap project
    $uri = "mongodb+srv://shreyabkd544_db_user:Shreya12345@cluster0.gqhpkra.mongodb.net/?retryWrites=true&w=majority";
    $client = new MongoDB\Client($uri);
    return $client->smart_helmet_db;
}
?>
