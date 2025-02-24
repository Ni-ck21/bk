<?php
// get_rides.php
$host = 'localhost';
$dbname = 'taxi_db';
$user = 'cabo';
$pass = '1234';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT * FROM ride_details WHERE driver_id IS NULL";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table border='1' cellpadding='5' cellspacing='0'>";
    echo "<tr>
            <th>Ride ID</th>
            <th>Customer Number</th>
            <th>Pickup Location</th>
            <th>Drop Location</th>
            <th>Vehicle Type</th>
            <th>Passengers</th>
            <th>Journey On</th>
            <th>Pickup Time</th>
            <th>Drop Off Date</th>
            <th>Drop Off Time</th>
            <th>Journey Type</th>
            <th>Estimated KM</th>
            <th>Estimated Fare</th>
          </tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>
                <td>{$row['ride_id']}</td>
                <td>{$row['customer_number']}</td>
                <td>{$row['pickup_location']}</td>
                <td>{$row['drop_location']}</td>
                <td>{$row['ride_vehicle_type']}</td>
                <td>{$row['num_passengers']}</td>
                <td>{$row['journey_on']}</td>
                <td>{$row['pickup_time']}</td>
                <td>{$row['return_date']}</td>
                <td>{$row['return_time']}</td>
                <td>{$row['journey_type']}</td>
                <td>{$row['estimated_km']}</td>
                <td>{$row['estimated_price']}</td>
             </tr>";
    }
    echo "</table>";
} else {
    echo "No rides found.";
}

$conn->close();
?>
