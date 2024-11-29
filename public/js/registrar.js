document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevenir el envío por defecto del formulario

        const nombreCompleto = document.querySelector('#nombre').value;
        const usuario = document.querySelector('#usuario').value;
        const contrasena = document.querySelector('#contraseña').value;
        const nit = document.querySelector('#nit').value;
        const direccion = document.querySelector('#direccion').value;

        if (!nombreCompleto || !usuario || !contrasena || !nit || !direccion) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_completo: nombreCompleto,
                    correo: usuario,
                    contrasena: contrasena,
                    tipo_usuario: 'cliente', // Define el tipo de usuario como "cliente"
                    nit: nit,
                    direccion: direccion
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                alert(error.error || 'Error al registrar usuario.');
                return;
            }

            const data = await response.json();
            alert('Registro exitoso. Ahora puedes iniciar sesión.');

            // Guardar el session_id en localStorage
            if (data.session_id) {
                localStorage.setItem('session_id', data.session_id);
            }

            window.location.href = 'iniciarSesion.html'; // Redirige al formulario de inicio de sesión
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            alert('Error al conectar con el servidor.');
        }
    });
});
