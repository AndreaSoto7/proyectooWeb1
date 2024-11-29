document.addEventListener('DOMContentLoaded', () => {
    const addUserBtn = document.getElementById('add-user-btn');
    const addUserForm = document.getElementById('add-user-form');
    const userForm = document.getElementById('user-form');
    const cancelUserBtn = document.querySelector('.cancel-user-btn');
    const userList = document.getElementById('user-list');
    const userFormTitle = document.getElementById('user-form-title');
    const userIdField = document.getElementById('user-id');

    const mostrarMensaje = (mensaje, tipo = "success") => {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.textContent = mensaje;
        document.body.appendChild(mensajeDiv);
        setTimeout(() => mensajeDiv.remove(), 3000);
    };

    const cargarUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                mostrarMensaje('No estás autenticado. Por favor, inicia sesión.', 'error');
                return;
            }

            const response = await fetch('http://localhost:3000/api/usuarios', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    mostrarMensaje('No tienes permisos para acceder a esta sección.', 'error');
                } else {
                    mostrarMensaje('Error al cargar los usuarios.', 'error');
                }
                throw new Error('Error al cargar usuarios');
            }

            const usuarios = await response.json();

            userList.innerHTML = '';
            usuarios.forEach((usuario) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.nombre_completo}</td>
                    <td>${usuario.correo}</td>
                    <td>${usuario.tipo_usuario}</td>
                    <td>
                        <button class="edit-user" data-id="${usuario.id}">✏️</button>
                        <button class="delete-user" data-id="${usuario.id}">🗑️</button>
                    </td>
                `;
                userList.appendChild(row);
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    const mostrarFormularioUsuario = (usuario = null) => {
        addUserForm.classList.remove('hidden');
        if (usuario) {
            userFormTitle.textContent = 'Editar Usuario';
            userIdField.value = usuario.id || '';
            document.getElementById('user-fullname').value = usuario.nombre_completo || '';
            document.getElementById('user-email').value = usuario.correo || '';
            document.getElementById('user-password').value = ''; 
            document.getElementById('user-type').value = usuario.tipo_usuario || 'cliente';
            document.getElementById('user-nit').value = usuario.nit || ''; 
            document.getElementById('user-address').value = usuario.direccion || ''; 
        } else {
            userFormTitle.textContent = 'Agregar Usuario';
            userForm.reset();
            userIdField.value = '';
        }
    };

    addUserBtn.addEventListener('click', () => mostrarFormularioUsuario());

    cancelUserBtn.addEventListener('click', () => {
        addUserForm.classList.add('hidden');
        userForm.reset();
    });

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = userIdField.value;
        const name = document.getElementById('user-fullname').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const password = document.getElementById('user-password').value.trim();
        const type = document.getElementById('user-type').value;
        const nit = document.getElementById('user-nit').value.trim();
        const address = document.getElementById('user-address').value.trim();

        if (!name || !email || !type) {
            mostrarMensaje('Por favor, completa todos los campos.', 'error');
            return;
        }

        try {
            const endpoint = id ? `http://localhost:3000/api/usuarios/${id}` : 'http://localhost:3000/api/usuarios';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    nombre_completo: name,
                    correo: email,
                    ...(password ? { contrasena: password } : {}),
                    tipo_usuario: type,
                    nit: nit,
                    direccion: address,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                mostrarMensaje(error.error || 'Error al guardar el usuario.', 'error');
                throw new Error('Error al guardar el usuario');
            }

            mostrarMensaje('Usuario guardado exitosamente.');
            userForm.reset();
            addUserForm.classList.add('hidden');
            cargarUsuarios();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            mostrarMensaje('Error al guardar el usuario.', 'error');
        }
    });

    userList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-user')) {
            const userId = e.target.dataset.id;
            const confirmacion = confirm('¿Estás seguro de que deseas eliminar este usuario?');
            if (!confirmacion) return;

            try {
                const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    mostrarMensaje(error.error || 'Error al eliminar el usuario.', 'error');
                    throw new Error('Error al eliminar el usuario');
                }

                mostrarMensaje('Usuario eliminado exitosamente.');
                cargarUsuarios();
            } catch (error) {
                console.error('Error al eliminar usuario:', error);
                mostrarMensaje('Error al eliminar el usuario.', 'error');
            }
        }

        if (e.target.classList.contains('edit-user')) {
            const userId = e.target.dataset.id;
            try {
                const response = await fetch(`http://localhost:3000/api/usuarios/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    const error = await response.json();
                    mostrarMensaje(error.error || 'Error al cargar el usuario.', 'error');
                    throw new Error('Error al cargar el usuario');
                }

                const usuario = await response.json();
                mostrarFormularioUsuario(usuario);
            } catch (error) {
                console.error('Error al cargar usuario:', error);
                mostrarMensaje('Error al cargar el usuario.', 'error');
            }
        }
    });

    cargarUsuarios();
});
