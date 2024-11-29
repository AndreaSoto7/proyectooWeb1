document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();

    // Maneja clics en el ícono del carrito para redirigir a la página del carrito
    const cartIcon = document.querySelector(".cart");
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            window.location.href = "AgregarProductosAlCarrito.html";
        });
    }

    // Maneja clics en "Finalizar compra"
    const checkoutButton = document.querySelector(".checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", handleCheckout);
    }
});

// Actualizar el contador del carrito
async function updateCartCount() {
    const session_id = localStorage.getItem("session_id");
    if (!session_id) {
        localStorage.setItem("session_id", crypto.randomUUID());
    }

    try {
        const response = await fetch(`http://localhost:3000/api/carrito/session/${session_id}`);
        if (!response.ok) throw new Error("Error al obtener el carrito");

        const result = await response.json();

        // Verificar si result es un array o tiene un campo carrito
        const cart = Array.isArray(result) ? result : result.carrito || [];

        // Asegurarse de que cart sea un array antes de usar reduce
        if (!Array.isArray(cart)) {
            console.error("El carrito no es un array:", cart);
            return;
        }

        const totalItems = cart.reduce((sum, item) => sum + (item.cantidad || 0), 0);

        const cartCountElement = document.querySelector(".cart-count");
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    } catch (error) {
        console.error("Error al actualizar el contador del carrito:", error);
    }
}


// Manejar "Finalizar compra"
function handleCheckout() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"; // Verifica el estado de inicio de sesión

    if (!isLoggedIn) {
        alert("Debes registrarte antes de finalizar tu compra.");
        window.location.href = "/registrar.html"; // Redirige a registrar.html
    } else {
        window.location.href = "/registropedido.html"; // Redirige a registropedido.html
    }
}
