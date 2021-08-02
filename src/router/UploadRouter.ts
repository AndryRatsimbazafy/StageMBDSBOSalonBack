import { Request, Response, Router } from 'express';
import UploadController from '../controllers/UploadController';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/tmp/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

class UploadRouter {
  router: Router;
  upload: any;

  constructor() {
    this.upload = multer({
      storage
    });
    this.router = Router();
    this.routes();
  }

  routes() { 
    this.router.post('/', this.upload.single('file'), UploadController.uploadFree);

    this.router.post(
      '/files',
      this.upload.single('file'),
      UploadController.uploadFiles
    );
    // this.router.post(
    //   '/files', (req, res) => {
    //     req.socket.setTimeout(30 * 60 * 1000); // 30 minutes
    //     this.upload.single('file'),
    //       UploadController.uploadFiles
    //   }
    // );

    this.router.get('*', UploadController.default);
  }
}

export default new UploadRouter().router;
