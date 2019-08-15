<?php
include_once 'global.php';

$email = mysqli_real_escape_string($conn, $_GET['email']);
$password = $_GET['password'];

$result = mysqli_query($conn, "SELECT id, password FROM user WHERE active = 1 AND email = '" . $email . "'");
if ($result->num_rows > 0) {
    $row = mysqli_fetch_assoc($result);
    $userId = $row['id'];
    $passwordHash = $row['password'];
    if (!password_verify($password, $passwordHash)) {
        error('wrong_credentials', 400);
    }
    $token = bin2hex(openssl_random_pseudo_bytes(26));
    $result = mysqli_query($conn, "INSERT INTO session(user_id, token) VALUES('" . $userId . "', '" . $token . "')");
    if (!$result) {
        error();
    }
    $tokenResponse = array(
        "token" => $token
    );
    echo json_encode(utf8ize($tokenResponse));
} else {
    error('wrong_credentials', 400);
}

http_response_code(200);

mysqli_close($conn);
