import { API_BASE } from "./config.js";

const form = document.getElementById("vendorRegisterForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ownerName = document.getElementById("ownerName").value.trim();
  const vendorName = document.getElementById("vendorName").value.trim();
  const location = document.getElementById("location").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const res = await fetch(`${API_BASE}/api/vendor/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ownerName, vendorName, location, contact, email, password })
  });

  if (!res.ok) {
    alert("Registration failed.");
    return;
  }

  alert("Vendor registered successfully!");
  window.location.href = "vendor-login.html";
});
