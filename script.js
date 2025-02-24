document.addEventListener('DOMContentLoaded', function() {
  // Toggle between Customer Input and Driver Assigning modes
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'customer') {
        document.getElementById('customerFormSection').style.display = 'block';
        document.getElementById('driverFormSection').style.display = 'none';
      } else {
        document.getElementById('customerFormSection').style.display = 'none';
        document.getElementById('driverFormSection').style.display = 'block';
      }
    });
  });

  // Toggle drop off section based on journey type selection
  document.querySelectorAll('input[name="journey_type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === '2 way') {
        document.getElementById('returnSection').style.display = 'block';
      } else {
        document.getElementById('returnSection').style.display = 'none';
      }
    });
  });

  // Customer Input: Save ride and update customer details
  document.getElementById('rideForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let formData = new FormData(this);
    fetch('save_ride.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      document.getElementById('response').innerHTML = data;
      document.getElementById('rideForm').reset();
      document.getElementById('returnSection').style.display = 'none';
    })
    .catch(error => {
      document.getElementById('response').innerHTML = 'Error: ' + error;
    });
  });

  // Retrieve Customer: when the Retrieve Customer button is clicked
  document.getElementById('retrieveCustomerBtn').addEventListener('click', function() {
    let customerNumber = document.getElementById('search_customer_number').value.trim();
    if (customerNumber !== "") {
      fetch('get_customer.php?customer_number=' + customerNumber)
        .then(response => response.json())
        .then(data => {
          let customerDetailsDiv = document.getElementById('customerDetails');
          let rideDetailsDiv = document.getElementById('rideDetails');
          if (data.status === 'success') {
            let customer = data.customer;
            let ride = data.ride; // latest ride details
            customerDetailsDiv.innerHTML = `<p><strong>Name:</strong> ${customer.customer_name}</p>
                                            <p><strong>Last Pickup:</strong> ${customer.last_pickup_location}</p>
                                            <p><strong>Last Drop:</strong> ${customer.last_drop_location}</p>
                                            <p><strong>Rides:</strong> ${customer.number_of_rides}</p>
                                            <p><strong>Total Spendings:</strong> ₹${customer.total_spendings}</p>`;
            if (ride) {
              rideDetailsDiv.innerHTML = `<p><strong>Estimated KM:</strong> ${ride.estimated_km}</p>
                                          <p><strong>Estimated Fare:</strong> ₹${ride.estimated_price}</p>`;
            } else {
              rideDetailsDiv.innerHTML = `<p>No ride details found.</p>`;
            }
            // Ensure driver details section is visible
            document.getElementById('driverDetailsSection').style.display = 'block';
          } else {
            customerDetailsDiv.innerHTML = `<p>${data.message}</p>`;
            rideDetailsDiv.innerHTML = '';
            document.getElementById('driverDetailsSection').style.display = 'none';
          }
        })
        .catch(error => {
           document.getElementById('customerDetails').innerHTML = 'Error: ' + error;
        });
    }
  });

  // Retrieve Driver: when the Retrieve Driver button is clicked
  document.getElementById('retrieveDriverBtn').addEventListener('click', function() {
    let driverNumber = document.getElementById('driver_number').value.trim();
    if (driverNumber !== "") {
      fetch('get_driver.php?driver_number=' + driverNumber)
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            let driver = data.driver;
            document.getElementById('driver_name').value = driver.driver_name;
            document.getElementById('vehicle_number').value = driver.vehicle_number;
            document.getElementById('vehicle_type').value = driver.vehicle_type;
          } else {
            // If not found, clear the fields for new input
            document.getElementById('driver_name').value = "";
            document.getElementById('vehicle_number').value = "";
            document.getElementById('vehicle_type').value = "";
          }
          // Book Now button remains always visible
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });

  // Book Now: update ride and driver records when Book Now is clicked
  document.getElementById('bookNowBtn').addEventListener('click', function() {
    let customerNumber = document.getElementById('search_customer_number').value.trim();
    let driverNumber   = document.getElementById('driver_number').value.trim();
    let driverName     = document.getElementById('driver_name').value.trim();
    let vehicleNumber  = document.getElementById('vehicle_number').value.trim();
    let vehicleType    = document.getElementById('vehicle_type').value.trim();

    let params = new URLSearchParams();
    params.append('customer_number', customerNumber);
    params.append('driver_number', driverNumber);
    params.append('driver_name', driverName);
    params.append('vehicle_number', vehicleNumber);
    params.append('vehicle_type', vehicleType);

    fetch('book_now.php', {
      method: 'POST',
      body: params
    })
    .then(response => response.text())
    .then(data => {
      document.getElementById('driverResponse').innerHTML = data;
      // Since Book Now is always visible, we do not hide it here.
    })
    .catch(error => {
      document.getElementById('driverResponse').innerHTML = 'Error: ' + error;
    });
  });

  // View All Rides: fetch and display only rides with no driver assigned in a table
  document.getElementById('viewRidesBtn').addEventListener('click', function() {
    fetch('get_rides.php')
      .then(response => response.text())
      .then(data => {
        document.getElementById('ridesList').innerHTML = data;
      })
      .catch(error => {
        document.getElementById('ridesList').innerHTML = 'Error: ' + error;
      });
  });
});
