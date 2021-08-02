import { Router } from 'express';
import MainController from '../controllers/MainController';

class MainRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.get('*', MainController.Main)
    }
}

export default  new MainRouter().router;
