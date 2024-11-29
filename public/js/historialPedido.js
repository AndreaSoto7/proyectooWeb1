document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const orderHistoryContainer = document.querySelector('.order-history');

    const mostrarMensaje = (mensaje, tipo = "success") => {
        const mensajeDiv = document.createElement("div");
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.textContent = mensaje;
        document.body.appendChild(mensajeDiv);

        setTimeout(() => mensajeDiv.remove(), 3000);
    };

    const cargarHistorialPedidos = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/pedidos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar el historial de pedidos');
            const pedidos = await response.json();

            orderHistoryContainer.innerHTML = pedidos.map(pedido => `
                <div class="order">
                    <h2>Pedido #${pedido.id_pedido}</h2>
                    <p>Cliente: ${pedido.cliente}</p>
                    <p>Fecha: ${new Date(pedido.fecha).toLocaleDateString()}</p>
                    <p>Total: $${pedido.total}</p>
                    <p>Estado: ${pedido.estado}</p>
                    <table id="details-${pedido.id_pedido}" class="order-details hidden">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pedido.detalles.map(detalle => `
                                <tr>
                                    <td>${detalle.nombre}</td>
                                    <td>${detalle.cantidad}</td>
                                    <td>$${detalle.subtotal}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `).join('');
        } catch (error) {
            mostrarMensaje('Error al cargar el historial de pedidos.', 'error');
        }
    };

    cargarHistorialPedidos();
});
