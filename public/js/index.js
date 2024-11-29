const routes = {
    login: "iniciarSesion.html",
    register: "registrar.html",
    cart: "AgregarProductosAlCarrito.html",
};

// Función para verificar si el usuario está logueado
function isLoggedIn() {
    const usuario = localStorage.getItem("usuario");
    return usuario !== null;
}

function hasSessionId(){
    const session = localStorage.getItem("session_id")
    return session !== null;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("session_id");
    alert("Has cerrado sesión.");
    window.location.href = routes.login;
}

// Mostrar/ocultar botón de cerrar sesión según el estado del usuario
function updateAccountOptions() {
    const logoutButton = document.querySelector(".btn-logout");
    if (isLoggedIn()) {
        logoutButton.style.display = "block"; // Mostrar "Cerrar Sesión"
    } else {
        logoutButton.style.display = "none"; // Ocultar "Cerrar Sesión"
    }
}

// Manejar clic en "Inicia Sesión"
document.querySelector(".btn-login")?.addEventListener("click", () => {
    if (isLoggedIn()) {
        alert("Ya estás logueado.");
        window.location.href = routes.cart;
    } else {
        window.location.href = routes.login;
    }
});

// Manejar clic en "Regístrate"
document.querySelector(".btn-register")?.addEventListener("click", () => {
    window.location.href = routes.register;
});

// Manejar clic en el carrito
document.querySelector(".cart")?.addEventListener("click", () => {
    if (isLoggedIn() || hasSessionId()) {
        window.location.href = routes.cart;
    } else {
        alert("Debes iniciar sesión antes de acceder al carrito.");
        window.location.href = routes.login;
    }
});

// Manejar clic en "Cerrar Sesión"
document.querySelector(".btn-logout")?.addEventListener("click", () => {
    logout();
});

// Actualizar las opciones de la cuenta al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    updateAccountOptions();
});
