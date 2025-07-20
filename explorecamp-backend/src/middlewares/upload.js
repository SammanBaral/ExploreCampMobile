import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // this folder must exist
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG images are allowed!'), false);
    }
};
const upload = multer({ storage, fileFilter });
export const uploadMultiple = upload.array('images', 10);
export const uploadSingle = upload.single('image');