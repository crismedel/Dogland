import multer from 'multer';
import sharp from 'sharp';

const storage = multer.memoryStorage();

export const uploadProfileMemory = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ⬅️ AUMENTAR a 10MB temporalmente
  fileFilter: (req, file, cb) => {
    console.log('🔍 fileFilter ejecutado:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
    }); // ⬅️ AGREGAR

    const allowed = /jpeg|jpg|png|webp/;
    const name = (file.originalname || '').toLowerCase();
    const isValid = allowed.test(file.mimetype) || allowed.test(name);

    if (isValid) {
      console.log('✅ Archivo aceptado'); // ⬅️ AGREGAR
      cb(null, true);
    } else {
      console.log('❌ Archivo rechazado'); // ⬅️ AGREGAR
      cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
    }
  },
});

export const processProfileImage = async (req, res, next) => {
  console.log('📥 processProfileImage ejecutado');
  console.log('📥 req.file:', req.file);

  if (!req.file) {
    console.log('❌ NO HAY req.file');
    return res
      .status(400)
      .json({ success: false, error: 'No se subió ninguna imagen' });
  }

  try {
    console.log('🖼️  Procesando imagen original:', {
      size: req.file.size,
      mimetype: req.file.mimetype,
      fieldname: req.file.fieldname,
      bufferLength: req.file.buffer?.length,
    });

    const buffer = await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toBuffer();

    console.log('✅ Imagen procesada:', buffer.length, 'bytes');

    req.processedImage = {
      buffer,
      mimetype: 'image/webp',
    };

    next();
  } catch (error) {
    console.error('❌ Error al procesar imagen de perfil:', error);
    next(error);
  }
};
