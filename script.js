// Helper function to capitalize the first letter
function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

// New helper function to convert date from yyyy-mm-dd to dd-mm-yyyy
function convertDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

// New helper function to convert time from 24-hour to 12-hour format with AM/PM
function convertTime(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return hours + ':' + minutes + ' ' + ampm;
}

// Global variables to store retrieved customer and ride data
let customerData = {};
let rideData = {};

document.addEventListener('DOMContentLoaded', function() {

  // Toggle between Customer Input and Driver Assigning modes
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const customerSection = document.getElementById('customerFormSection');
      const driverSection = document.getElementById('driverFormSection');
      if (this.value === 'customer') {
        if (customerSection) customerSection.style.display = 'block';
        if (driverSection) driverSection.style.display = 'none';
      } else {
        if (customerSection) customerSection.style.display = 'none';
        if (driverSection) driverSection.style.display = 'block';
      }
    });
  });

  // Toggle drop off section if "2 way" is selected
  const journeyTypeEls = document.querySelectorAll('input[name="journey_type"]');
  journeyTypeEls.forEach(radio => {
    radio.addEventListener('change', function() {
      const returnSection = document.getElementById('returnSection');
      if (!returnSection) return;
      returnSection.style.display = (this.value === '2 way') ? 'block' : 'none';
    });
  });

  // Customer Input: Save Ride and generate Template 1
  const rideForm = document.getElementById('rideForm');
  if (rideForm) {
    rideForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Build Template 1 from current form values
      const pickup = capitalizeFirst(document.getElementById('pickup_location')?.value);
      const drop = capitalizeFirst(document.getElementById('drop_location')?.value);
      const estimatedKm = document.getElementById('estimated_km')?.value || "";
      const estimatedFare = document.getElementById('estimated_price')?.value || "";
      const journeyTypeEl = document.querySelector('input[name="journey_type"]:checked');
      const journeyType = journeyTypeEl ? journeyTypeEl.value : "1 way";
      // Get the date and time values
      const journeyOn = document.getElementById('journey_on')?.value || "";
      const pickupTime = document.getElementById('pickup_time')?.value || "";
      // Convert date and time to desired formats
      const formattedDate = convertDate(journeyOn);
      const formattedTime = convertTime(pickupTime);
      const tripDateTime = formattedDate + " " + formattedTime;

      const tamilJourneyType = (journeyType === '2 way') ? 'இரு வழி' : 'ஒரு வழி';
      const template1 = `எங்கள் கேபோகேப் மூலம் உங்கள் பயணத்தை எடுத்து செல்லுங்கள்\n\n` +
                        `*பிக்‌அப் இடம்: ${pickup}\n` +
                        `*சேருமிடம் : ${drop}\n` +
                        `*சராசரி கி.மீ: ${estimatedKm}km\n` +
                        `*சராசரி கட்டணம்: ${estimatedFare}rs\n` +
                        `*ஒரு வழி / இரு வழி: ${tamilJourneyType}\n` +
                        `*பயண தேதி & நேரம்: ${tripDateTime}\n\n` +
                        `நீங்கள் பயணத்தை எடுக்க விரும்பினால், இந்த எண்ணிற்கு வாட்ஸ்அப்பில் தனிப்பட்ட செய்தி அனுப்பவும்: 9487514688\n` +
                        `அல்லது பயணம் உறுதிப்படுத்த இந்த எண்ணிற்கு அழைக்கவும் **`;

      const template1El = document.getElementById('template1');
      if (template1El) template1El.value = template1;

      // Send form data to save_ride.php
      let formData = new FormData(this);
      fetch('save_ride.php', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(data => {
        const responseEl = document.getElementById('response');
        if (responseEl) responseEl.innerHTML = data;
        rideForm.reset();
        const returnSection = document.getElementById('returnSection');
        if (returnSection) returnSection.style.display = 'none';
      })
      .catch(error => {
        const responseEl = document.getElementById('response');
        if (responseEl) responseEl.innerHTML = 'Error: ' + error;
      });
    });
  }

  // Retrieve Customer: store data globally
  const retrieveCustomerBtn = document.getElementById('retrieveCustomerBtn');
  if (retrieveCustomerBtn) {
    retrieveCustomerBtn.addEventListener('click', function() {
      const customerNumber = document.getElementById('search_customer_number')?.value.trim() || "";
      if (customerNumber !== "") {
        fetch('get_customer.php?customer_number=' + customerNumber)
          .then(response => response.json())
          .then(data => {
            const customerDetailsDiv = document.getElementById('customerDetails');
            const rideDetailsDiv = document.getElementById('rideDetails');
            if (data.status === 'success') {
              customerData = data.customer;
              rideData = data.ride || {};
              if (customerDetailsDiv) {
                customerDetailsDiv.innerHTML = `
                  <p><strong>Name:</strong> ${customerData.customer_name}</p>
                  <p><strong>Last Pickup:</strong> ${customerData.last_pickup_location}</p>
                  <p><strong>Last Drop:</strong> ${customerData.last_drop_location}</p>
                  <p><strong>Rides:</strong> ${customerData.number_of_rides}</p>
                  <p><strong>Total Spendings:</strong> ₹${customerData.total_spendings}</p>
                `;
              }
              if (rideDetailsDiv) {
                if (rideData.pickup_location) {
                  // Convert ride date and time using our helper functions if available
                  const rideDate = convertDate(rideData.journey_on || "");
                  const rideTime = convertTime(rideData.pickup_time || "");
                  const rideTripDateTime = rideDate + " " + rideTime;
                  rideDetailsDiv.innerHTML = `
                    <p><strong>Pickup Location:</strong> ${rideData.pickup_location}</p>
                    <p><strong>Drop Location:</strong> ${rideData.drop_location}</p>
                    <p><strong>Journey On:</strong> ${rideTripDateTime}</p>
                    <p><strong>Estimated KM:</strong> ${rideData.estimated_km}</p>
                    <p><strong>Estimated Fare:</strong> ₹${rideData.estimated_price}</p>
                  `;
                } else {
                  rideDetailsDiv.innerHTML = `<p>No ride details found.</p>`;
                }
              }
              const driverDetailsSection = document.getElementById('driverDetailsSection');
              if (driverDetailsSection) driverDetailsSection.style.display = 'block';
            } else {
              if (customerDetailsDiv) customerDetailsDiv.innerHTML = `<p>${data.message}</p>`;
              if (rideDetailsDiv) rideDetailsDiv.innerHTML = '';
              const driverDetailsSection = document.getElementById('driverDetailsSection');
              if (driverDetailsSection) driverDetailsSection.style.display = 'none';
            }
          })
          .catch(error => {
            const customerDetailsDiv = document.getElementById('customerDetails');
            if (customerDetailsDiv) customerDetailsDiv.innerHTML = 'Error: ' + error;
          });
      }
    });
  }

  // Retrieve Driver
  const retrieveDriverBtn = document.getElementById('retrieveDriverBtn');
  if (retrieveDriverBtn) {
    retrieveDriverBtn.addEventListener('click', function() {
      const driverNumber = document.getElementById('driver_number')?.value.trim() || "";
      if (driverNumber !== "") {
        fetch('get_driver.php?driver_number=' + driverNumber)
          .then(response => response.json())
          .then(data => {
            if (data.status === 'success') {
              const driver = data.driver;
              document.getElementById('driver_name').value = capitalizeFirst(driver.driver_name);
              document.getElementById('vehicle_number').value = capitalizeFirst(driver.vehicle_number);
              document.getElementById('vehicle_type').value = capitalizeFirst(driver.vehicle_type);
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
  }

  // Book Now: assign driver and generate Template 2 & Template 3
  const bookNowBtn = document.getElementById('bookNowBtn');
  if (bookNowBtn) {
    bookNowBtn.addEventListener('click', function() {
      const customerNumber = document.getElementById('search_customer_number')?.value.trim() || "";
      const driverNumber = document.getElementById('driver_number')?.value.trim() || "";
      const driverName = capitalizeFirst(document.getElementById('driver_name')?.value.trim() || "");
      const vehicleNumber = capitalizeFirst(document.getElementById('vehicle_number')?.value.trim() || "");
      const vehicleType = capitalizeFirst(document.getElementById('vehicle_type')?.value.trim() || "");

      // Prepare parameters for book_now.php
      const params = new URLSearchParams();
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
        const driverResponseEl = document.getElementById('driverResponse');
        if (driverResponseEl) driverResponseEl.innerHTML = data;

        // Retrieve ride and customer values for template generation
        const customerName = capitalizeFirst(customerData.customer_name || "");
        const pickup = capitalizeFirst(rideData.pickup_location || "");
        const drop = capitalizeFirst(rideData.drop_location || "");
        // Convert date and time from rideData if available
        const journeyOn = rideData.journey_on || "";
        const pickupTime = rideData.pickup_time || "";
        const formattedDate = convertDate(journeyOn);
        const formattedTime = convertTime(pickupTime);
        const tripDateTime = (formattedDate + " " + formattedTime).trim();
        const estimatedKm = rideData.estimated_km || "";
        const estimatedFare = rideData.estimated_price || "";
        const rideJourneyType = rideData.journey_type || "1 way";
        const tamilJourneyType = (rideJourneyType === "2 way") ? "இரு வழி" : "ஒரு வழி";

        // Template 2: For the driver (using the new text)
        let template2 = `*வணக்கம் ${driverName}*\n\n` +
                        `உங்கள் வரவிருக்கும் Cabocab பயணம் உறுதியாக்கப்பட்டுள்ளது!  வாடிக்கையாளர் விவரங்களை கீழே காணலாம்:\n\n` +
                        `*வாடிக்கையாளர் தகவல்:*\n` +
                        `- வாடிக்கையாளர் பெயர்: ${customerName}\n` +
                        `- வாடிக்கையாளர் தொடர்பு எண்: ${customerData.customer_number || "தகவல் இல்லை"}\n` +
                        `- பிக்கப் இடம்: ${pickup}\n` +
                        `- சேருமிடம்: ${drop}\n` +
                        `- பயண தேதி & நேரம்: ${tripDateTime}\n` +
                        `- சராசரி கி.மீ: ${estimatedKm}km\n` +
                        `- சராசரி கட்டணம்: ${estimatedFare}rs\n` +
                        `- கூடுதல் கி.மீ: 18 PER km\n` +
                        `- கூடுதல் காத்திருப்பு கட்டணம்: ₹100\n` +
                        `- பிக்கப் கட்டணம்: \n` +
                        `- காத்திருப்பு கட்டணம்: \n` +
                        `- ஒரு வழி / இரு வழி: ${tamilJourneyType}\n\n` +
                        `எந்தவொரு உதவிக்காகவும், தயவுசெய்து எங்களை தொடர்பு கொள்ளவும்:\n` +
                        `📞 9487514688`;

        // Template 3: For the customer
        let template3 = `வணக்கம் ${customerName}\n\n` +
                        `உங்கள் *Cabocab* பயணம் உறுதியாக்கப்பட்டுள்ளது!\n\n` +
                        `பயண விவரங்கள்:\n\n` +
                        `- ஓட்டுநர் பெயர்: ${driverName}\n` +
                        `- ஓட்டுநர் தொடர்பு எண்: ${driverNumber}\n` +
                        `- வாகன எண்: ${vehicleNumber}\n` +
                        `- வாகன வகை: ${vehicleType}\n` +
                        `- பிக்கப் இடம்: ${pickup}\n` +
                        `- சேருமிடம்: ${drop}\n` +
                        `- பயண தேதி & நேரம்: ${tripDateTime}\n` +
                        `- சராசரி கட்டணம்: ${estimatedFare}\n` +
                        `- சராசரி கி.மீ: ${estimatedKm}km\n` +
                        `- கூடுதல் கி.மீ: 18 PER KM\n` +
                        `- கூடுதல் காத்திருப்பு கட்டணம்: ₹100/hr\n` +
                        `*ஒரு வழி / இரு வழி: ${tamilJourneyType}\n\n` +
                        `உதவிக்கு தொடர்பு கொள்ள:\n` +
                        `📞 9487514688\n` +
                        `🌐 *வலைத்தளம்:* [cabocab.co.in](http://cabocab.co.in)\n\n` +
                        `*குறிப்பு:* தயவுசெய்து உங்கள் பிக்கப் இடத்தில் 10 நிமிடங்கள் முன்பாக தயாராக இருங்கள்.\n\n` +
                        `✨ *நல்ல பயணம்!* ✨`;

        const template2El = document.getElementById('template2');
        const template3El = document.getElementById('template3');
        if (template2El) template2El.value = template2;
        if (template3El) template3El.value = template3;
      })
      .catch(error => {
        const driverResponseEl = document.getElementById('driverResponse');
        if (driverResponseEl) driverResponseEl.innerHTML = 'Error: ' + error;
      });
    });
  }

  // View rides with no assigned driver
  const viewRidesBtn = document.getElementById('viewRidesBtn');
  if (viewRidesBtn) {
    viewRidesBtn.addEventListener('click', function() {
      fetch('get_rides.php')
        .then(response => response.text())
        .then(data => {
          const ridesList = document.getElementById('ridesList');
          if (ridesList) ridesList.innerHTML = data;
        })
        .catch(error => {
          const ridesList = document.getElementById('ridesList');
          if (ridesList) ridesList.innerHTML = 'Error: ' + error;
        });
    });
  }

});
