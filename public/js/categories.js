document.addEventListener("DOMContentLoaded", async () => {
    const categorySelect = document.querySelector('select[name="category"]');

    if (!categorySelect) {
        console.error("No se encontró el elemento <select> con name='category'.");
        return;
    }

    try {
        // Hacer una solicitud al endpoint para obtener las categorías
        const response = await fetch("http://localhost:3000/api/categorias");
        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status}`);
        }

        const categories = await response.json();

        // Verificar que la respuesta sea un array
        if (!Array.isArray(categories)) {
            throw new Error("La respuesta de http://localhost:3000/api/categorias no es un array.");
        }

        // Agregar cada categoría como una opción en el <select>
        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id; // Asignar el ID de la categoría como valor
            option.textContent = category.nombre; // Mostrar el nombre de la categoría
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar las categorías:", error);
    }
});
