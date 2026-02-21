// Prevent access if vendor not logged in
if (localStorage.getItem("vendorLoggedIn") !== "true") {
  window.location.href = "vendor-login.html";
}
