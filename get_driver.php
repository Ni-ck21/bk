<?php
// get_driver.php
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'taxi_db';
$user = 'cabo';
$pass = '1234';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Connection failed']);
    exit;
}

$driver_number = $conn->real_escape_string($_GET['driver_number']);
$sql = "SELECT * FROM driver_details WHERE driver_number='$driver_number'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $driver = $result->fetch_assoc();
    echo json_encode(['status' => 'success', 'driver' => $driver]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Driver not found.']);
}
$conn->close();
?>
