import {
  listarProductos as listarProductosRepo,
  obtenerProductoPorId,
  crearProducto as crearProductoRepo,
  actualizarProducto as actualizarProductoRepo,
  eliminarProducto as eliminarProductoRepo,
  verificarProductoEnPedidosPendientes,
  obtenerProductosDestacados
} from '../repositories/product.repository.js';

// Listar todos los productos
const listarProductos = async (req, res) => {
  try {
      const productos = await listarProductosRepo();

      // Ajustar las URLs de las imágenes para que sean accesibles
      const productosAdaptados = productos.map((producto) => {
          if (producto.imagen_url) {
              // Validar si la URL ya es absoluta (inicia con http o https)
              if (!producto.imagen_url.startsWith('http')) {
                  // Convertir rutas relativas a absolutas
                  producto.imagen_url = `${req.protocol}://${req.get('host')}/uploads/${producto.imagen_url.split('/').pop()}`;
              }
          } else {
              // Si no tiene imagen, usar un placeholder
              producto.imagen_url = `${req.protocol}://${req.get('host')}/img/default-placeholder.png`;
          }
          return producto;
      });

      res.status(200).json(productosAdaptados);
  } catch (err) {
      console.error('Error al listar productos:', err);
      res.status(500).json({ error: 'Error al obtener los productos' });
  }
};

// Crear un producto
const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, id_categoria, stock, imagen_url } = req.body;

    let finalImagenUrl = imagen_url;

    if (req.file) {
      const fileName = req.file.filename;
      finalImagenUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    }

    if (!finalImagenUrl) {
      return res.status(400).json({ error: 'Es obligatorio proporcionar una URL de imagen o subir una nueva' });
    }

    const producto = await crearProductoRepo({
      nombre,
      descripcion,
      precio,
      imagen_url: finalImagenUrl,
      id_categoria,
      stock,
    });

    res.status(201).json({ message: 'Producto creado con éxito', producto });
  } catch (err) {
    console.error('Error al crear el producto:', err);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
};


const actualizarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const productoExistente = await obtenerProductoPorId(id); // Asegúrate de que `obtenerProductoPorId` está implementado.

    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const { nombre, descripcion, precio, id_categoria, stock, imagen_url } = req.body;

    // Validar si se subió una nueva imagen.
    let finalImagenUrl = imagen_url || productoExistente.imagen_url;

    if (req.file) {
      const fileName = req.file.filename;
      finalImagenUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    }

    const productoActualizado = await actualizarProductoRepo(id, {
      nombre,
      descripcion,
      precio,
      imagen_url: finalImagenUrl,
      id_categoria,
      stock,
    });

    res.status(200).json({ message: 'Producto actualizado con éxito', producto: productoActualizado });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
};

const verProducto = async (req, res) => {
  const { id } = req.params;

  // Validar si el ID es un número
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número' });
  }

  try {
    const producto = await obtenerProductoPorId(id); // Supone que este método ya está implementado en el repositorio

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Adaptar la URL de la imagen si existe
    if (producto.imagen_url) {
      const filename = producto.imagen_url.split('\\').pop();
      producto.imagen_url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
};

const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  // Validar si el ID es un número
  if (isNaN(id)) {
    return res.status(400).json({ error: 'El ID del producto debe ser un número' });
  }

  try {
    // Verificar si el producto está en pedidos pendientes
    const conteo = await verificarProductoEnPedidosPendientes(id); // Este método debería estar en el repositorio

    if (conteo > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar este producto porque está asociado con pedidos pendientes',
      });
    }

    // Eliminar el producto
    const producto = await eliminarProductoRepo(id); // Este método debería estar en el repositorio

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado exitosamente', producto });
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
};

const verProductosDestacados = async (req, res) => {
  try {
      const productos = await obtenerProductosDestacados();
      const productosAdaptados = productos.map(producto => {
          if (producto.imagen_url && !producto.imagen_url.startsWith('http')) {
              const filename = producto.imagen_url.split('/').pop();
              producto.imagen_url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
          } else if (!producto.imagen_url) {
              producto.imagen_url = `${req.protocol}://${req.get('host')}/img/default-placeholder.png`;
          }
          return producto;
      });

      res.status(200).json(productosAdaptados);
  } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      res.status(500).json({ error: 'Error al obtener productos destacados' });
  }
};

// Otros métodos se mantienen iguales.
export {
  listarProductos,
  verProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  verProductosDestacados
};

