import { API_BASE } from "./config.js";

const vendorId = localStorage.getItem("vendorId");

// Elements
const table = document.getElementById("adminVehicleTable");
const addBtn = document.getElementById("addVehicleBtn");
const modal = document.getElementById("vehicleModal");
const modalTitle = document.getElementById("modalTitle");

// Form fields
const vName = document.getElementById("vName");
const vType = document.getElementById("vType");
const vHour = document.getElementById("vHour");
const vDay = document.getElementById("vDay");
const vStatus = document.getElementById("vStatus");

const saveBtn = document.getElementById("saveVehicleBtn");
const closeBtn = document.getElementById("closeModalBtn");

// State
let editMode = false;
let editVehicleId = null;

// -------------------------
// Load Vehicles
// -------------------------
async function loadVehicles() {
  const res = await fetch(`${API_BASE}/api/vendor/vehicle/all/${vendorId}`);
  const list = await res.json();

  table.innerHTML = "";

  list.forEach(v => {
    table.innerHTML += `
      <tr>
        <td class="py-2 pr-3">${v.name}</td>
        <td class="py-2 pr-3 capitalize">${v.type}</td>
        <td class="py-2 pr-3">₹${v.pricePerHour}</td>
        <td class="py-2 pr-3">₹${v.pricePerDay}</td>
        <td class="py-2 pr-3">${v.status ? v.status : "Available"}</td>
        <td class="py-2 space-x-1">
          <button onclick="editVehicle(${v.id})" class="px-2 py-1 rounded-lg border border-slate-300 text-[10px]">Edit</button>
          <button onclick="deleteVehicle(${v.id})" class="px-2 py-1 rounded-lg border border-red-300 text-red-600 text-[10px]">Delete</button>
        </td>
      </tr>`;
  });
}

window.editVehicle = function(id) {
  editMode = true;
  editVehicleId = id;

  fetch(`${API_BASE}/api/vehicle/get/${id}`)
    .then(res => res.json())
    .then(v => {
      modalTitle.textContent = "Edit Vehicle";
      vName.value = v.name;
      vType.value = v.type;
      vHour.value = v.pricePerHour;
      vDay.value = v.pricePerDay;
      vStatus.value = v.status || "Available";

      modal.classList.remove("hidden");
    });
};

window.deleteVehicle = async function(id) {
  const ok = confirm("Are you sure you want to delete this vehicle?");
  if (!ok) return;

  await fetch(`${API_BASE}/api/vendor/vehicle/delete/${id}`, {
    method: "DELETE"
  });

  alert("Vehicle deleted!");
  loadVehicles();
};

// -------------------------
// Add Vehicle
// -------------------------
addBtn.addEventListener("click", () => {
  editMode = false;
  editVehicleId = null;
  modalTitle.textContent = "Add New Vehicle";

  vName.value = "";
  vType.value = "scooty";
  vHour.value = "";
  vDay.value = "";
  vStatus.value = "Available";

  modal.classList.remove("hidden");
});

// -------------------------
// Save Vehicle
// -------------------------
saveBtn.addEventListener("click", async () => {
  const payload = {
    name: vName.value.trim(),
    type: vType.value,
    pricePerHour: parseInt(vHour.value),
    pricePerDay: parseInt(vDay.value),
    status: vStatus.value,
    vendorId: parseInt(vendorId)
  };

  if (editMode) {
    // Update
    await fetch(`${API_BASE}/api/vendor/vehicle/update/${editVehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Vehicle updated!");
  } else {
    // Add
    await fetch(`${API_BASE}/api/vendor/vehicle/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    alert("Vehicle added!");
  }

  modal.classList.add("hidden");
  loadVehicles();
});

// -------------------------
// Close Modal
// -------------------------
closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
});

// -------------------------
loadVehicles();
