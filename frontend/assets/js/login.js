import { API_BASE } from "./config.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const req = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req)
    });

    const text = await res.text();

   if (text.includes("successful")) {
    localStorage.setItem("loggedIn", "true");
    window.location.href = "index.html";
}

});
