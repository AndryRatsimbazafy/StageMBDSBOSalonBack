
import { Router } from 'express';
import ContentsController from '../controllers/ContentsController';
import { auth } from '../middlewares';

class ContentsRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.get(
          "",
          auth.protect,
          auth.authorize("superadmin", "admin", "exposant"),
          ContentsController.getContents
        );
        this.router.post(
          "",
          auth.protect,
          auth.authorize("superadmin"),
          ContentsController.addContent
        );
        this.router.put(
          "/:_id",
          auth.protect,
          auth.authorize("superadmin"),
          ContentsController.updateContent
        );
    }
}

export default  new ContentsRouter().router;
