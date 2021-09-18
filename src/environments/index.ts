
import * as path from 'path';
import * as dotenv from 'dotenv';

console.log("NODE_ENV=>",process.env.NODE_ENV)

dotenv.config({ path: path.resolve(__dirname, `${process.env.NODE_ENV || 'production'}.env`)});

export default {
    APP_PORT: process.env["APP_PORT"] ,
    APP_HOST: process.env["APP_HOST"],
    MONGODB_URI: process.env["MONGODB_URI"],
    ACCESS_TOKEN_SECRET: process.env["ACCESS_TOKEN_SECRET"],
    REFRESH_TOKEN_SECRET: process.env["REFRESH_TOKEN_SECRET"],
    GMAIL_CLIENT_ID: process.env["GMAIL_CLIENT_ID"],
    GMAIL_CLIENT_SECRET: process.env["GMAIL_CLIENT_SECRET"],
    GMAIL_REDIRECT_URI: process.env["GMAIL_REDIRECT_URI"],
    GMAIL_REFRESH_TOKEN: process.env["GMAIL_REFRESH_TOKEN"],
    GMAIL_FROM_NAME: process.env["GMAIL_FROM_NAME"],
    GMAIL_FROM_EMAIL: process.env["GMAIL_FROM_EMAIL"],
    GMAIL_USER: process.env["GMAIL_USER"],
    SWAGGER_API_URI: process.env["SWAGGER_API_URI"]
} 
