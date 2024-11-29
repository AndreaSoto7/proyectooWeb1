document.addEventListener("DOMContentLoaded", async () => {
    const featuredContainer = document.querySelector(".product-grid");

    try {
        const response = await fetch("http://localhost:3000/api/productos/destacados");
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const productosDestacados = await response.json();

        featuredContainer.innerHTML = productosDestacados.map(producto => `
            <div class="product-card" data-id="${producto.id}">
                <img src="${producto.imagen_url}" alt="${producto.nombre}">
                <p><strong>${producto.nombre}</strong></p>
                <p>${producto.descripcion}</p>
                <p>Precio: $${producto.precio}</p>
                <button class="add-to-cart" data-product='${JSON.stringify(producto)}'>Agregar al carrito</button>
                <button class="view-detail" data-product='${JSON.stringify(producto)}'>Ver Detalle</button>
            </div>
        `).join('');

        // Manejar clics en "Agregar al carrito" y "Ver Detalle"
        featuredContainer.addEventListener("click", (event) => {
            if (event.target.classList.contains("add-to-cart")) {
                const product = JSON.parse(event.target.dataset.product);
                addToCart(product); // Llamada a la función global definida en cart.js
            } else if (event.target.classList.contains("view-detail")) {
                const product = JSON.parse(event.target.dataset.product);
                localStorage.setItem("selectedProduct", JSON.stringify(product));
                window.location.href = "vistaProducto.html";
            }
        });
    } catch (error) {
        console.error("Error al cargar productos destacados:", error);
        featuredContainer.innerHTML = "<p>No se pudieron cargar los productos destacados.</p>";
    }
});
