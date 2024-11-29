document.addEventListener('DOMContentLoaded', () => {
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductForm = document.getElementById('add-product-form'); 
    const productForm = document.getElementById('product-form'); 
    const cancelBtn = document.querySelector('.cancel-btn'); 
    const productList = document.getElementById('product-list');
    const productCategory = document.getElementById('product-category'); 
    const formTitle = document.getElementById('form-title'); 
    const productIdField = document.getElementById('product-id'); 
    const manageCategoriesBtn = document.getElementById('manage-categories-btn');

    // Redirección a la página de gestión de categorías
    manageCategoriesBtn.addEventListener('click', () => {
        window.location.href = 'gestionarCategoria.html';
    });

    document.getElementById('manage-users-btn').addEventListener('click', () => {
        window.location.href = 'gestionarUsuarios.html';
    });
    
    // Función para mostrar mensajes de éxito o error
    const mostrarMensaje = (mensaje, tipo = "success") => {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.textContent = mensaje;
        document.body.appendChild(mensajeDiv);
        setTimeout(() => mensajeDiv.remove(), 3000); 
    };

    // Cargar las categorías disponibles para productos
    const cargarCategorias = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categorias');
            if (!response.ok) throw new Error('Error al cargar categorías');
            const categorias = await response.json();
            productCategory.innerHTML = ''; // Limpiar opciones existentes
            categorias.forEach((categoria) => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = categoria.nombre;
                productCategory.appendChild(option); // Agregar categorías al select
            });
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            mostrarMensaje('Error al cargar las categorías.', 'error');
        }
    };

    // Cargar productos para visualización
    const cargarProductos = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/productos');
            if (!response.ok) throw new Error('Error al cargar productos');
    
            const productos = await response.json();
            productList.innerHTML = ''; // Limpiar lista de productos
            productos.forEach((producto) => {
                const imageUrl = producto.imagen_url || 'img/default-placeholder.png'; 
                
                // Crear una fila para cada producto
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producto.nombre}</td>
                    <td>${producto.precio} Bs</td>
                    <td>${producto.categoria_nombre || 'Sin Categoría'}</td>
                    <td>
                        <img src="${imageUrl}" 
                             alt="${producto.nombre}" 
                             class="product-image"
                             onerror="this.src='img/default-placeholder.png';">
                    </td>
                    <td>
                        <button class="edit" data-id="${producto.id}">✏️</button>
                        <button class="delete" data-id="${producto.id}">🗑️</button>
                    </td>
                `;
                productList.appendChild(row); // Añadir la fila a la lista
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
            mostrarMensaje('Error al cargar los productos.', 'error');
        }
    };

    // Mostrar el formulario de agregar o editar producto
    const mostrarFormulario = (producto = null) => {
        addProductForm.classList.remove('hidden'); 
        if (producto) { 
            formTitle.textContent = 'Editar Producto'; 
            productIdField.value = producto.id || '';
            document.getElementById('product-name').value = producto.nombre || '';
            document.getElementById('product-description').value = producto.descripcion || '';
            document.getElementById('product-price').value = producto.precio || '';
            document.getElementById('product-stock').value = producto.stock || '';
            document.getElementById('product-category').value = producto.id_categoria || '';
        } else { // Si es agregar nuevo, limpiar campos
            formTitle.textContent = 'Agregar Producto';
            productForm.reset();
            productIdField.value = '';
        }
    };

   
    addProductBtn.addEventListener('click', () => mostrarFormulario());
    cancelBtn.addEventListener('click', () => {
        addProductForm.classList.add('hidden');
        productForm.reset();
    });

    // Enviar el formulario para agregar o editar producto
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener datos del formulario
        const id = productIdField.value;
        const name = document.getElementById('product-name').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const stock = parseInt(document.getElementById('product-stock').value, 10);
        const category = document.getElementById('product-category').value;
        const image = document.getElementById('product-image').files[0];

        if (!name || isNaN(price) || isNaN(stock) || !category) {
            mostrarMensaje('Por favor, completa todos los campos correctamente.', 'error');
            return;
        }

        try {
            let imageUrl = null;
            if (image) {
                // Si hay imagen, subirla
                const imageFormData = new FormData();
                imageFormData.append('file', image);
                const imageResponse = await fetch('http://localhost:3000/api/image', {
                    method: 'POST',
                    body: imageFormData,
                });

                if (!imageResponse.ok) throw new Error('Error al subir la imagen');
                const imageData = await imageResponse.json();
                imageUrl = imageData.imageUrl;
            }

            const endpoint = id ? `http://localhost:3000/api/productos/${id}` : 'http://localhost:3000/api/productos';
            const method = id ? 'PUT' : 'POST';

            // Enviar la solicitud para guardar el producto
            const productResponse = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, 
                },
                body: JSON.stringify({
                    nombre: name,
                    descripcion: description,
                    precio: price,
                    id_categoria: category,
                    stock: stock,
                    ...(imageUrl && { imagen_url: imageUrl }), // Si se subió una imagen, agregar la URL
                }),
            });

            if (!productResponse.ok) throw new Error('Error al guardar el producto');
            mostrarMensaje('Producto guardado exitosamente.');
            productForm.reset();
            addProductForm.classList.add('hidden');
            cargarProductos(); // Recargar la lista de productos
        } catch (error) {
            console.error('Error al guardar producto:', error);
            mostrarMensaje('Error al guardar el producto.', 'error');
        }
    });

    // editar y eliminar
    productList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete')) {
            // Confirmar eliminación de producto
            const productId = e.target.dataset.id;
            const confirmacion = confirm('¿Estás seguro de que deseas eliminar este producto?');
            if (!confirmacion) return;

            try {
                const response = await fetch(`http://localhost:3000/api/productos/${productId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    mostrarMensaje(error.error || 'No se pudo eliminar el producto.', 'error');
                    return;
                }

                mostrarMensaje('Producto eliminado exitosamente.');
                cargarProductos(); 
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                mostrarMensaje('Error al eliminar el producto.', 'error');
            }
        }

        if (e.target.classList.contains('edit')) {
            // Cargar los datos del producto para editarlo
            const productId = e.target.dataset.id;
            try {
                const response = await fetch(`http://localhost:3000/api/productos/${productId}`);
                if (!response.ok) throw new Error('Error al obtener datos del producto');
                const producto = await response.json();
                mostrarFormulario(producto); // Llenar el formulario
            } catch (error) {
                console.error('Error al cargar producto:', error);
                mostrarMensaje('Error al cargar producto.', 'error');
            }
        }
    });

    cargarCategorias();
    cargarProductos();
});
