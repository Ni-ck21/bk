<?php
// get_customer.php
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

$customer_number = $conn->real_escape_string($_GET['customer_number']);
$sql = "SELECT * FROM customer_details WHERE customer_number='$customer_number'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $customer = $result->fetch_assoc();
    // Get latest ride details
    $sqlRide = "SELECT estimated_price, estimated_km FROM ride_details WHERE customer_number='$customer_number' ORDER BY created_at DESC LIMIT 1";
    $rideResult = $conn->query($sqlRide);
    if ($rideResult && $rideResult->num_rows > 0) {
        $ride = $rideResult->fetch_assoc();
    } else {
        $ride = null;
    }
    echo json_encode(['status' => 'success', 'customer' => $customer, 'ride' => $ride]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Customer not found. Please ensure the customer has booked a ride.']);
}
$conn->close();
?>
