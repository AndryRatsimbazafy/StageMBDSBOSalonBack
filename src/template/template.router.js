const _  = require('lodash');
module.exports = (name) => {
    return `
import { Router } from 'express';
import ${_.capitalize(name)}Controller from '../controllers/${_.capitalize(name)}Controller';

class ${_.capitalize(name)}Router {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.get('*', ${_.capitalize(name)}Controller.Default)
    }
}

export default  new ${_.capitalize(name)}Router().router;
`
}