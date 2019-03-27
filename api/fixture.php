<?php
include_once 'global.php';

$fixture = '';

$where = "";

if (isset($_GET["uuid"])) {
    $where .= ' AND uuid = "' . mysqli_real_escape_string($conn, $_GET["uuid"]) . '"';
}

$result = mysqli_query($conn, "SELECT object FROM fixture WHERE 1 = 1" . $where);

if(!$result) {
    die("Query failed: " . mysqli_error($conn));
}

while ($row = mysqli_fetch_assoc($result)) {
    $fixture = $row["object"];
}

http_response_code(200);

echo $fixture;
