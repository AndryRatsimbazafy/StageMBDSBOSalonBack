import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares";
import rooms from "../models/rooms";
import users from "../models/users";
import { ErrorResponse, sendMail } from "../utils";
import * as generator from "generate-password"
import * as bcrypt from 'bcrypt';

class UserController {
  constructor() { }

  /**
   * @description Create new user. Only admin an exposant can create new user
   * Exposant create user (commercial) and affect him to a room
   * Request body must contain roomId to add the new user
   * @route   POST  /api/users/
   * @access  Private
   */
  createUser = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      const {
        email,
        role,
        companyName,
        standNumber,
        lastName,
        firstName,
        phoneNumber,
        postalCode,
      } = req.body;

      // check if user already exists
      const userEmailExists = await users.findOne({ email });
      if (userEmailExists) {
        return next(new ErrorResponse("l'email existe déjà", 400));
      }

      // generate user password
      const password = generator.generate({
        length: 12,
        numbers: true,
      });

      console.log(email, ",", role, ",", password);

      let newuser: any;
      try {
        newuser = await users.create({
          email,
          password,
          role,
          companyName,
          standNumber,
          lastName,
          firstName,
          phoneNumber,
          postalCode
        });
        console.log("newuser", newuser);

        // check if new user is a commercial
        // then add user to its 'exposant' room
        if (role === "commercial") {

          // [role commercial] check if there is still a place for a new commercial
          const exhibitor = (req.user as any);
          let room: any = await rooms.findOne({ user_id: exhibitor._id });

          if (exhibitor.role === 'exposant') {
            if (
              room
              && Array.isArray(room.characters)
              && Array.isArray(room.commercial)
              && (room.commercial.length + 1) > room.characters.length // room.characters.length ONLY if select max characters is mandatory
            ) {
              await users.findByIdAndDelete(newuser._id);
              return next(new ErrorResponse("Vous avez atteint le nombre maximum de commerciaux.", 400));
            }
          }

          if (!room) room = await rooms.create({
            user_id: req.user._id,
            commercial: []
          });

          // searching for the right index for the new commercial
          let index = 1;
          const existingIndexes = room.commercial.map(e => e.index);
          console.log('existingIndexes', existingIndexes)
          if (existingIndexes) {
            existingIndexes.sort((a, b) => a - b)
            console.log('existingIndexes sorted', existingIndexes)

            let indexIsValid = false;
            existingIndexes.forEach(e => {
              if (e === index && !indexIsValid) {
                index++;
              } else indexIsValid = true;
            });

            console.log('valid index', index)
          }

          room.commercial.push({
            index,
            user_id: newuser._id
          });

          room.save();
        }

        // email user password
        const message = `Bonjour,\n\n
        Votre compte salon de la rénovation a été créé avec succès.\n 
        Vous pouvez vous connecter ici en utilisant les identifiants suivants\n
        email: ${email}\n
        mot de passe: ${password}`;

        const html = `<p>Bonjour, <br> <br>
        Votre compte salon de la rénovation a été créé avec succès.<br>
        Vous pouvez vous connecter <a href="https://dashboard.w3dsalonvituelreno2021.fr/${ role=='coach' ? 'chat' : 'users'}"> ici</a> en utilisant les identifiants suivants:<br>
        email: <strong>${email}</strong><br>
        mot de passe: <strong>${password}</strong>`;
        /**TODO: replace test email to user email */
        console.log("sending email ....")
        await sendMail({
          from: `"Eventflow" <no-reply@event-flow.fr>`,
          email,
          subject: "SALON DE LA RENOVATION 2021 📥",
          message,
          html,
        });

        res.status(200).json({ success: true, body: newuser });
      } catch (error) {
        console.log("the error", error);
        // delete the user if its created and mail is not sent
        if (newuser && newuser._id) {
          await rooms.findOneAndUpdate(
            { user_id: req.user._id },
            {
              $pull: {
                commercial: { user_id: newuser._id },
              },
            }
          );
          await users.findByIdAndDelete(newuser._id);
        }
        return next(
          (error && error.message)
            ? new ErrorResponse(error.message, 500)
            : new ErrorResponse("Impossible d'envoyer un e-mail, l'utilisateur n'a pas été créé", 500)
        );
      }
    }
  );

  /**
   * @description Get all users
   * @route   GET  /api/users
   * @access  Private: Admin
   */
  getAll = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const asker = (req as any).user;
      let user: any = await users.find();

      if (asker && asker.role === 'admin') {
        user = await users.find({ role: { $nin: ['admin', 'superadmin'] } });
        if (user) user.push(asker);
        else user = [asker];
      } else {
        user = await users.find();
      }

      res.status(200).json({
        success: true,
        body: user,
      });
    }
  );

  /**
   * @description Get all exposant
   * @route   GET  /api/users/exposants
   * @access  Private: Admin
   */
  getAllExposant = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user: any = await users.find({ role: 'exposant' });

      res.status(200).json({
        success: true,
        body: user,
      });
    }
  );

  /**
   * @description Get all exposant
   * @route   GET  /api/users/exposants/notSet
   * @access  Private: Admin
   */
  getExposantNotSet = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const room: any = await rooms.find();
      const setUsers = room ? room.map(r => r.user_id) : [];
      const user: any = await users.find({ role: 'exposant', _id: { $nin: setUsers } });

      res.status(200).json({
        success: true,
        body: user,
      });
    }
  );

  /**
   * @description Get one user(exposant) by stand number
   * @route   GET  /api/users/stand/:standnumber
   * @access  Private: Admin
   */
  getOneByStandNumber = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const standnumber = req.params.standnumber;

      const user: any = await users.findOne({
        standNumber: standnumber,
        role: 'exposant'
      });

      res.status(200).json({
        success: true,
        body: user,
      });
    }
  );

  /**
   * @description Get one user
   * @route   GET  /api/users/:id
   * @access  Private: Admin
   */
  getOne = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const _id = req.params._id;
      
      console.log('_id', _id);
      
      const user: any = await users.findById(_id);

      res.status(200).json({
        success: true,
        body: user,
      });
    }
  );

  /**
   * @description Update on user
   * @route   POST  /api/users/:id
   * @access  Private: exposant/admin
   */
  update = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {

        const {
          email,
          companyName,
          standNumber,
          firstName,
          lastName,
          phoneNumber,
          postalCode,
        } = req.body;
        const updatedAt = Date.now();
        const _id = req.params._id;
        let password = req.body.password;

        const userEmailExists = await users.findOne({ email });
        if (userEmailExists && userEmailExists._id != _id) {
          return next(new ErrorResponse("l'email existe déjà", 400));
        }

        const user: any = await users.findByIdAndUpdate(
          _id,
          {
            email,
            companyName,
            updatedAt,
            standNumber,
            firstName,
            lastName,
            phoneNumber,
            postalCode
          },
          { new: true }
        );

        if (user && user.role === 'exposant') {
          const exposantRoom: any = await rooms
            .findOne({ user_id: _id });
          if (exposantRoom) {
            const userIds = exposantRoom.commercial ? exposantRoom.commercial.map(e => e.user_id) : []
            await users.updateMany(
              { _id: { $in: userIds } },
              [
                { $set: { companyName: user.companyName } },
                { $set: { standNumber: user.standNumber } }
              ]
            )
          }
        }

        if (user && user.role !== 'superadmin' && user.role !== 'admin' && password) {
          const salt = await bcrypt.genSalt(10);
          const passwordNotCrypted = password;
          password = await bcrypt.hash(passwordNotCrypted, salt);
          await users.findByIdAndUpdate(_id, { password });

          // email user password
          const message = `Bonjour,\n\n
Le mot de passe de votre compte salon de la rénovation a été modifié par l'administrateur.\n 
Vous pouvez vous connecter ici en utilisant les identifiants suivants\n
email: ${email}\n
mot de passe: ${passwordNotCrypted}`;

          const html = `<p>Bonjour, <br> <br>
Le mot de passe de votre compte salon de la rénovation a été modifié par l'administrateur.<br>
Vous pouvez vous connecter <a href="https://dashboard.w3dsalonvituelreno2021.fr/users"> ici</a> en utilisant les identifiants suivants:<br>
email: <strong>${email}</strong><br>
mot de passe: <strong>${passwordNotCrypted}</strong>`;
          /**TODO: replace test email to user email */
          console.log("sending email ....")
          await sendMail({
            from: `"Eventflow" <no-reply@event-flow.fr>`,
            email,
            subject: "SALON DE LA RENOVATION 2021 🔑",
            message,
            html,
          });
        }

        res.status(200).json({
          success: true,
          body: user,
        });
      } catch (error) {
        return next(
          (error && error.message)
            ? new ErrorResponse(error.message, 500)
            : new ErrorResponse("Impossible d'envoyer un e-mail, l'utilisateur n'a pas été créé", 500)
        );
      }
    }
  );

  /**
   * @description Delete on user
   * @route   DELETE  /api/users/:id
   * @access  Private: Admin/exposant
   */
  delete = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      const _id = req.params._id;
      // if user to delete is commercial remove it from room
      const userToDelete: any = await users.findById(_id);
      if (userToDelete.role === "commercial" && req.user.role === "exposant") {
        await rooms.findOneAndUpdate(
          { user_id: req.user._id },
          {
            $pull: {
              commercial: { user_id: _id },
            },
          }
        ).exec();
        console.log('remove from ', _id)
      }

      const user: any = await users.findByIdAndRemove(_id);

      res.status(200).json({
        success: true,
        body: user,
      });
    }
  );

  /**
   * @description Get commercial of a room
   * @route GET /api/users/commercial
   * @access Private: exposant
   */
  getRoomsCommercials = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      console.log('new version')

      const invalidCommercialRoomChecking: any = await rooms
        .findOne({ user_id: req.user._id });

      if (invalidCommercialRoomChecking && invalidCommercialRoomChecking.commercial) {
        const newCommercial = this.removeInArrayIfNotValidCommerial(invalidCommercialRoomChecking.commercial);
        if (Array.isArray(newCommercial) && Array.isArray(invalidCommercialRoomChecking.commercial) && newCommercial.length !== invalidCommercialRoomChecking.commercial.length) {
          console.log(`${newCommercial.length} !== ${invalidCommercialRoomChecking.commercial.length}`)
          invalidCommercialRoomChecking.commercial = newCommercial;
          invalidCommercialRoomChecking.save();
        }
      }

      const room: any = await rooms
        .findOne({ user_id: req.user._id })
        .populate({
          path: "commercial", populate: {
            path: 'user_id',
            model: 'users'
          }
        });

      let commerciaux = [];
      if (room && room.commercial) {
        commerciaux = room.commercial.map(e => e.user_id);
        if (Array.isArray(commerciaux) && commerciaux.length) {
          commerciaux = commerciaux.filter(Boolean);
        }
      }

      res.status(200).json({
        success: true,
        body: commerciaux,
      });
    }
  );

  /**
   * @description Get commercial exposant
   * @route GET /api/users/exposant
   * @access Private: exposant
   */
  getCommercialExposant = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      const exposant: any = await rooms
        .findOne({ commercial: { user_id: req.user._id } })
        .populate({ path: "user_id", model: "users" });
      console.log('exposant', exposant);
      res.status(200).json({
        success: true,
        body: exposant,
      });
    }
  );

  /**
   * @description Get all exposant
   * @route   GET  /api/unity/commercial
   */
   getCoach = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user: any = await users.find({ role: 'coach' }).limit(4);
      const commercialCoaching = []
      if(user && user.length){
        for (let i = 0; i < user.length; i++) {
          commercialCoaching.push({
            index: i+1,
            user_id: user[i]
          })
        }
      }

      res.status(200).json({
        success: true,
        body: commercialCoaching,
      });
    }
  );

  sendEmailToExposant = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      const {
        exposantEmail,
        visiteurEmail,
        subject,
        content,
      } = req.body;

      let email: any = {
        from: visiteurEmail,
        email: exposantEmail,
        subject: subject,
        message: content,
        html: content
      };
      try {
       
        console.log("sending email ....", email)
        await sendMail(email);

        res.status(200).json({ success: true, body: email });
      } catch (error) {
        console.log("the error", error);
        return next(
          (error && error.message)
            ? new ErrorResponse(error.message, 500)
            : new ErrorResponse("Impossible d'envoyer un e-mail", 500)
        );
      }
    }
  );

  removeInArrayIfNotValidCommerial(commercial) {
    let newArray = [];
    if (Array.isArray(commercial) && commercial.length) {
      commercial.forEach(e => {
        if (e.user_id && e.index) {
          newArray.push(e)
        } else {
          console.log('invalid')
        }
      });
    }
    return newArray;
  }

  /**
   * @description get coachings by date and hour
   * @route Get /api/users/coachings
   * 
   */
  getCoachings = asyncHandler( async(req: Request, res: Response, next: NextFunction) =>{
    // get date from req.body
    const coachingDate = req.body.coachingDate

    const user: any = await users.find({ coachings: { $exists: true, $ne: [] } }).select('coachings')

    if (!user) {
      return res.status(500).json({
        success: false,
        message: 'No coachings users'
      })
    }

    res.status(200).json({
      success: true,
      data: user
    })
  })
}

const userController = new UserController();

export default userController;
