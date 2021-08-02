import { Router } from 'express';
import AssetsController from '../controllers/AssetsController';
import * as multer from 'multer';
import { auth } from '../middlewares';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/tmp/');
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
});

class AssetsRouter {
  upload: any;
  router: Router;

  constructor() {
    this.upload = multer({ storage });
    this.router = Router();
    this.routes();
  }

  routes() {
    /**
     * @swagger
     * tags:
     *    name: Assets
     *    description: API to manage assets [admin/exposant only]
     */

     /**
     * @swagger
     * /api/assets:
     *    post:
     *      summary: Create a new asset
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Assets]
     *      consumes:
     *        - multipart/form-data
     *      parameters: 
     *        - in: formData
     *          name: logo
     *          type: file
     *          required: true
     *          description: The logo to upload.
     *        - in: formData
     *          name: idExposant
     *          type: string
     *          required: true
     *          description: The idExposant.
     *        - in: formData
     *          name: video
     *          type: file
     *          required: false
     *          description: The video to upload.
     *        - in: formData
     *          name: flyer
     *          type: file
     *          required: false
     *          description: The flyers to upload (10 files max).
     *          items: 
     *            type: string
     *            format: binary
     *        - in: formData
     *          name: gallery
     *          type: file
     *          required: false
     *          description: The gallery to upload (10 files max).
     *          items: 
     *            type: string
     *            format: binary
     *        - in: formData
     *          name: model3D
     *          type: file
     *          required: false
     *          description: The model3D to upload (10 files max).
     *          items: 
     *            type: string
     *            format: binary
     *      responses:
     *        '200':
     *          description: Asset created successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */

    this.router.post(
      "/",
      auth.protect,
      auth.authorize("superadmin", "admin", "exposant"),
      // this.upload.fields([
      //   { name: "idExposant", maxCount: 1 },
      //   { name: "logo", maxCount: 1 },
      //   { name: "videos", maxCount: 10 },
      //   { name: "flyers", maxCount: 20 },
      //   { name: "gallery", maxCount: 20 },
      // ]),
      AssetsController.uploadUsingBusboy,
      AssetsController.createAsset
    );

    /**
     * @swagger
     * /api/assets:
     *    get:
     *      summary: Get all assets
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Assets]
     *      responses:
     *        '200':
     *          description: All assets gotten successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.get("/", auth.protect, auth.authorize("superadmin", "admin", "exposant"), AssetsController.getAllAssets);

    /**
     * @swagger
     * /api/assets/{assetId}:
     *    get:
     *      summary: Get one asset
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Assets]
     *      parameters: 
     *        - in: path
     *          name: assetId
     *          type: string
     *          required: true,
     *          description: Asset Id to get
     *      responses:
     *        '200':
     *          description: Asset created successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.get("/:_id", auth.protect, auth.authorize("superadmin", "admin", "exposant"), AssetsController.getOneAsset);

    /**
     * @swagger
     * /api/assets/exhibitor/{exposantId}:
     *    get:
     *      summary: Get one asset
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Assets]
     *      parameters: 
     *        - in: path
     *          name: exposantId
     *          type: string
     *          required: true,
     *          description: get Asset by Exposant Id
     *      responses:
     *        '200':
     *          description: Asset created successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.get("/exhibitor/:_id", auth.protect, auth.authorize("superadmin", "admin", "exposant"), AssetsController.getOneAssetByExhibitorId);

    this.router.put(
      "/item/:_id",
      auth.protect,
      auth.authorize("superadmin", "admin", "exposant"),
      AssetsController.updateAssetItem
    );

    /**
     * @swagger
     * /api/assets/{assetId}:
     *    put:
     *      summary: Update an asset
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Assets]
     *      consumes:
     *        - multipart/form-data
     *      parameters:
     *        - in: path
     *          name: assetId
     *          type: string
     *          required: true
     *          description: Id of the asset.
     *        - in: formData
     *          name: logo
     *          type: file
     *          required: true
     *          description: The logo to upload.
     *        - in: formData
     *          name: idExposant
     *          type: string
     *          required: true
     *          description: The idExposant.
     *        - in: formData
     *          name: video
     *          type: file
     *          required: false
     *          description: The video to upload.
     *        - in: formData
     *          name: flyer
     *          type: file
     *          required: false
     *          description: The flyers to upload (10 files max).
     *          items: 
     *            type: string
     *            format: binary
     *        - in: formData
     *          name: gallery
     *          type: file
     *          required: false
     *          description: The gallery to upload (10 files max).
     *          items: 
     *            type: string
     *            format: binary
     *        - in: formData
     *          name: model3D
     *          type: file
     *          required: false
     *          description: The model3D to upload (10 files max).
     *          items: 
     *            type: string
     *            format: binary
     *        - in: formData
     *          name: audio
     *          type: file
     *          required: false
     *          description: The audio to upload.
     *          schema:
     *              type: object
     *              properties:
     *                  logo: string
     *      responses:
     *        '200':
     *          description: Asset updated successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: Asset role not allowed
     */
    this.router.put(
      "/:_id",
      auth.protect,
      auth.authorize("superadmin", "admin", "exposant"),
      // this.upload.fields([
      //   { name: "logo", maxCount: 1 },
      //   { name: "videos", maxCount: 10 },
      //   { name: "flyers", maxCount: 20 },
      //   { name: "gallery", maxCount: 20 },
      // ]),
      AssetsController.uploadUsingBusboy,
      AssetsController.updateAsset
    );

    /**
     * @swagger
     * /api/assets/{assetId}:
     *    delete:
     *      summary: Delete an asset by Id
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Assets]
     *      parameters: 
     *        - in: path
     *          name: assetId
     *          type: string
     *          required: true,
     *          description: Asset Id to get
     *      responses:
     *        '200':
     *          description: Asset created successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.delete("/:_id", auth.protect, auth.authorize("superadmin", "admin", "exposant"), AssetsController.deleteAsset);

    this.router.post("/upload-busboy",
      AssetsController.uploadUsingBusboy,
      AssetsController.createAsset
    
    )
  }
}

export default  new AssetsRouter().router;