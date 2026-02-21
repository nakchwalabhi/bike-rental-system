// If not logged in → redirect to login page
if (!localStorage.getItem("loggedIn")) {
    window.location.href = "login.html";
}
    
