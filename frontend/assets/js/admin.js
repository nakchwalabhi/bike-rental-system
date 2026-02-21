import { API_BASE } from "./config.js";


// ELEMENTS
const addBtn = document.getElementById("addVehicleBtn");
const popup = document.getElementById("addVehiclePopup");
const closePopup = document.getElementById("closePopup");
const addVehicleForm = document.getElementById("addVehicleForm");

// OPEN POPUP
addBtn.addEventListener("click", () => {
  popup.classList.remove("hidden");
  popup.classList.add("flex");
});

// CLOSE POPUP
closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// SUBMIT ADD VEHICLE
addVehicleForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newVehicle = {
    id: "custom-" + Math.floor(Math.random() * 99999),
    name: document.getElementById("vName").value,
    type: document.getElementById("vType").value.toLowerCase(),
    vendor: document.getElementById("vVendor").value,
    location: document.getElementById("vLocation").value,
    pricePerHour: parseInt(document.getElementById("vHour").value),
    pricePerDay: parseInt(document.getElementById("vDay").value)
  };

  // Load existing
  let saved = JSON.parse(localStorage.getItem("extraVehicles")) || [];

  // Add new one
  saved.push(newVehicle);

  // Save back
  localStorage.setItem("extraVehicles", JSON.stringify(saved));

  alert("Vehicle Added Successfully!");

  popup.classList.add("hidden");
  addVehicleForm.reset();

  // Reload dashboard table
  loadAdminVehicles();
});


// LOAD VEHICLES TABLE
async function loadAdminVehicles() {
  const table = document.getElementById("adminVehicleTable");
  table.innerHTML = "";

  // Load backend vehicles
  let list = [];
  try {
    const res = await fetch(`${API_BASE}/api/vehicle/all`);
    list = await res.json();
  } catch (e) {
    console.log("Backend load failed");
  }

  // Load added vehicles from localStorage
  const local = JSON.parse(localStorage.getItem("extraVehicles")) || [];

  // Merge both
  const finalList = [...list, ...local];

  finalList.forEach(v => {
    table.innerHTML += `
      <tr>
        <td class="py-2 pr-3">${v.name}</td>
        <td class="py-2 pr-3">${v.type}</td>
        <td class="py-2 pr-3">₹${v.pricePerHour}</td>
        <td class="py-2 pr-3">₹${v.pricePerDay}</td>
        <td class="py-2 pr-3">${v.vendor}</td>
      </tr>
    `;
  });
}


loadAdminVehicles();
