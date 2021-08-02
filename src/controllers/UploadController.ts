import { Response, Request } from 'express';
import * as path from 'path';

class UploadController {
  constructor() { }

  default(req: Request, res: Response): void {
    res.end('Default upload api works');
  }

  uploadFiles(req: Request, res: Response): void {
    res.json({ success: true, body: req.body });
  }

  uploadFree(req: Request, res: Response): void {
    res.status(200).json({ success: true, body: req.body });
  }
}

export default new UploadController();
