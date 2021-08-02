import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares";
import rooms from "../models/rooms";
import assets from "../models/assets";
import { ErrorResponse } from "../utils";

class RoomsController {
  constructor() {}

  /**
   * @description Create new rooms
   * @route   POST  /api/rooms
   * @access  Public
   */
  createRoom = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        commercial,
        visio,
        color,
        user_id,
        type,
        variant,
        mob,
        characters,
      } = req.body;

      const existingRoom: any = await rooms.findOne({
        user_id: req.body.user_id,
      });
      if (existingRoom) {
        req.params._id = existingRoom._id;
        this.updateRoom(req, res, next);
        return;
      }

      const room = await rooms.create({
        commercial,
        visio,
        color,
        user_id,
        type,
        variant,
        mob,
        characters,
      });

      res.status(200).json({
        success: true,
        body: room,
      });
    }
  );

  /**
   * @description Get all rooms
   * @route   GET  /api/rooms
   * @access  Private: Admin
   */
  getAllRooms = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const room: any = await rooms.find().populate("user_id");

      res.status(200).json({
        success: true,
        body: room,
      });
    }
  );

  /**
   * @description Get one room
   * @route   GET  /api/rooms/:_id
   * @access  Private: Admin
   */
  getOneRoom = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const _id = req.params._id;

      const room: any = await rooms.findById(_id).populate("user_id");

      res.status(200).json({
        success: true,
        body: room,
      });
    }
  );

  /**
   * @description Get one room by user id
   * @route   GET  /api/rooms/user/:_id
   * @access  Private: Admin, Exposant
   */
  getOneRoomByUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const _id = req.params._id;

      const room: any = await rooms
        .findOne({ user_id: _id })
        .populate("user_id");

      res.status(200).json({
        success: true,
        body: room,
      });
    }
  );

  /**
   * @description Update one room
   * @route   POST  /api/rooms/:_id
   * @access  Private: exposant/admin
   */
  updateRoom = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const {
        commercial,
        visio,
        color,
        user_id,
        type,
        variant,
        mob,
        characters,
      } = req.body;
      const updatedAt = Date.now();
      const _id = req.params._id;

      const room: any = await rooms.findByIdAndUpdate(
        _id,
        {
          commercial,
          visio,
          color,
          user_id,
          type,
          variant,
          mob,
          characters,
          updatedAt,
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        body: room,
      });
    }
  );

  /**
   * @description Delete one room
   * @route   DELETE  /api/rooms/:_id
   * @access  Private: Admin
   */
  deleteRoom = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const _id = req.params._id;

      const room: any = await rooms.findByIdAndRemove(_id);

      res.status(200).json({
        success: true,
        body: room,
      });
    }
  );

  addVisitor = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // get game object id from req.body
      const gameObjectId = req.body.gameObjectId;
      const visitorId = req.body.visitorId;
      console.log("req.body", gameObjectId, visitorId);

      const assetInfo: any = await assets.findOne({ gameObjectId });

      const exposantId = assetInfo.idExposant;

      if (!exposantId) {
        return next(new ErrorResponse("Exposant non trouvé", 404));
      }
      console.log("idexposant", exposantId);

      // get exposant id from assets based on gameobject id
      const condition = {
        user_id: exposantId,
      };

      const update = {
        $addToSet: { visitors: visitorId },
      };

      // update rooms visitor based on exposant id
      await rooms.findOneAndUpdate(condition, update, {
        runValidators: false,
      });

      res.status(200).json({
        success: true,
        body: "visitor added to room ",
      });
    }
  );
}

const roomsController = new RoomsController();

export default roomsController;