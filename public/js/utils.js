// Función global para agregar productos al carrito
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        // Incrementar cantidad del producto existente
        existingProduct.cantidad += product.cantidad || 1;
    } else {
        // Agregar el producto con cantidad inicial
        cart.push({
            ...product,
            cantidad: product.cantidad || 1, // Si no se especifica, se agrega con cantidad 1
            precio: parseFloat(product.precio) || 0 // Asegurar que precio sea numérico
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Producto agregado al carrito");
}
