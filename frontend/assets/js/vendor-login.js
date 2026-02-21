import { API_BASE } from "./config.js";

const form = document.getElementById("vendorLoginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch(`${API_BASE}/api/vendor/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert("Login failed. Try again.");
    return;
  }

  const vendor = await res.json();
  if (!vendor || !vendor.id) {
    alert("Invalid login credentials!");
    return;
  }

  // Save vendor details in localStorage
  localStorage.setItem("vendorId", vendor.id);
  localStorage.setItem("vendorName", vendor.vendorName);
  localStorage.setItem("vendorLocation", vendor.location);
  localStorage.setItem("vendorLoggedIn", "true");

  alert("Login successful!");

  // Redirect to admin dashboard
  window.location.href = "admin-dashboard.html";
});
