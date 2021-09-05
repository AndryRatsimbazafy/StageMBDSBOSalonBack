import { Router } from "express";
import DashBoardController from "../controllers/DashBoardController";
import { auth } from "../middlewares";

class DashBoardRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get("/generateDashboardActions", DashBoardController.generateDashboardActions);
    this.router.get("/visitByAssetType", DashBoardController.visitByAssetType);
    this.router.get("/visitByAsset", DashBoardController.visitByAsset);
    this.router.get("/visitTimeByExposant", DashBoardController.visitTimeByExposant);
    this.router.get("/visitByAges", DashBoardController.visitByAges);
    this.router.get("/visitByAssetsPerHours", DashBoardController.visitByAssetsPerHours);
    this.router.get("/visitAssetTypeByAges", DashBoardController.visitAssetTypeByAges);
    this.router.get("/visitAssetPerDays", DashBoardController.visitAssetPerDays);
    this.router.get("/usersByAge", DashBoardController.usersByAge);
    this.router.get("/usersByAgeByGender", DashBoardController.usersByAgeByGender);
  }
}

export default new DashBoardRouter().router;