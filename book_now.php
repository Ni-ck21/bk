<?php
// book_now.php
$host = 'localhost';
$dbname = 'taxi_db';
$user = 'cabo';
$pass = '1234';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$customer_number = $conn->real_escape_string($_POST['customer_number']);
$driver_number   = $conn->real_escape_string($_POST['driver_number']);
$driver_name     = $conn->real_escape_string($_POST['driver_name']);
$vehicle_number  = $conn->real_escape_string($_POST['vehicle_number']);
$vehicle_type    = $conn->real_escape_string($_POST['vehicle_type']);

// Check if driver exists; if yes, update details; if not, insert new driver.
$sqlDriver = "SELECT * FROM driver_details WHERE driver_number='$driver_number'";
$resultDriver = $conn->query($sqlDriver);
if ($resultDriver->num_rows > 0) {
    $driver = $resultDriver->fetch_assoc();
    $driver_id = $driver['driver_id'];
    $updateDriverInfo = "UPDATE driver_details SET driver_name='$driver_name', vehicle_number='$vehicle_number', vehicle_type='$vehicle_type' WHERE driver_id='$driver_id'";
    $conn->query($updateDriverInfo);
} else {
    $insertDriver = "INSERT INTO driver_details (driver_name, driver_number, vehicle_number, vehicle_type, total_earnings, total_rides)
                     VALUES ('$driver_name', '$driver_number', '$vehicle_number', '$vehicle_type', 0, 0)";
    if ($conn->query($insertDriver) === TRUE) {
        $driver_id = $conn->insert_id;
    } else {
        echo "Error creating new driver: " . $conn->error;
        exit;
    }
}

// Retrieve the most recent ride for the customer without an assigned driver
$sqlRide = "SELECT * FROM ride_details WHERE customer_number='$customer_number' AND driver_id IS NULL ORDER BY created_at DESC LIMIT 1";
$resultRide = $conn->query($sqlRide);
if ($resultRide->num_rows > 0) {
    $ride = $resultRide->fetch_assoc();
    $ride_id = $ride['ride_id'];
    $ride_cost = floatval($ride['estimated_price']);
    
    // Update the ride record with the driver details
    $updateRide = "UPDATE ride_details SET driver_id='$driver_id', driver_name='$driver_name', driver_number='$driver_number' WHERE ride_id='$ride_id'";
    if ($conn->query($updateRide) !== TRUE) {
        echo "Error updating ride: " . $conn->error;
        exit;
    }
    
    // Update driver's totals (earnings and ride count)
    $sqlDriverTotals = "SELECT total_earnings, total_rides FROM driver_details WHERE driver_id='$driver_id'";
    $driverTotalsResult = $conn->query($sqlDriverTotals);
    $driverTotals = $driverTotalsResult->fetch_assoc();
    $total_earnings = floatval($driverTotals['total_earnings']);
    $total_rides = intval($driverTotals['total_rides']);
    $new_total_earnings = $total_earnings + $ride_cost;
    $new_total_rides = $total_rides + 1;
    
    $updateDriver = "UPDATE driver_details SET total_earnings='$new_total_earnings', total_rides='$new_total_rides' WHERE driver_id='$driver_id'";
    if ($conn->query($updateDriver) === TRUE) {
        echo "Booking successful! Driver assigned to the ride.";
    } else {
        echo "Error updating driver: " . $conn->error;
    }
} else {
    echo "No ride found for assignment.";
}

$conn->close();
?>
