<?php
$servername = "REPLACE";
$username = "REPLACE";
$password = "REPLACE";
$database = "REPLACE";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
