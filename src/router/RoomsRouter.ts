import { Router } from 'express';
import RoomsController from '../controllers/RoomsController';
import { auth } from '../middlewares';

class RoomsRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        /**
         * @swagger
         * tags:
         *    name: Rooms
         *    description: API to manage rooms [admin/exposant only]
         */


         /**
         * @swagger
         * /api/rooms:
         *    post:
         *      summary: Create a new room
         *      security: 
         *        - BearerAuth: [admin, exposant]
         *      tags: [Rooms]
         *      consumes:
         *        - application/json
         *      parameters: 
         *        - in: body
         *          name: room
         *          description: the room to create.
         *          required: true
         *          schema:
         *              type: object
         *              properties:
         *                  name:
         *                      type: string
         *                  surface:
         *                      type: number
         *                  commercial: 
         *                      type: string
         *                  visio: 
         *                      type: string
         *                  statistic_visitor: 
         *                      type: number
         *                  preset_link: 
         *                      type: string
         *                  assets_id: 
         *                      type: string
         *                  users_id: 
         *                      type: string
         *              example:
         *                  name: My new room
         *                  surface: 20
         *                  commercial: My commercial
         *                  visio: My visio
         *                  statistic_visitor: 100
         *                  preset_link: My preset link
         *                  assets_id: 5fd70e2f24a85832182daae7
         *                  users_id: 5fd9f00bb6d711dc24cd06ea
         *      responses:
         *        '200':
         *          description: Room created successfully
         *        '401': 
         *          description: Not authenticated / Invalid token
         *        '403':
         *          description: Room role not allowed
         */
        this.router.post('/', auth.protect, auth.authorize("superadmin", "admin", "exposant"), RoomsController.createRoom)
        
        this.router.post('/visitors', RoomsController.addVisitor)


        /**
         * @swagger
         * /api/rooms:
         *    get:
         *      summary: Get all rooms
         *      security: 
         *        - BearerAuth: [admin, exposant]
         *      tags: [Rooms]
         *      responses:
         *        '200':
         *          description: All rooms gotten successfully
         *        '401': 
         *          description: Not authenticated / Invalid token
         *        '403':
         *          description: Room role not allowed
         */
        this.router.get('/', auth.protect, auth.authorize("superadmin", "admin", "exposant"), RoomsController.getAllRooms)

        /**
         * @swagger
         * /api/rooms/{roomId}:
         *    get:
         *      summary: Get a room
         *      security: 
         *        - BearerAuth: [admin, exposant]
         *      tags: [Rooms]
         *      parameters: 
         *        - in: path
         *          name: roomId
         *          type: string
         *          required: true,
         *          description: Room Id to get
         *      responses:
         *        '200':
         *          description: Room gotten successfully
         *        '401': 
         *          description: Not authenticated / Invalid token
         *        '403':
         *          description: Room role not allowed
         */
        this.router.get('/:_id', auth.protect, auth.authorize("superadmin", "admin", "exposant"), RoomsController.getOneRoom)

        /**
         * @swagger
         * /api/rooms/user/{userId}:
         *    get:
         *      summary: Get a room by user ID
         *      security: 
         *        - BearerAuth: [admin, exposant]
         *      tags: [Rooms]
         *      parameters: 
         *        - in: path
         *          name: userId
         *          type: string
         *          required: true,
         *          description: User Id
         *      responses:
         *        '200':
         *          description: Room gotten successfully
         *        '401': 
         *          description: Not authenticated / Invalid token
         *        '403':
         *          description: Room role not allowed
         */
        this.router.get('/user/:_id', auth.protect, auth.authorize("superadmin", "admin", "exposant"), RoomsController.getOneRoomByUser)

        /**
         * @swagger
         * /api/rooms/{roomId}:
         *    put:
         *      summary: Update a room
         *      security: 
         *        - BearerAuth: [admin, exposant]
         *      tags: [Rooms]
         *      consumes:
         *        - application/json
         *      parameters: 
         *        - in: path
         *          name: roomId
         *          description: the room to create.
         *          required: true
         *        - in: body
         *          name: room
         *          description: Name of the room.
         *          required: false
         *          schema:
         *              type: object
         *              properties:
         *                  name:
         *                      type: string
         *                  surface:
         *                      type: number
         *                  commercial: 
         *                      type: string
         *                  visio: 
         *                      type: string
         *                  statistic_visitor: 
         *                      type: number
         *                  preset_link: 
         *                      type: string
         *                  assets_id: 
         *                      type: string
         *                  users_id: 
         *                      type: string
         *              example:
         *                  name: My new room
         *                  surface: 20
         *                  commercial: My commercial
         *                  visio: My visio
         *                  statistic_visitor: 100
         *                  preset_link: My preset link
         *                  assets_id: 5fd70e2f24a85832182daae7
         *                  users_id: 5fd9f00bb6d711dc24cd06ea
         *      responses:
         *        '200':
         *          description: Room created successfully
         *        '401': 
         *          description: Not authenticated / Invalid token
         *        '403':
         *          description: Room role not allowed
         */
        this.router.put('/:_id', auth.protect, auth.authorize("superadmin", "admin", "exposant"), RoomsController.updateRoom)

         /**
         * @swagger
         * /api/rooms/{roomId}:
         *    delete:
         *      summary: Delete a room by Id
         *      security: 
         *        - BearerAuth: [admin, exposant]
         *      tags: [Rooms]
         *      parameters: 
         *        - in: path
         *          name: roomId
         *          type: string
         *          required: true,
         *          description: Room Id to get
         *      responses:
         *        '200':
         *          description: Room deleted successfully
         *        '401': 
         *          description: Not authenticated / Invalid token
         *        '403':
         *          description: Room role not allowed
         */
        this.router.delete('/:_id', auth.protect, auth.authorize("superadmin", "admin", "exposant"), RoomsController.deleteRoom)
    }
}

export default  new RoomsRouter().router;