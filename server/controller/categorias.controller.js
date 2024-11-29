import {
  listarCategorias as listarCategoriasRepo,
  crearCategoria as crearCategoriaRepo,
  listarCategoriasConProductos as listarCategoriasConProductosRepo,
  actualizarCategoria as actualizarCategoriaRepo,
  eliminarCategoria as eliminarCategoriaRepo,
} from '../repositories/categories.repository.js';
import query from '../models/db.js'; // Ajusta la ruta si es necesario

// Crear una categoría
const crearCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  try {
    const categoria = await crearCategoriaRepo(nombre, descripcion);
    res.status(201).json({ message: 'Categoría creada exitosamente', categoria });
  } catch (err) {
    console.error('Error al crear la categoría:', err);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría
const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  if (!id || !nombre) {
    return res.status(400).json({ error: 'El ID y el nombre son obligatorios' });
  }

  try {
    const categoria = await actualizarCategoriaRepo(id, nombre, descripcion);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({
      message: 'Categoría actualizada exitosamente',
      categoria,
    });
  } catch (err) {
    console.error('Error al actualizar la categoría:', err);
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
};

const obtenerCategoria = async (req, res) => {
  const { id } = req.params;

  if (!id) {
      return res.status(400).json({ error: 'El ID de la categoría es obligatorio' });
  }

  try {
      const sql = 'SELECT * FROM categorias WHERE id = $1';
      const result = await query(sql, [id]); // Asegúrate de que 'query' esté correctamente importado

      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Categoría no encontrada' });
      }

      res.status(200).json(result.rows[0]);
  } catch (error) {
      console.error('Error al obtener la categoría:', error);
      res.status(500).json({ error: 'Error al obtener la categoría' });
  }
};




// Eliminar una categoría
// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'El ID de la categoría es obligatorio' });
  }

  try {
    const categoriaEliminada = await eliminarCategoriaRepo(id);

    if (!categoriaEliminada) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({
      message: 'Categoría eliminada exitosamente',
      categoria: categoriaEliminada,
    });
  } catch (err) {
    console.error('Error al eliminar la categoría:', err);
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
};





// Listar todas las categorías
const listarCategorias = async (req, res) => {
  try {
    const categorias = await listarCategoriasRepo();
    res.status(200).json(categorias);
  } catch (err) {
    console.error('Error al listar las categorías:', err);
    res.status(500).json({ error: 'Error al listar las categorías' });
  }
};

// Listar todas las categorías con productos
const listarCategoriasConProductos = async (req, res) => {
  try {
    const rawData = await listarCategoriasConProductosRepo();

    // Estructurar los datos por categorías
    const categoriasConProductos = rawData.reduce((acc, row) => {
      const categoria = acc.find(cat => cat.id === row.categoria_id);
      if (categoria) {
        if (row.producto_id) {
          categoria.productos.push({
            id: row.producto_id,
            nombre: row.producto_nombre,
            descripcion: row.producto_descripcion,
            precio: row.precio,
            stock: row.stock,
          });
        }
      } else {
        acc.push({
          id: row.categoria_id,
          nombre: row.categoria_nombre,
          descripcion: row.categoria_descripcion,
          productos: row.producto_id
            ? [
                {
                  id: row.producto_id,
                  nombre: row.producto_nombre,
                  descripcion: row.producto_descripcion,
                  precio: row.precio,
                  stock: row.stock,
                },
              ]
            : [],
        });
      }
      return acc;
    }, []);

    res.status(200).json(categoriasConProductos);
  } catch (err) {
    console.error('Error al listar categorías con productos:', err);
    res.status(500).json({ error: 'Error al listar categorías con productos' });
  }
};

export { crearCategoria, listarCategorias, listarCategoriasConProductos, actualizarCategoria, eliminarCategoria, obtenerCategoria };
