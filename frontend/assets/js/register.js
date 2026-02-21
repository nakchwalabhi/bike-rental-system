import { API_BASE } from "./config.js";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const req = {
        fullName: document.getElementById("fullname").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
    });

    if (res.ok) {
        alert("Account created successfully");
        window.location.href = "login.html";
    } else {
        alert("Failed to register");
    }
});
