import * as crypto from "crypto";
import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares";
import { ErrorResponse, sendMail } from "../utils";
import * as jwt from "jsonwebtoken";
import config from "../environments";
import users from "../models/users";
import * as generator from "generate-password";
class AuthenticationController {
  constructor() {}

  /**
   * @description Create new user
   * @route   POST  /api/auth/register
   * @access  Public
   */
  register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { 
        lastName , 
        firstName, 
        email, 
        phoneNumber, 
        postalCode, 
        projects, 
        conferences,
        coachings, 
        regReason  
      } = req.body;

      // check if user already exists
      const userEmailExists = await users.findOne({ email });
      if (userEmailExists) {
        return next(new ErrorResponse("Vous avez déjà un compte avec cet email", 400));
      }

      const password = generator.generate({
        length: 12,
        numbers: true,
      });

      const user: any = await users.create({
        lastName,
        firstName,
        email,
        phoneNumber,
        postalCode,
        projects,
        conferences,
        coachings,
        regReason,
        password,
      });
      
      // generate user password and email it
      try {
        const message = `Bonjour,\n\n
        Nous sommes ravis de vous compter parmi nous pour le Salon de la Rénovation!\n\n
        Votre compte a été créé avec succès.\n 
        Vous pourrez vous connecter du 07 au 16 Mai 2021 entre 10h et 19h en utilisant les identifiants suivants:\n
        email: ${email}\n
        mot de passe: ${password}\n\n
        A très bientôt,\n
        L'équipe du Salon`;

        const html = `<p>Bonjour, <br> <br>
        Nous sommes ravis de vous compter parmi nous pour le Salon de la Rénovation!<br><br>
        Votre compte a été créé avec succès.<br>
        Vous pourrez vous connecter <a href="https://www.w3dsalonvituelreno2021.fr"> ici</a> du 07 au 16 Mai 2021 entre 10h et 19h en utilisant les identifiants suivants:<br>
        email: <strong>${email}</strong><br>
        mot de passe: <strong>${password}</strong><br> <br>
        <strong>A très bientôt,</strong><br>
        <strong>L'équipe du salon</strong>`;

        console.log("sending email ....")
        await sendMail({          
          from: `"Eventflow" <no-reply@event-flow.fr>`,
          email,
          subject: "SALON DE LA RENOVATION - VOTRE ACCES  📥",
          message,
          html,
        });
      } catch (error) {
        if (user && user._id) {
          await users.findByIdAndDelete(user._id);
        }
        return next(
          new ErrorResponse(
            "Une erreur s'est produite pendant la création de votre compte, Veuillez réessayer plus tard",
            500
          )
        );
      }
      
