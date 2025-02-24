<?php
// save_ride.php
$host = 'localhost';
$dbname = 'taxi_db';
$user = 'cabo';
$pass = '1234';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$customer_name     = $conn->real_escape_string($_POST['customer_name']);
$customer_number   = $conn->real_escape_string($_POST['customer_number']);
$pickup_location   = $conn->real_escape_string($_POST['pickup_location']);
$drop_location     = $conn->real_escape_string($_POST['drop_location']);
$ride_vehicle_type = $conn->real_escape_string($_POST['ride_vehicle_type']);
$num_passengers    = intval($_POST['num_passengers']);
$journey_on        = $conn->real_escape_string($_POST['journey_on']);
$pickup_time       = $conn->real_escape_string($_POST['pickup_time']);
$journey_type      = $conn->real_escape_string($_POST['journey_type']);
$return_date       = isset($_POST['return_date']) ? $conn->real_escape_string($_POST['return_date']) : null;
$return_time       = isset($_POST['return_time']) ? $conn->real_escape_string($_POST['return_time']) : null;
$estimated_km      = $conn->real_escape_string($_POST['estimated_km']);
$estimated_price   = $conn->real_escape_string($_POST['estimated_price']);

$ride_cost = floatval($estimated_price);

// Check if customer exists
$checkCustomer = "SELECT * FROM customer_details WHERE customer_number='$customer_number'";
$result = $conn->query($checkCustomer);

if ($result->num_rows > 0) {
    $customer = $result->fetch_assoc();
    $new_ride_count = $customer['number_of_rides'] + 1;
    $new_total_spendings = floatval($customer['total_spendings']) + $ride_cost;
    $updateCustomer = "UPDATE customer_details SET 
                        customer_name='$customer_name',
                        last_pickup_location='$pickup_location',
                        last_drop_location='$drop_location',
                        number_of_rides='$new_ride_count',
                        total_spendings='$new_total_spendings'
                       WHERE customer_number='$customer_number'";
    $conn->query($updateCustomer);
} else {
    $insertCustomer = "INSERT INTO customer_details (customer_name, customer_number, last_pickup_location, last_drop_location, number_of_rides, total_spendings)
                       VALUES ('$customer_name', '$customer_number', '$pickup_location', '$drop_location', 1, '$ride_cost')";
    $conn->query($insertCustomer);
}

// Insert ride record (include drop off date/time only if journey_type is "2 way")
$insertRide = "INSERT INTO ride_details 
   (customer_number, pickup_location, drop_location, ride_vehicle_type, num_passengers, journey_on, pickup_time, return_date, return_time, journey_type, estimated_km, estimated_price)
   VALUES 
   ('$customer_number', '$pickup_location', '$drop_location', '$ride_vehicle_type', '$num_passengers', '$journey_on', '$pickup_time', " .
   ($journey_type == '2 way' ? "'$return_date'" : "NULL") . ", " .
   ($journey_type == '2 way' ? "'$return_time'" : "NULL") . ", '$journey_type', '$estimated_km', '$estimated_price')";

if ($conn->query($insertRide) === TRUE) {
    echo "Ride and customer information saved successfully!";
} else {
    echo "Error: " . $conn->error;
}
$conn->close();
?>
