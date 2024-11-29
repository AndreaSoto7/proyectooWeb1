document.addEventListener('DOMContentLoaded', () => {
    const addCategoryBtn = document.getElementById('add-category-btn');
    const addCategoryForm = document.getElementById('add-category-form');
    const categoryForm = document.getElementById('category-form');
    const cancelCategoryBtn = document.querySelector('.cancel-category-btn');
    const categoryList = document.getElementById('category-list');
    const categoryFormTitle = document.getElementById('category-form-title');
    const categoryIdField = document.getElementById('category-id');

    const mostrarMensaje = (mensaje, tipo = "success") => {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.textContent = mensaje;
        document.body.appendChild(mensajeDiv);
        setTimeout(() => mensajeDiv.remove(), 3000);
    };

    const cargarCategorias = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/categorias');
            if (!response.ok) throw new Error('Error al cargar categorías');
            const categorias = await response.json();

            categoryList.innerHTML = '';
            categorias.forEach((categoria) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${categoria.nombre}</td>
                    <td>${categoria.descripcion || 'Sin descripción'}</td>
                    <td>
                        <button class="edit-category" data-id="${categoria.id}">✏️</button>
                        <button class="delete-category" data-id="${categoria.id}">🗑️</button>
                    </td>
                `;
                categoryList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            mostrarMensaje('Error al cargar las categorías.', 'error');
        }
    };

    const mostrarFormularioCategoria = (categoria = null) => {
        addCategoryForm.classList.remove('hidden');
        if (categoria) {
            categoryFormTitle.textContent = 'Editar Categoría';
            categoryIdField.value = categoria.id || '';
            document.getElementById('category-name').value = categoria.nombre || '';
            document.getElementById('category-description').value = categoria.descripcion || '';
        } else {
            categoryFormTitle.textContent = 'Agregar Categoría';
            categoryForm.reset();
            categoryIdField.value = '';
        }
    };

    addCategoryBtn.addEventListener('click', () => mostrarFormularioCategoria());

    cancelCategoryBtn.addEventListener('click', () => {
        addCategoryForm.classList.add('hidden');
        categoryForm.reset();
    });

    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const id = categoryIdField.value;
        const name = document.getElementById('category-name').value.trim();
        const description = document.getElementById('category-description').value.trim();
    
        if (!name) {
            mostrarMensaje('El nombre de la categoría es obligatorio.', 'error');
            return;
        }
    
        try {
            const endpoint = id ? `http://localhost:3000/api/categorias/${id}` : 'http://localhost:3000/api/categorias';
            const method = id ? 'PUT' : 'POST';
    
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ nombre: name, descripcion: description }),
            });
    
            if (!response.ok) throw new Error('Error al guardar la categoría');
            mostrarMensaje('Categoría guardada exitosamente.');
            categoryForm.reset();
            addCategoryForm.classList.add('hidden');
            cargarCategorias(); // Recargar categorías
        } catch (error) {
            console.error('Error al guardar la categoría:', error);
            mostrarMensaje('Error al guardar la categoría.', 'error');
        }
    });

    categoryList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-category')) {
            const categoryId = e.target.dataset.id;
            const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta categoría?');
            if (!confirmacion) return;

            try {
                const response = await fetch(`http://localhost:3000/api/categorias/${categoryId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    mostrarMensaje(error.error || 'No se pudo eliminar la categoría.', 'error');
                    return;
                }

                mostrarMensaje('Categoría eliminada exitosamente.');
                cargarCategorias();
            } catch (error) {
                console.error('Error al eliminar la categoría:', error);
                mostrarMensaje('Error al eliminar la categoría.', 'error');
            }
        }

        if (e.target.classList.contains('edit-category')) {
            const categoryId = e.target.dataset.id;
            try {
                const response = await fetch(`http://localhost:3000/api/categorias/${categoryId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
        
                if (!response.ok) throw new Error('Error al obtener datos de la categoría');
        
                const categoria = await response.json();
                mostrarFormularioCategoria(categoria); // Carga los datos en el formulario
            } catch (error) {
                console.error('Error al cargar categoría:', error);
                mostrarMensaje('Error al cargar la categoría.', 'error');
            }
        }
        
    });

    cargarCategorias();
});