      res.status(200).json({
        success: true,
        message: "Votre compte a été créé avec succès, Vous allez recevoir un email pour vos identifiants"
      })
    }
  );

  /**
   * @description contact us
   * @route   POST  /api/auth/contact
   * @access  Public
   */
  contact = asyncHandler( async (req: Request, res: Response, next: NextFunction) => {
    const { nom, prenom, role, email, message } = req.body

    // send email to eventflow
    try {
      const emailMessage = `Bonjour,\n\n
        Vous avez un nouveau message concernant le salon de la renovation.\n\n
        Nom: ${nom}\n
        Prénom: ${prenom}\n
        Email: ${email}\n
        Type: ${role}\n\n
        Message: ${message}
        `;

        const html = `<p>Bonjour, <br> <br>
        Vous avez un nouveau message concernant le salon de la renovation.<br><br>
        <strong>Nom</strong>: ${nom}<br>
        <strong>Prénom</strong>: ${prenom}<br>
        <strong>Email</strong>: ${email}<br>
        <strong>Type</strong>: ${role}<br><br>
        <strong>Message</strong>: ${message}
        `;
        console.log("sending email ....")
        /**TODO: replace test email avec contact@eventflow.fr */
        await sendMail({
          from: `"SALON DE LA RENOVATION" <no-reply@salonvirtuel.fr>`,
          email: 'contact@eventflow.fr',
          subject: "SALON DE LA RENOVATION - NOUVEAU MESSAGE 📥",
          message: emailMessage,
          html,
        });
      
    } catch (error) {
      console.log("MAIL ERROR", error)
      return next(
        new ErrorResponse(
          "Une erreur s'est produite pendant l'envoi du message. Veuillez réessayer plus tard",
          500
        )
      );
    }
    res.status(200).json({
      
      success: true,
      message: "Votre message a bien été envoyé avec succès. Nous allons revenir vers vous des que possible"
    })
  })

  /**
   * @description get new access token before upload
   * @route   GET  /api/auth/newAccessToken
   */
   getNewAccessToken = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const accessToken = user.generateAccessToken('2h');
     
      res.status(200).json({
        success: true,
        accessToken
      });
    }
  );

  /**
   * @description login user
   * @route POST /api/auth/login
   * @access Public
   */
  login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      // validate email and password
      if (!email || !password) {
        return next(new ErrorResponse("Veuillez inserer votre adresse email et mot de passe", 400));
      }

      // check for user
      const user: any = await users.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorResponse("Adresse email ou mot de passe invalide", 401));
      }

      // match password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return next(new ErrorResponse("Adresse email ou mot de passe invalide", 401));
      }
      user.connected = true;
      await user.save({ validateBeforeSave: false });

      this.sendTokenResponse(user, 200, res);
    }
  );

  /**
   * @description refresh user token
   * @route POST /api/auth/refreshtoken
   * @access Private: authenticated
   */
  refreshToken = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
      // get refresh token from cookie
      const currentRefreshToken = req.body.refreshToken;
      if (!currentRefreshToken) {
        return next(new ErrorResponse("No refresh token found", 400));
      }

      const decoded = await jwt.decode(currentRefreshToken);
      const user: any = await users.findById(decoded._id).select("+password");

      // const refreshSecret = `${config.REFRESH_TOKEN_SECRET}${user.password}`;
      // console.log("user", user)
      // console.log("currentRef", currentRefreshToken)
      // console.log("refSec", refreshSecret)
      console.log("verif refresh token....")
      await jwt.verify(currentRefreshToken, config.REFRESH_TOKEN_SECRET);
      console.log("verif ok....")

      this.sendTokenResponse(user, 200, res);
    }
  );

  /**
   * @description logout user
   * @route POST /api/auth/logout
   * @access Private: authenticated
   */
  logout = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      console.log("request body",req.body)
      const user: any = await users.findById(req.body._id);
      if (user) {
        user.connected = false;
        await user.save({ validateBeforeSave: false });
      }
      res.status(200).json({
        success: true,
        message: "user logged out!",
      });
    }
  );

  /**
   * @description forgot password
   * @route POST /api/auth/forgotpassword
   * @access Public
   */
  forgotPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const user: any = await users.findOne({ email: req.body.email });

      if (!user) {
        return next(new ErrorResponse("Utilisateur non trouvé", 404));
      }
      // get reset token
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      // TODO: change reset url to client reset password path
      const resetUrl = `https://dashboard.w3dsalonvituelreno2021.fr/#/reset-user-password/${resetToken}`;

      const message = `Bonjour,\n\n
      Vous recevez cet email parce que vous (ou une autre personne) avez demandé à réinitialiser le mot de passe de votre compte salon de la rénovation.<br>
      Veuillez le réinitialiser en cliquant ici.
      \n\n`;

      const html = `<p>Bonjour, <br> <br>
      Vous recevez cet email parce que vous (ou une autre personne) avez demandé à réinitialiser le mot de passe de votre compte salon de la rénovation.<br>
      Veuillez le réinitialiser <a href="${resetUrl}"> en cliquant ici</a>.</p>
      <br>`;

      try {
        await sendMail({
          from: `"Eventflow" <no-reply@event-flow.fr>`,
          email: user.email,
          subject: "SALON DE LA RENOVATION - Réinitialisation du mot de passe 🔑",
          message,
          html,
        });

        res.status(200).json({
          success: true,
          message: "email sent",
        });
      } catch (error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse("Le mail n'a pas pu être envoyé", 500));
      }
    }
  );

  /**
   * @description reset user password
   * @route PUT /api/auth/resetpassword/:resettoken
   * @access Private
   */
  resetPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      // get hashed token
      const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resettoken)
        .digest("hex");

      console.log('date reset', Date.now());
        
      
      const user: any = await users.findOne({
        resetPasswordToken
        // resetPasswordExpire: { $gt: Date.now() },
      });

      console.log('resetPasswordToken', resetPasswordToken);
      console.log('user', user);

      if (!user) {
        return next(new ErrorResponse(`
        Session invalide (la réinitialisation du mot de passe n\'est plus valable 10 minutes après la réception de l\'email)
        `, 400));
      }

      // set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false});

      res.status(200).json({
        success: true,
        message: "Mot de passe mis à jour",
      })
    }
  );

  /**
   * @description function to send token and user info
   * @param user user model
   * @param statusCode  status code
   * @param res express response object
   * @param refresh boolean value to check if refresh token
   */
  sendTokenResponse = (user: any, statusCode: number, res: Response) => {
    // generate token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const body = {
      _id: user._id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      active: user.active,
    };

    res.status(statusCode).json({
      success: true,
      body,
      accessToken,
      refreshToken,
    });
  };
}

const authenticationController = new AuthenticationController();

export default authenticationController;
