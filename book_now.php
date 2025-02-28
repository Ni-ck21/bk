<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host   = 'localhost';
$dbname = 'taxi_db';
$user   = 'cabo';
$pass   = '1234';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Ensure required POST fields are provided
$required_fields = ['customer_number', 'driver_name', 'driver_number', 'vehicle_number', 'vehicle_type'];
foreach ($required_fields as $field) {
    if (!isset($_POST[$field]) || empty(trim($_POST[$field]))) {
        echo "Error: " . $field . " is required.";
        exit;
    }
}

// Retrieve POST values safely
$customer_number = $conn->real_escape_string($_POST['customer_number']);
$driver_id       = isset($_POST['driver_id']) ? $conn->real_escape_string($_POST['driver_id']) : '';
$driver_name     = $conn->real_escape_string($_POST['driver_name']);
$driver_number   = $conn->real_escape_string($_POST['driver_number']);
$vehicle_number  = $conn->real_escape_string($_POST['vehicle_number']);
$vehicle_type    = $conn->real_escape_string($_POST['vehicle_type']);

// 1. If a driver_id is provided, check if that driver exists; if yes, update its details.
if (!empty($driver_id)) {
    $sqlDriver = "SELECT * FROM driver_details WHERE driver_id='$driver_id'";
    $resultDriver = $conn->query($sqlDriver);
    if ($resultDriver && $resultDriver->num_rows > 0) {
        $updateDriverInfo = "UPDATE driver_details 
                             SET driver_name='$driver_name', vehicle_number='$vehicle_number', vehicle_type='$vehicle_type'
                             WHERE driver_id='$driver_id'";
        if (!$conn->query($updateDriverInfo)) {
            echo "Error updating driver by driver_id: " . $conn->error;
            exit;
        }
    } else {
        // Provided driver_id not found – clear it to force new insert.
        $driver_id = '';
    }
}

// 2. If driver_id is empty, check if a driver with the same driver_number exists.
if (empty($driver_id)) {
    $sqlDriverNumber = "SELECT * FROM driver_details WHERE driver_number='$driver_number'";
    $resultDriverNumber = $conn->query($sqlDriverNumber);
    if ($resultDriverNumber && $resultDriverNumber->num_rows > 0) {
        $driver = $resultDriverNumber->fetch_assoc();
        $driver_id = $driver['driver_id'];
        $updateDriverInfo = "UPDATE driver_details 
                             SET driver_name='$driver_name', vehicle_number='$vehicle_number', vehicle_type='$vehicle_type'
                             WHERE driver_id='$driver_id'";
        if (!$conn->query($updateDriverInfo)) {
            echo "Error updating driver by driver_number: " . $conn->error;
            exit;
        }
    } else {
        // 3. Generate a new driver_id manually.
        $sqlMax = "SELECT IFNULL(MAX(CAST(SUBSTRING(driver_id, 2) AS UNSIGNED)), 0) AS maxid FROM driver_details";
        $resultMax = $conn->query($sqlMax);
        $row = $resultMax->fetch_assoc();
        $maxid = intval($row['maxid']);
        $new_driver_id = 'D' . str_pad($maxid + 1, 3, '0', STR_PAD_LEFT);
        
        $insertDriver = "INSERT INTO driver_details 
                         (driver_id, driver_name, driver_number, vehicle_number, vehicle_type, total_earnings, total_rides)
                         VALUES ('$new_driver_id', '$driver_name', '$driver_number', '$vehicle_number', '$vehicle_type', 0, 0)";
        if (!$conn->query($insertDriver)) {
            echo "Error creating new driver: " . $conn->error;
            exit;
        }
        $driver_id = $new_driver_id;
    }
}

// 4. Retrieve the most recent ride for the customer that has no driver assigned.
$sqlRide = "SELECT * FROM ride_details 
            WHERE customer_number='$customer_number' 
              AND (driver_id IS NULL OR driver_id = '')
            ORDER BY created_at DESC LIMIT 1";
$resultRide = $conn->query($sqlRide);
if ($resultRide && $resultRide->num_rows > 0) {
    $ride = $resultRide->fetch_assoc();
    $ride_id = $ride['ride_id'];
    $ride_cost = floatval($ride['estimated_price']);
    
    // 5. Update the ride record with the driver details.
    $updateRide = "UPDATE ride_details 
                   SET driver_id='$driver_id', driver_name='$driver_name', driver_number='$driver_number'
                   WHERE ride_id='$ride_id'";
    if (!$conn->query($updateRide)) {
        echo "Error updating ride: " . $conn->error;
        exit;
    }
    
    // 6. Update driver's totals (earnings and ride count).
    $sqlDriverTotals = "SELECT total_earnings, total_rides FROM driver_details WHERE driver_id='$driver_id'";
    $driverTotalsResult = $conn->query($sqlDriverTotals);
    if (!$driverTotalsResult) {
        echo "Error retrieving driver totals: " . $conn->error;
        exit;
    }
    $driverTotals = $driverTotalsResult->fetch_assoc();
    $total_earnings = floatval($driverTotals['total_earnings']);
    $total_rides = intval($driverTotals['total_rides']);
    $new_total_earnings = $total_earnings + $ride_cost;
    $new_total_rides = $total_rides + 1;
    
    $updateDriverTotals = "UPDATE driver_details 
                     SET total_earnings='$new_total_earnings', total_rides='$new_total_rides' 
                     WHERE driver_id='$driver_id'";
    if (!$conn->query($updateDriverTotals)) {
        echo "Error updating driver totals: " . $conn->error;
        exit;
    }
    
    echo "Booking successful! Driver assigned to the ride.";
} else {
    echo "No ride found for assignment.";
}

$conn->close();
?>
