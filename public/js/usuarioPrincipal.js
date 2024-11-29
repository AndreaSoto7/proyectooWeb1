document.addEventListener('DOMContentLoaded', () => {
    const userNameButton = document.querySelector('#user-name');
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    if (!usuario) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = 'iniciarSesion.html';
        return;
    }

    // Muestra el nombre del usuario en el botón
    userNameButton.textContent = usuario.nombre_completo;

    // Opción para cerrar sesión
    userNameButton.addEventListener('click', () => {
        const confirmar = confirm('¿Quieres cerrar sesión?');
        if (confirmar) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = 'index.html'; // Redirige al índice público
        }
    });
});
