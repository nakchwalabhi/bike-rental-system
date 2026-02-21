import { API_BASE } from "./config.js";
import { vehicles } from "./vehicles.js";

let extra = JSON.parse(localStorage.getItem("extraVehicles")) || [];

const allVehicles = [...vehicles, ...extra];


const vehicleGrid = document.getElementById("vehicleGrid");

// Fetch all vehicles from backend
async function loadVehicles() {
    try {
        const res = await fetch(`${API_BASE}/api/vehicle/all`);
        const vehicles = await res.json();

        vehicleGrid.innerHTML = "";
        vehicles.forEach(v => {
            vehicleGrid.innerHTML += `
                <article class="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
                    <h3 class="font-semibold">${v.name}</h3>
                    <p class="text-xs text-slate-500">${v.type.toUpperCase()}</p>
                    <p class="text-xs">Price: ₹${v.pricePerHour}/hr</p>
                    <p class="text-xs">Vendor: ${v.vendor.vendorName}</p>

                    <a href="booking.html?id=${v.id}">
                        <button class="mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">
                            Rent Now
                        </button>
                    </a>
                </article>
            `;
        });
    } catch (e) {
        console.log("Error loading vehicles:", e);
        vehicleGrid.innerHTML = `<p class="text-red-600 text-xs">Failed to load vehicles</p>`;
    }
}

loadVehicles();
