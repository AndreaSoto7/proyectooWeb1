document.addEventListener("DOMContentLoaded", () => {
    const registerButton = document.querySelector("#registrarPedidoBtn");
    const form = document.querySelector("form");

    // Cargar resumen del pedido
    loadOrderSummary(registerButton);

    // Habilitar/deshabilitar el botón según el estado del formulario
    form.addEventListener("input", () => {
        const allFieldsFilled = Array.from(form.elements).every(input => input.value.trim() !== "");
        registerButton.disabled = !allFieldsFilled;
    });

    // Manejar el clic en "Registrar Pedido"
    registerButton.addEventListener("click", handleRegisterOrder);
});

// Función para cargar el resumen del pedido
// Código para cargar el resumen del pedido
document.addEventListener("DOMContentLoaded", () => {
    const registerButton = document.querySelector("#registrarPedidoBtn");
    const form = document.querySelector("form");

    // Cargar resumen del pedido
    loadOrderSummary(registerButton);

    // Habilitar/deshabilitar el botón según el estado del formulario
    form.addEventListener("input", () => {
        const allFieldsFilled = Array.from(form.elements).every(input => input.value.trim() !== "");
        registerButton.disabled = !allFieldsFilled;
    });

    // Manejar el clic en "Registrar Pedido"
    registerButton.addEventListener("click", handleRegisterOrder);
});

// Función para cargar el resumen del pedido
async function loadOrderSummary(registerButton) {
    const orderSummary = document.querySelector(".order-summary");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const session_id = localStorage.getItem("session_id");
    let carritoId = null;

    try {
        // Prioriza id_usuario si el usuario está autenticado
        const response = await fetch(
            usuario
                ? `http://localhost:3000/api/carrito/usuario/${usuario.id}`
                : `http://localhost:3000/api/carrito/session/${session_id}`
        );

        if (!response.ok) throw new Error("Error al cargar los datos del carrito.");

        const { carrito } = await response.json();

        if (!carrito || carrito.length === 0) {
            orderSummary.innerHTML = `<p>Tu carrito está vacío. Regresa al catálogo para agregar productos.</p>`;
            return;
        }

        // Obtener el carrito ID (requerido para finalizar la compra)
        carritoId = carrito[0].id_carrito || null;

        // Calcular costos
        const totalCost = carrito.reduce((total, item) => total + parseFloat(item.subtotal || 0), 0);
        const shippingCost = 20.0; // Costo de envío fijo
        const grandTotal = totalCost + shippingCost;

        // Renderizar resumen del pedido
        orderSummary.innerHTML = `
            <h2>Confirmación del Pedido</h2>
            <p>Productos:</p>
            <ul>
                ${carrito.map(p => `<li>${p.nombre} x${p.cantidad} - ${parseFloat(p.subtotal).toFixed(2)} Bs</li>`).join("")}
            </ul>
            <p>Envío: <span>${shippingCost.toFixed(2)} Bs</span></p>
            <hr>
            <p class="total">Total del pedido: <span>${grandTotal.toFixed(2)} Bs</span></p>
        `;

        // Almacenar el carrito ID en el botón
        registerButton.dataset.carritoId = carritoId;

        // Habilitar el botón si los campos están llenos
        const form = document.querySelector("form");
        const allFieldsFilled = Array.from(form.elements).every(input => input.value.trim() !== "");
        registerButton.disabled = !allFieldsFilled;

    } catch (error) {
        console.error("Error al cargar el resumen del pedido:", error);
        orderSummary.innerHTML = `<p>Ocurrió un error al cargar el resumen del pedido.</p>`;
    }
}


// Función para manejar "Registrar Pedido"
async function handleRegisterOrder() {
    const form = document.querySelector("form");
    const formData = new FormData(form);

    // Verificar si el usuario está autenticado
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        alert("Debes iniciar sesión para registrar tu pedido.");
        window.location.href = "iniciarSesion.html";
        return;
    }

    // Obtener el carritoId del botón
    const carritoId = document.querySelector("#registrarPedidoBtn").dataset.carritoId;

    if (!carritoId) {
        alert("Carrito ID no proporcionado.");
        return;
    }

    // Preparar datos del pedido
    const orderData = {
        id_usuario: usuario.id,
        pais: formData.get("pais"),
        direccion_entrega: formData.get("direccion"),
        ciudad: formData.get("ciudad"),
        telefono: formData.get("telefono"),
    };

    try {
        // Enviar datos al backend para finalizar la compra
        const response = await fetch(`http://localhost:3000/api/carrito/finalizar/${carritoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al registrar el pedido.");
        }

        alert("¡Pedido registrado con éxito!");
        console.log("Pedido registrado en el backend:", await response.json());

        // Redirigir a una página de historial de pedidos
        window.location.href = "historialPedidoCliente.html";

    } catch (error) {
        console.error("Error al registrar el pedido:", error);
        alert("Ocurrió un error al registrar el pedido. Por favor, inténtalo de nuevo.");
    }
}




// Función para manejar "Registrar Pedido"
async function handleRegisterOrder() {
    const form = document.querySelector("form");
    const formData = new FormData(form);

    // Verificar si el usuario está autenticado
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        alert("Debes iniciar sesión para registrar tu pedido.");
        window.location.href = "iniciarSesion.html";
        return;
    }

    // Preparar datos del pedido
    const carritoId = document.querySelector("#registrarPedidoBtn").dataset.carritoId;
    const orderData = {
    id_usuario: usuario.id,
    pais: formData.get("pais"),
    direccion_entrega: formData.get("direccion"),
    ciudad: formData.get("ciudad"),
    telefono: formData.get("telefono"),
    };

    try {
        // Enviar datos al backend para finalizar la compra
        const response = await fetch(`http://localhost:3000/api/carrito/finalizar/${carritoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error al registrar el pedido.");
        }

        alert("¡Pedido registrado con éxito!");
        console.log("Pedido registrado en el backend:", await response.json());

        // Redirigir a una página de confirmación
        window.location.href = "historialPedidoCliente.html"; // Cambié la redirección a la página de historial de pedidos

    } catch (error) {
        console.error("Error al registrar el pedido:", error);
        alert("Ocurrió un error al registrar el pedido. Por favor, inténtalo de nuevo.");
    }
}
