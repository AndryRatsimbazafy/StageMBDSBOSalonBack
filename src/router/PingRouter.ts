import { Router } from 'express';
import {exec} from 'child_process';

class PingRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.get('/', (req, res) => {
            res.status(200).send('pong V 0.1 ...')
        })
    }
}

export default  new PingRouter().router;
