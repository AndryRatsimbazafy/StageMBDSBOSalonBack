import { Response, Request } from 'express';
import * as path from 'path';

class MainController {
  constructor() {}

  Main(req: Request, res: Response): void {
    res.sendFile(path.join(process.cwd(), 'angular-bo/index.html'))
    // res.end('Ok ok');
  }

  Ping(req: Request, res: Response): void {
    res.sendStatus(200);
  }
}

const mainController = new MainController();

export default mainController;
