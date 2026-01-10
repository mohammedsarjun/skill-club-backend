import express from 'express';
import multer from 'multer';
import { container } from 'tsyringe';
import { authMiddleware } from '../middlewares/auth-middleware';
import { FileUploadController } from '../controllers/common/file-upload-controller';

const uploadRouter = express.Router();
const memoryStorage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB default limit
  },
});

const fileUploadController = container.resolve(FileUploadController);

uploadRouter.post('/', authMiddleware, memoryStorage.single('file'), (req, res, next) => {
  fileUploadController.uploadSingle(req, res).catch(next);
});

export default uploadRouter;
