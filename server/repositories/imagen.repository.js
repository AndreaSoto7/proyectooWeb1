import query from '../models/db.js';

const createImagen = async (imagen) => {
  try {
    const { fileName, path } = imagen;
    const temporal = true;
    const fechaSubida = new Date().toISOString();

    const sql = `
      INSERT INTO imagen (fileName, path, temporal, fechaSubida)
      VALUES ($1, $2, $3, $4)
      RETURNING imagenid;
    `;

    const result = await query(sql, [fileName, path, temporal, fechaSubida]);

    return result.rows[0].imagenid;
  } catch (error) {
    console.error('Error al crear la imagen:', error);
    throw error;
  }
};

export default {
  createImagen,
};
