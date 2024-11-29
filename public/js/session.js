(function () {
    function getSessionId() {
        // Intentamos obtener el 'session_id' del localStorage.
        let sessionId = localStorage.getItem("session_id");

        if (!sessionId) {
            // Generamos un nuevo identificador único usando 'crypto.randomUUID()' (esto crea un UUID aleatorio).
            sessionId = crypto.randomUUID();

            localStorage.setItem("session_id", sessionId);
        }

        return sessionId;
    }

    window.getSessionId = getSessionId;
})();
