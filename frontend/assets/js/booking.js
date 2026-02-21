import { vehicles } from "./vehicles.js"; // Your updated 25–40 ₹ list


const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// HTML Elements
const vehicleIdInput = document.getElementById("vehicleId");
const vehicleNameInput = document.getElementById("vehicleName");
const pickupInput = document.getElementById("pickup");
const dropoffInput = document.getElementById("dropoff");
const durationText = document.getElementById("durationText");
const priceText = document.getElementById("priceText");

// Find selected vehicle from new array
const selectedVehicle = vehicles.find(v => v.id === id);

if (!selectedVehicle) {
  vehicleNameInput.value = "Unknown Vehicle";
} else {
  vehicleIdInput.value = id;
  vehicleNameInput.value =
    selectedVehicle.name + " • " + selectedVehicle.vendor;
}

function updatePrice() {
  if (!selectedVehicle) return;

  const pickup = new Date(pickupInput.value);
  const drop = new Date(dropoffInput.value);

  if (isNaN(pickup) || isNaN(drop)) {
    priceText.textContent = "₹0";
    durationText.textContent = "";
    return;
  }

  const diffMs = drop - pickup;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours <= 0) {
    durationText.textContent = "Invalid time";
    priceText.textContent = "₹0";
    return;
  }

  durationText.textContent = diffHours.toFixed(1) + " hrs";

  let price = 0;

  if (diffHours < 24) {
    price = diffHours * selectedVehicle.pricePerHour;
  } else {
    const days = Math.ceil(diffHours / 24);
    price = days * selectedVehicle.pricePerDay;
  }

  priceText.textContent = "₹" + Math.round(price);
}

// Attach listeners
pickupInput.addEventListener("change", updatePrice);
dropoffInput.addEventListener("change", updatePrice);
// BOOKING FORM SUBMIT HANDLER
const bookingForm = document.getElementById("bookingForm");

bookingForm.addEventListener("submit", function (e) {
  e.preventDefault(); // stop reload

  // ----- Generate Booking ID -----
  const randomId = "BR-" + Math.floor(10000 + Math.random() * 90000);

  // ----- Show confirmation -----
  alert("Booking Saved Successfully!\nYour Booking ID: " + randomId + "\nPlease save this ID for future reference.");

  // ----- Redirect to home page -----
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
});
