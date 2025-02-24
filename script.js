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

  // Toggle drop off section if "2 way" is selected
  document.querySelectorAll('input[name="journey_type"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === '2 way') {
        document.getElementById('returnSection').style.display = 'block';
      } else {
        document.getElementById('returnSection').style.display = 'none';
      }
    });
  });

  // Save Ride: Build and display Tamil template immediately then send form data
  document.getElementById('rideForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Build Tamil template using current form values BEFORE sending data
    let pickup       = document.getElementById('pickup_location').value;
    let drop         = document.getElementById('drop_location').value;
    let estimatedKm  = document.getElementById('estimated_km').value;
    let estimatedFare= document.getElementById('estimated_price').value;
    let journeyType  = document.querySelector('input[name="journey_type"]:checked').value;
    let journeyOn    = document.getElementById('journey_on').value;
    let pickupTime   = document.getElementById('pickup_time').value;
    
    let tamilJourneyType = (journeyType === '2 way') ? 'இரு வழி' : 'ஒரு வழி';
    let tripDateTime = journeyOn + ' ' + pickupTime;
    
    let message = `எங்கள் கேபோகேப் மூலம் உங்கள் பயணத்தை எடுத்து செல்லுங்கள்\n\n` +
                  `*பிக்‌அப் இடம்: ${pickup}\n` +
                  `*சேருமிடம் : ${drop}\n` +
                  `*சராசரி கி.மீ: ${estimatedKm}km\n` +
                  `*சராசரி கட்டணம்: ${estimatedFare}\n` +
                  `*ஒரு வழி / இரு வழி: ${tamilJourneyType}\n` +
                  `*பயண தேதி & நேரம்: ${tripDateTime}\n\n` +
                  `நீங்கள் பயணத்தை எடுத்து செல்ல விரும்பினால், இந்த எண்ணிற்கு வாட்ஸ்அப்பில் தனிப்பட்ட செய்தி அனுப்பவும்: 9487514688\n` +
                  `அல்லது பயணம் உறுதிப்படுத்த இந்த எண்ணிற்கு அழைக்கவும் **`;
    
    // Display the Tamil message template in the right column
    document.getElementById('tamilMessage').value = message;
    
    // Now send the form data to save_ride.php
    let formData = new FormData(this);
    fetch('save_ride.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      document.getElementById('response').innerHTML = data;
      // Reset the form after sending, but keep the template visible
      document.getElementById('rideForm').reset();
      document.getElementById('returnSection').style.display = 'none';
    })
    .catch(error => {
      document.getElementById('response').innerHTML = 'Error: ' + error;
    });
  });

  // Copy Tamil template to clipboard
  document.getElementById('copyMessageBtn').addEventListener('click', function() {
    let text = document.getElementById('tamilMessage').value;
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Message copied to clipboard!');
      })
      .catch(err => {
        alert('Failed to copy message: ' + err);
      });
  });

  // Retrieve Customer
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
            let ride = data.ride;
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

  // Retrieve Driver
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
            document.getElementById('driver_name').value = "";
            document.getElementById('vehicle_number').value = "";
            document.getElementById('vehicle_type').value = "";
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }
  });

  // Book Now: assign driver to ride
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
    })
    .catch(error => {
      document.getElementById('driverResponse').innerHTML = 'Error: ' + error;
    });
  });

  // View rides with no assigned driver
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
