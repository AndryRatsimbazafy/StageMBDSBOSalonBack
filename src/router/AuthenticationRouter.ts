import { Router } from 'express';
import AuthenticationController from '../controllers/AuthenticationContoller';
import { auth } from '../middlewares';

class AuthenticationRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        /**
         * @swagger
         * tags:
         *    name: Auth
         *    description: API for authentication
         */        

         /**
         * @swagger
         * /api/auth/register:
         *    post:
         *      summary: register user
         *      tags: [Auth]
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
         *          description: User registered successfully
         */
        this.router.post('/register', AuthenticationController.register)

        /**
         * @swagger
         * /api/auth/login:
         *    post:
         *      summary: login user
         *      tags: [Auth]
         *      consumes:
         *        - application/json
         *      parameters: 
         *        - in: body
         *          name: user credentials
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
         *            example:
         *              email: myemail@gmail.com
         *              password: mypassword
         *      responses:
         *        '200':
         *          description: Logged in successfully
         *        '400': 
         *          description: bad request
         *        '401':
         *          description: Invalid credentials
         *         
         */
        this.router.post('/login', AuthenticationController.login)

        this.router.post(
            '/newAccessToken',
            auth.protect,
            auth.authorize("superadmin", "admin", "exposant"),
            AuthenticationController.getNewAccessToken
            )

        /**
         * @swagger
         * /api/auth/logout:
         *    post:
         *      summary: logout user
         *      tags: [Auth]
         *      responses:
         *        '200':
         *          description: Logged out successfully
         *         
         */
        this.router.post('/logout', AuthenticationController.logout)

        /**
         * @swagger
         * /api/auth/forgotpassword:
         *    post:
         *      summary: user forgot password
         *      tags: [Auth]
         *      consumes:
         *        - application/json
         *      parameters: 
         *        - in: body
         *          name: user email
         *          description: the user to create.
         *          schema:
         *            type: object
         *            required:
         *              - email
         *            properties:
         *              email:
         *                type: string
         *            example:
         *              email: myemail@gmail.com
         *      responses:
         *        '200':
         *          description: email for reset password sent successfully
         *        '404': 
         *          description: user not found
         *        '500':
         *          description: server error / email not sent
         *         
         */
        this.router.post('/forgotpassword', AuthenticationController.forgotPassword)

        /**
         * @swagger
         * /api/auth/resetpassword/{resettoken}:
         *    put:
         *      summary: reset user password
         *      tags: [Auth]
         *      consumes:
         *        - application/json
         *      parameters: 
         *        - in: path
         *          name: resettoken
         *          type: string
         *          required: true,
         *          description: token to reset user password
         *        - in: body
         *          name: password
         *          description: the new user password.
         *          schema:
         *            type: object
         *            required:
         *              - password
         *            properties:
         *              password:
         *                type: string
         *      responses:
         *        '200':
         *          description: password updated successfully
         */
        this.router.put('/resetpassword/:resettoken', AuthenticationController.resetPassword)

        /**
         * @swagger
         * /api/auth/refreshtoken:
         *    post:
         *      summary: refresh token
         *      tags: [Auth]
         *      consumes:
         *        - application/json
         *      parameters: 
         *        - in: body
         *          name: refresh token
         *          description: the latest user refresh token.
         *          schema:
         *            type: object
         *            required:
         *              - refreshToken
         *            properties:
         *              refreshToken:
         *                type: string
         *      responses:
         *        '200':
         *          description: new user access and refresh token
         */
        this.router.post("/refreshtoken", AuthenticationController.refreshToken);

        this.router.post("/contactUs", AuthenticationController.contact )
    }
}

export default  new AuthenticationRouter().router;