<?php
include_once 'global.php';

// Checks, whether a user has a role for a specific project
function userHasProjectRole($conn, $userId, $projectId, $roleAlias)
{
    $result = mysqli_query($conn, "SELECT 1 FROM project_user_role LEFT JOIN project_role ON project_role.id = project_user_role.role_id WHERE project_user_role.user_id = " . $userId . " AND project_user_role.project_id = " . $projectId . " AND project_role.alias = '" . $roleAlias . "'");
    if ($result->num_rows > 0) {
        return true;
    }
    return false;
}

// Checks, whether a project share token is valid
function projectShareTokenIsValid($conn, $projectId, $shareToken)
{
    $result = mysqli_query($conn, "SELECT 1 FROM project WHERE id = " . $projectId . " AND share_token = '" . $shareToken . "'");
    if ($result->num_rows > 0) {
        return true;
    }
    return false;
}

// Checks, whether a project already exists or not
function projectExists($conn, $projectId)
{
    $result = mysqli_query($conn, "SELECT 1 FROM project WHERE id = " . $projectId);
    if ($result->num_rows > 0) {
        return true;
    }
    return false;
}

$userId = getUserId($conn);
$projectId = '';
if (isset($_GET['id'])) {
    $projectId = mysqli_real_escape_string($conn, $_GET['id']);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get a project
        $authorized = false;
        if (!is_null($userId)) {
            if (
                userHasProjectRole($conn, $userId, $projectId, 'manager')
                || userHasProjectRole($conn, $userId, $projectId, 'read_only')
                || userHasRole($conn, $userId, 'admin')
            ) {

                $authorized = true;
            }
        }
        if (!$authorized && isset($_GET['token'])) {
            // Maybe the project is shared over a link
            $shareToken = mysqli_real_escape_string($conn, $_GET['token']);

            if (projectShareTokenIsValid($conn, $projectId, $shareToken)) {
                $authorized = true;
            }
        }

        if (!$authorized) {
            errorUnauthorized();
        }

        $result = mysqli_query($conn, "SELECT object FROM project WHERE active = 1 AND id = " . $projectId);
        if (!$result) {
            error();
        }
        if ($result->num_rows == 0) {
            error('wrong_id', 400);
        }

        $row = mysqli_fetch_assoc($result);
        echo $row["object"];

        break;
    case 'POST':
        // Save a project
        if (is_null($userId)) {
            errorUnauthorized();
        }

        $newProject = true;
        $authorized = false;

        if (isset($projectId) && projectExists($conn, $projectId)) {
            $newProject = false;

            if (
                userHasProjectRole($conn, $userId, $projectId, 'manager')
                || userHasRole($conn, $userId, 'admin')
            ) {
                $authorized = true;
            }
        } else {
            $authorized = true;
        }

        if (!$authorized) {
            errorUnauthorized();
        }

        $object = mysqli_real_escape_string($conn, file_get_contents('php://input'));
        $name = mysqli_real_escape_string($conn, $_GET['name']);

        if ($newProject) {
            $shareToken = bin2hex(openssl_random_pseudo_bytes(26));
            $result = mysqli_query($conn, "INSERT INTO project(object, name, share_token) VALUES('" . $object . "', '" . $name . "', '" . $shareToken . "')");
            if (!$result) {
                error();
            }
            $projectId = mysqli_insert_id($conn);
            $result = mysqli_query($conn, "INSERT INTO project_user_role(project_id, user_id, role_id) VALUES(" . $projectId . ", " . $userId . ", (SELECT id FROM project_role WHERE alias = 'manager'))");
            if (!$result) {
                error();
            }
        } else {
            $result = mysqli_query($conn, "UPDATE project SET object = '" . $object . "', name = '" . $name . "' WHERE id = " . $projectId);
            if (!$result) {
                error();
            }
        }

        break;
    case 'DELETE':
        // Delete a project
        if (is_null($userId)) {
            errorUnauthorized();
        }

        if (!isset($projectId)) {
            error('missing_parameters', 400);
        }

        if (
            !userHasProjectRole($conn, $userId, $projectId, 'manager')
            && !userHasRole($conn, $userId, 'admin')
        ) {
            errorUnauthorized();
        }

        $result = mysqli_query($conn, "UPDATE project SET active = 0 WHERE id = " . $projectId);
        if (!$result) {
            error();
        }

        break;
}

http_response_code(200);

mysqli_close($conn);
