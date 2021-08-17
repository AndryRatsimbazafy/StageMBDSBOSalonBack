import { Router } from "express";
import UserController from "../controllers/UserController";
import { auth } from "../middlewares";

class UserRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    /**
     * @swagger
     * tags:
     *    name: Users
     *    description: API to manage users [admin/exposant only]
     */


    /**
     * @swagger
     * /api/users:
     *    post:
     *      summary: Create a new user
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Users]
     *      consumes:
     *        - application/json
     *      parameters: 
     *        - in: body
     *          name: user
     *          description: the user to create.
     *          schema:
     *            type: object
     *            required:
     *              - email
     *              - password
     *            properties:
     *              email:
     *                type: string
     *              password:
     *                type: string
     *              role: 
     *                type: string
     *            example:
     *              email: myemail@gmail.com
     *              password: mypassword
     *      responses:
     *        '200':
     *          description: User added successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.post(
      "/",
      auth.protect,
      auth.authorize("superadmin", "admin", "exposant"),
      UserController.createUser
    );

    this.router.post(
      "/sendEmail",
      UserController.sendEmailToExposant
    );

    /**
     * @swagger
     * /api/users:
     *    get:
     *      summary: get all users
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Users]
     *      responses:
     *        '200':
     *          description: All users gotten successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.get(
      "/",
      auth.protect,
      auth.authorize("superadmin", "admin"),
      UserController.getAll
    );
    /**
     * @swagger
     * /api/users/commercial:
     *    get:
     *      summary: get all commercial of a room
     *      security: 
     *        - BearerAuth: [exposant]
     *      tags: [Users]
     *      responses:
     *        '200':
     *          description: Users gotten successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.get(
      "/commercial",
      auth.protect,
      auth.authorize("superadmin", "exposant"),
      UserController.getRoomsCommercials
    );

    this.router.get(
      "/exposant",
      auth.protect,
      auth.authorize("superadmin", "commercial"),
      UserController.getCommercialExposant
    );

    this.router.get(
      "/exposants",
      auth.protect,
      auth.authorize("superadmin", "admin"),
      UserController.getAllExposant
    );

    this.router.get(
      "/exposants/notSet",
      auth.protect,
      auth.authorize("superadmin", "admin"),
      UserController.getExposantNotSet
    );

    this.router.get("/stand/:standnumber", auth.protect,
      auth.authorize("superadmin", "admin"), UserController.getOneByStandNumber);


    this.router.get("/coachings", UserController.getCoachings)

    this.router.get("/updateRandomAgeAndGender", UserController.updateRandomAgeAndGender);


    /**
     * @swagger
     * /api/users/{userId}:
     *    get:
     *      summary: get user by Id
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Users]
     *      parameters: 
     *        - in: path
     *          name: userId
     *          type: string
     *          required: true,
     *          description: User Id to get
     *      responses:
     *        '200':
     *          description: User gotten successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.get("/:_id", auth.protect, UserController.getOne);

    /**
     * @swagger
     * /api/users/{userId}:
     *    put:
     *      summary: Update user email
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Users]
     *      consumes:
     *        - application/json
     *      parameters: 
     *        - in: path
     *          name: userId
     *          type: string
     *          required: true,
     *          description: User Id to update
     *        - in: body
     *          name: user
     *          description: the user to update.
     *          schema:
     *            type: object
     *            required:
     *              - email
     *            properties:
     *              email:
     *                type: string
     *            example:
     *              email: mynewemail@gmail.com
     *      responses:
     *        '200':
     *          description: User updated successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.put("/:_id", auth.protect, UserController.update);

    /**
     * @swagger
     * /api/users/{userId}:
     *    delete:
     *      summary: Delete user by Id
     *      security: 
     *        - BearerAuth: [admin, exposant]
     *      tags: [Users]
     *      parameters: 
     *        - in: path
     *          name: userId
     *          type: string
     *          required: true,
     *          description: User Id to get
     *      responses:
     *        '200':
     *          description: User deleted successfully
     *        '401': 
     *          description: Not authenticated / Invalid token
     *        '403':
     *          description: User role not allowed
     */
    this.router.delete(
      "/:_id",
      auth.protect,
      auth.authorize("superadmin", "admin", "exposant"),
      UserController.delete
    );

  }
}

export default new UserRouter().router;
