import { Router } from 'express';
import AssetsController from '../controllers/AssetsController';
import * as multer from 'multer';
import { auth } from '../middlewares';
import userController from '../controllers/UserController';
import timerController from '../controllers/TimerController';

class UnityRouter {
  upload: any;
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    /**
      * @swagger
      * /api/unity/assets:
      *    get:
      *      summary: Get all exposant assets dans unity
      *      tags: [Assets]
      *      responses:
      *        '200':
      *          description: All assets gotten successfully
      */
    this.router.get("/assets", AssetsController.getAllExposantAssets);

    this.router.get("/hall", AssetsController.getHallExposantAssets);

    this.router.get("/coach", userController.getCoach);

    this.router.get("/exposant/:_id", userController.getOne);

    this.router.post("/timer", auth.protect, auth.authorize("superadmin"), timerController.post);

    this.router.get("/timer", timerController.get); 

  }
}

export default new UnityRouter().router;