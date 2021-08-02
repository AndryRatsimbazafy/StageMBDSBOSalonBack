import { Router } from 'express';
import {exec} from 'child_process';

class WebhookRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.post('/', (req, res) => {
            exec(`bash ${process.cwd()}/update.sh`, (error, stdout, stderr) => {
                res.status(200).send('OK')
            })
        })
    }
}

export default  new WebhookRouter().router;
