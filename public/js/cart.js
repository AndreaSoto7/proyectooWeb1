document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".cart-items")) {
        renderCart(); 
    }
    updateCartCount(); 

    const checkoutButton = document.querySelector(".checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", handleCheckout);
    }
});

// Renderizar el carrito
async function renderCart() {
    const cartItemsContainer = document.querySelector(".cart-items");
    const totalPriceElement = document.getElementById("total-price");
  
    if (!cartItemsContainer) {
      console.error("No se encontró el contenedor del carrito (.cart-items).");
      return;
    }
  
    const usuarioString = localStorage.getItem("usuario");
    const session_id = localStorage.getItem("session_id");
    let usuarioId = null;
  
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      usuarioId = usuario.id;
    }
  
    try {
      let cart = [];
  
      if (usuarioId) {
        // Priorizar carrito por usuario
        const response = await fetch(`http://localhost:3000/api/carrito/usuario/${usuarioId}`);
        if (!response.ok) throw new Error("Error al cargar el carrito del usuario");
        const result = await response.json();
        cart = result.carrito || [];
      } else if (session_id && session_id.trim() !== "") {
        // Usar session_id solo si no está vacío
        const response = await fetch(`http://localhost:3000/api/carrito/session/${session_id}`);
        if (!response.ok) throw new Error("Error al cargar el carrito por session_id");
        const result = await response.json();
        cart = result.carrito || [];
      } else {
        // No hay usuario ni session_id
        cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
        if (totalPriceElement) totalPriceElement.textContent = "0.00 Bs";
        return;
      }
  
      // Si el carrito está vacío
      if (!cart || cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
        if (totalPriceElement) totalPriceElement.textContent = "0.00 Bs";
        return;
      }
  
      // Renderizar los productos del carrito
      cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.imagen_url || 'img/placeholder.png'}" alt="${item.nombre}">
          <div class="cart-item-details">
            <p><strong>${item.nombre}</strong></p>
            <p>Cantidad: ${item.cantidad}</p>
            <p>Subtotal: ${parseFloat(item.subtotal || 0).toFixed(2)} Bs</p>
            <button class="remove-one-btn" data-id="${item.id_producto}">-</button>
            <button class="remove-all-btn" data-id="${item.id_producto}">Eliminar</button>
          </div>
        </div>
      `).join("");
  
      // Actualizar el total
      const total = cart.reduce((sum, item) => {
        const subtotal = parseFloat(item.subtotal || 0);
        return sum + (isNaN(subtotal) ? 0 : subtotal);
      }, 0);
  
      if (totalPriceElement) totalPriceElement.textContent = `${total.toFixed(2)} Bs`;
  
      // Agregar eventos eliminar
      document.querySelectorAll(".remove-one-btn").forEach(button => {
        button.addEventListener("click", (event) => {
          const productId = event.target.dataset.id;
          removeOneFromCart(productId);
        });
      });

    } catch (error) {
      console.error("Error al renderizar el carrito:", error);
      cartItemsContainer.innerHTML = "<p>Error al cargar el carrito.</p>";
    }
  }
  
// Agregar al carrito
window.addToCart = async function (product) {
    const session_id = localStorage.getItem("session_id") || crypto.randomUUID();
    localStorage.setItem("session_id", session_id);

    const id_usuario = JSON.parse(localStorage.getItem("usuario"))?.id || null;

    try {
        const response = await fetch(`http://localhost:3000/api/carrito`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id,
                id_producto: product.id,
                cantidad: 1,
                id_usuario,
            }),
        });

        if (!response.ok) {
            throw new Error("Error al agregar producto al carrito");
        }

        alert("Producto agregado al carrito");
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
    }
};

// Eliminar una cantidad del carrito
async function removeOneFromCart(productId) {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const session_id = localStorage.getItem("session_id");

    try {
        const response = await fetch(
            usuario
                ? `http://localhost:3000/api/carrito/usuario/${usuario.id}/${productId}`
                : `http://localhost:3000/api/carrito/session/${session_id}/${productId}`,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            }
        );

        if (!response.ok) throw new Error("Error al disminuir producto del carrito.");

        renderCart();
        updateCartCount();
    } catch (error) {
        console.error("Error al disminuir producto del carrito:", error);
    }
}

// Finalizar la compra
function handleCheckout() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
        alert("Debes iniciar sesión antes de finalizar tu compra.");
        window.location.href = "iniciarSesion.html";
    } else {
        window.location.href = "registroPedido.html";
    }
}

// Obtener el session_id
function getSessionId() {
    let sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("session_id", sessionId);
    }
    return sessionId;
}

// Actualizar el contador del carrito
async function updateCartCount() {
    const session_id = localStorage.getItem("session_id");

    try {
        const response = await fetch(`http://localhost:3000/api/carrito/session/${session_id}`);
        if (!response.ok) {
            throw new Error("Error al obtener el carrito");
        }

        const result = await response.json();

        // Asegurarte de manejar ambos casos: si result es un array o tiene un campo carrito
        const cart = Array.isArray(result) ? result : result.carrito || [];

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
