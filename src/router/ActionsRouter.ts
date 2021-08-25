
import { Router } from 'express';
import ActionssController from '../controllers/ActionsController';

class ActionsRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.get(
          "",
          ActionssController.getActions
        );
        this.router.post(
          "",
          ActionssController.addAction
        );
        this.router.put(
          "/:_id",
          ActionssController.updateAction
        );
    }
}

export default  new ActionsRouter().router;
