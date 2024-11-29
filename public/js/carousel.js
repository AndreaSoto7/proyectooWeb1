document.addEventListener("DOMContentLoaded", async () => {
    const carouselContainer = document.querySelector(".carousel-items");

    if (!carouselContainer) {
        console.error("No se encontró el contenedor del carrusel (.carousel-items).");
        return;
    }

    try {
        // Obtener productos desde la API
        const response = await fetch("http://localhost:3000/api/productos");
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const products = await response.json();

        // Verificar que se recibieron productos
        if (!Array.isArray(products) || products.length === 0) {
            console.error("No se encontraron productos para el carrusel.");
            carouselContainer.innerHTML = "<p>No hay productos disponibles.</p>";
            return;
        }

        // Renderizar los productos en el carrusel
        carouselContainer.innerHTML = products.slice(0, 5).map(product => `
            <div class="carousel-item" data-id="${product.id}">
                <img src="${product.imagen_url || 'img/placeholder.png'}" alt="${product.nombre}">
                <p><strong>${product.nombre}</strong></p>
                <p>${product.descripcion}</p>
                <button class="add-to-cart" data-product='${JSON.stringify(product)}'>Agregar al carrito</button>
                <button class="view-detail" data-product='${JSON.stringify(product)}'>Ver Detalle</button>
            </div>
        `).join('');

        // Manejar eventos de clic en los botones
        carouselContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("add-to-cart")) {
                const product = JSON.parse(event.target.dataset.product);
                addToCart(product);
            }

            if (event.target.classList.contains("view-detail")) {
                const product = JSON.parse(event.target.dataset.product);
                viewProductDetail(product);
            }
        });
    } catch (error) {
        console.error("Error al cargar el carrusel:", error);
        carouselContainer.innerHTML = "<p>No se pudo cargar el carrusel.</p>";
    }
});

// Función para manejar el botón "Ver Detalle"
function viewProductDetail(product) {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.location.href = "vistaProducto.html";
}

// Función para manejar el botón "Agregar al carrito"
async function addToCart(product) {
    const session_id = localStorage.getItem("session_id") || crypto.randomUUID();
    localStorage.setItem("session_id", session_id);

    try {
        const response = await fetch(`http://localhost:3000/api/carrito`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id,
                id_producto: product.id,
                cantidad: 1,
            }),
        });

        if (!response.ok) {
            throw new Error("Error al agregar producto al carrito");
        }

        alert("Producto agregado al carrito");
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
    }
}
