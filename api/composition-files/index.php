<?php
include_once '../global.php';

// Get the file over PHP instead directly, to control the access (TODO) and to set the
// necessary CORS headers, when used from a different domain.
$fileName = $_GET['file'];
$attachment_location = $fileName;
header($_SERVER['SERVER_PROTOCOL'] . ' 200 OK');
header('Cache-Control: public');
header('Content-Type: application/zip');
header('Content-Transfer-Encoding: Binary');
header('Content-Length:' . filesize($attachment_location));
header('Content-Disposition: attachment; filename=' . $fileName);
readfile($attachment_location);
