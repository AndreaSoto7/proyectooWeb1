document.addEventListener("DOMContentLoaded", () => {
    const selectedProduct = JSON.parse(localStorage.getItem("selectedProduct"));

    if (!selectedProduct) {
        alert("No se pudo cargar el producto.");
        window.location.href = "index.html"; 
        return;
    }

    // Actualizar los detalles del producto en la página
    document.querySelector("h2").textContent = selectedProduct.nombre;
    document.querySelector(".product-info h3").textContent = `Autor: ${selectedProduct.autor || "Autor Desconocido"}`;
    document.querySelector(".product-info p:nth-of-type(1)").textContent = selectedProduct.descripcion || "Descripción no disponible.";
    document.querySelector(".product-info h3:last-of-type").textContent = `Precio: ${selectedProduct.precio} Bs`;
    document.querySelector(".product-info input").setAttribute("max", selectedProduct.stock);
    document.querySelector(".product-info input").value = 1;
    document.querySelector(".product-info p:last-of-type").textContent = `${selectedProduct.stock} disponibles`;
    document.querySelector(".product-image img").src = selectedProduct.imagen_url;

    // Manejar evento de clic en "Añadir al carrito"
    document.querySelector(".add-to-cart").addEventListener("click", () => {
        const cantidad = parseInt(document.querySelector(".product-info input").value, 10);

        if (cantidad > 0 && cantidad <= selectedProduct.stock) {
            addToCart({ ...selectedProduct, cantidad });
            alert(`Producto añadido al carrito con cantidad: ${cantidad}`);
        } else {
            alert("Cantidad no válida. Por favor, selecciona una cantidad dentro del rango disponible.");
        }
    });
});

// Función para agregar un producto al carrito
async function addToCart(product) {
    const session_id = localStorage.getItem("session_id");

    if (!session_id) {
        const newSessionId = crypto.randomUUID();
        localStorage.setItem("session_id", newSessionId);
    }

    try {
        const response = await fetch(`http://localhost:3000/api/carrito`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: localStorage.getItem("session_id"),
                id_producto: product.id,
                cantidad: product.cantidad, 
            }),
        });

        if (!response.ok) throw new Error("Error al agregar producto al carrito");

        alert("Producto agregado al carrito exitosamente.");
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
    }
}

