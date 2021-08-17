import * as nodemailer from "nodemailer";
import { google } from "googleapis";
import config from "../environments";

const sendMail = async (options: any) => {
  
  // -------Use domain transporter instead of gmail-----------

  // const oAuth2Client = new google.auth.OAuth2(
  //   config.GMAIL_CLIENT_ID,
  //   config.GMAIL_CLIENT_SECRET,
  //   config.GMAIL_REDIRECT_URI
  // );
  // oAuth2Client.setCredentials({ refresh_token: config.GMAIL_REFRESH_TOKEN });

  // const accessToken = await oAuth2Client.getAccessToken();
  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   auth: {
  //     type: "OAuth2",
  //     user: config.GMAIL_USER,
  //     clientId: config.GMAIL_CLIENT_ID,
  //     clientSecret: config.GMAIL_CLIENT_SECRET,
  //     refreshToken: config.GMAIL_REFRESH_TOKEN,
  //     accessToken,
  //   },
  // });

  // let transporter = nodemailer.createTransport({
  //   host: "srv.w-3d.eu",
  //   port: 465,
  //   secure: true, // true for 465, false for other ports
  //   auth: {
  //     user: "ainga.ramangalahy@dynamfactory.com",
  //     pass: "i~J79z0c",
  //   },
  // });
  let transporter = nodemailer.createTransport({
    host: "srv.w3dsalonvituelreno2021.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "no-reply@event-flow.fr",
      pass: "c5%e3gO2",
    },
  });

  // send mail with defined transport object
  //`"SALON DE LA RENOVATION" <contact@eventflow.fr>`
  const message = {
    from: options.from, // sender address
    to: "tpatrick817@gmail.com", // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
    html: options.html, // html body
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

export {
    sendMail
}
