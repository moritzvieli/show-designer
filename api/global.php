<?php
include_once 'database.php';

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Credentials: true');
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        // may also be using PUT, PATCH, HEAD etc
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header('Access-Control-Allow-Headers: Content-Type, Accept, Authorization');

    exit(0);
}

function utf8ize($d)
{
    if (is_array($d)) {
        foreach ($d as $k => $v) {
            $d[$k] = utf8ize($v);
        }
    } else if (is_string($d)) {
        return utf8_encode($d);
    }
    return $d;
}

function error($errorMessage = 'internal', $status = 500)
{
    $error = array(
        'error' => $errorMessage
    );
    echo json_encode(utf8ize($error));
    http_response_code($status);
    exit();
}

function errorUnauthorized()
{
    error('unauthorized', 401);
}

// Get the user ID from a provided token
function getUserId($conn)
{
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        return null;
    }
    $token = mysqli_real_escape_string($conn, $_SERVER['HTTP_AUTHORIZATION']);
    $result = mysqli_query($conn, "SELECT user_id FROM session WHERE token = '" . $token . "'");
    if ($result->num_rows > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row['user_id'];
    }
    return null;
}

// Checks, whether a user has a role
function userHasRole($conn, $userId, $roleAlias)
{
    $result = mysqli_query($conn, "SELECT 1 FROM user_role LEFT JOIN role ON role.id = user_role.role_id WHERE user_role.user_id = " . $userId . " AND role.alias = '" . $roleAlias . "'");
    if ($result->num_rows > 0) {
        $row = mysqli_fetch_assoc($result);
        return $row['user_id'];
    }
    return null;
}
