document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevenir el envío por defecto del formulario

        const usuario = document.querySelector("#usuario").value.trim();
        const contrasena = document.querySelector("#contraseña").value.trim();
        const session_id = localStorage.getItem("session_id");

        if (!usuario || !contrasena) {
            mostrarMensaje("Por favor, completa todos los campos.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo: usuario, contrasena, session_id }), // Enviar session_id
            });

            if (!response.ok) {
                const error = await response.json();
                mostrarMensaje(error.error || "Error al iniciar sesión.", "error");
                return;
            }

            const data = await response.json();

            // Guardar token, usuario, y session_id actualizado en almacenamiento local
            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));
            if (data.session_id) {
                localStorage.setItem("session_id", data.session_id);
            }

            mostrarMensaje("Inicio de sesión exitoso.", "success");

            // Redirigir según el tipo de usuario
            redirigirUsuario(data.usuario.tipo_usuario);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            mostrarMensaje("Error al conectar con el servidor.", "error");
        }
    });

    // Función para redirigir según el tipo de usuario
    const redirigirUsuario = (tipoUsuario) => {
        if (tipoUsuario === "administrador") {
            window.location.href = "/listaProducto.html"; // Página de administración
        } else {
            window.location.href = "/paginaPrincipal.html"; // Página principal para clientes
        }
    };

    // Función para mostrar mensajes
    const mostrarMensaje = (mensaje, tipo) => {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.textContent = mensaje;

        document.body.appendChild(mensajeDiv);

        setTimeout(() => mensajeDiv.remove(), 3000);
    };

    // Verificar si el usuario ya está logueado
    verificarInicioSesion();
});

// Función para verificar si el usuario está logueado
function verificarInicioSesion() {
    const token = localStorage.getItem("token");
    const usuario = localStorage.getItem("usuario");

    if (token && usuario) {
        const parsedUser = JSON.parse(usuario);
        const tipoUsuario = parsedUser.tipo_usuario;

        // Redirigir al tipo de usuario correspondiente
        if (tipoUsuario === "administrador") {
            window.location.href = "/listaProducto.html";
        } else {
            window.location.href = "/paginaPrincipal.html";
        }
    }
}
