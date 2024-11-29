// Cargar categorías y mostrarlas en la lista
function loadCategories() {
    const categoryList = document.querySelector(".categories ul");

    // Limpiar categorías actuales
    categoryList.innerHTML = "<li>Cargando categorías...</li>";

    // Hacer la solicitud para obtener categorías con productos
    fetch("http://localhost:3000/api/categorias/con-productos")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener las categorías con productos");
            }
            return response.json();
        })
        .then(categories => {
            if (categories.length === 0) {
                categoryList.innerHTML = "<li>No hay categorías disponibles.</li>";
                return;
            }

            // Mostrar las categorías
            categoryList.innerHTML = ""; // Limpiar el mensaje de "Cargando categorías..."
            categories.forEach(category => {
                const categoryItem = document.createElement("li");
                categoryItem.textContent = category.nombre;
                categoryItem.dataset.id = category.id; // Asignar el ID de la categoría para identificarla

                // Agregar un evento de clic para cargar productos de la categoría seleccionada
                categoryItem.addEventListener("click", () => {
                    loadProducts(category);
                });

                categoryList.appendChild(categoryItem);
            });
        })
        .catch(error => {
            console.error("Error al cargar las categorías:", error);
            categoryList.innerHTML = "<li>Error al cargar las categorías.</li>";
        });
}

// Cargar productos de una categoría seleccionada
function loadProducts(category) {
    const productGrid = document.querySelector(".products .product-grid");
    const productsTitle = document.querySelector(".products h3");

    // Limpiar productos actuales
    productGrid.innerHTML = "<p>Cargando productos...</p>";

    // Cambiar el título a la categoría seleccionada
    productsTitle.textContent = `Productos de ${category.nombre}`;

    // Mostrar los productos de la categoría seleccionada
    if (category.productos.length === 0) {
        productGrid.innerHTML = "<p>No hay productos disponibles en esta categoría.</p>";
        return;
    }

    // Mostrar productos
    productGrid.innerHTML = ""; // Limpiar el mensaje de "Cargando productos..."
    category.productos.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const productImage = product.imagen_url || 'img/default-placeholder.png'; // Usar una imagen por defecto si no hay imagen

        productCard.innerHTML = `
            <div>
                <img src="${productImage}" alt="${product.nombre}" class="product-image">
                <h4>${product.nombre}</h4>
                <p>${product.descripcion}</p>
                <p class="price">Precio: ${product.precio} Bs</p>
                <p class="stock">Stock: ${product.stock}</p>
            </div>
            <button onclick="addToCart({
                id: ${product.id}, 
                nombre: '${product.nombre}', 
                descripcion: '${product.descripcion}', 
                precio: ${product.precio}, 
                imagen_url: '${productImage}',
                cantidad: 1
            })">Agregar al carrito</button>
        `;
        productGrid.appendChild(productCard);
    });
}

// Función para agregar productos al carrito
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        existingProduct.cantidad += 1; // Incrementar cantidad si ya está en el carrito
    } else {
        cart.push(product); // Agregar nuevo producto
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Producto agregado al carrito");
}

// Inicializar carga de categorías al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadCategories(); // Cargar categorías con productos al cargar la página
});
