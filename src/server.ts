import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as morgan from 'morgan'
import * as chalk from 'chalk';
import * as busboy from 'connect-busboy';


import { swaggerDocs } from './utils';
import * as swaggerUi from 'swagger-ui-express';

import config from "./environments";

import CrudRouter from './router/CrudRouter';
import MainRouter from './router/MainRouter';
import UploadRouter from './router/UploadRouter';
import UserRouter from './router/UserRouter';
import AssetsRouter from './router/AssetsRouter';
import RoomsRouter from './router/RoomsRouter';
import AuthenticationRouter from './router/AuthenticationRouter';
import ContentsRouter from './router/ContentsRouter';
import UnityRouter from './router/UnityRouter';
import WebhookRouter from "./router/WebhookRouter";
import PingRouter from './router/PingRouter';

// Server class
class Server {

    public app: express.Application;

    constructor() {
        this.app = express()
        this.config()
    }

    public config() {
        // set up mongoose
        console.log('Connecting to DB....')
        mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
            .then(() => console.log('Dabatase connected.'))
            .catch((e) => console.log('Error connection db.', e))
        mongoose.set('useFindAndModify', false);
        mongoose.pluralize(null);

        // config
        this.app.use(bodyParser.json({ limit: '8000mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '8000mb', extended: true }));
        this.app.use(cors())
        // using busboy for streaming parser for upload
        this.app.use(busboy({
            highWaterMark: 10 * 1024 * 1024, // Set 10MiB buffer
        }))
        // this.app.use(express.static(path.join(__dirname, 'angular-fo')))
        this.app.use('/public', express.static(path.join(process.cwd(), 'public')))
        this.app.use(express.static(path.join(process.cwd(), 'angular-bo')))
    }

    public routes(): void {
        

        this.app.use('/api/auth', AuthenticationRouter)
        this.app.use('/api/crud', CrudRouter)
        this.app.use('/api/upload', UploadRouter)
        this.app.use('/api/users', UserRouter)
        this.app.use('/api/assets', AssetsRouter)
        this.app.use('/api/unity', UnityRouter)
        this.app.use('/api/rooms', RoomsRouter)
        this.app.use('/api/contents', ContentsRouter)
        //api documentation route
        this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

        this.app.use('/webhook', WebhookRouter)
        this.app.use('/ping', PingRouter)
        this.app.use('/', MainRouter)


    }
}

export default new Server();
