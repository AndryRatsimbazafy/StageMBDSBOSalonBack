const _  = require('lodash');
module.exports = (name) => {
    return `
import { Response, Request } from 'express';

class ${_.capitalize(name)}Controller {
    constructor() {}

    Default(req: Request, res: Response): void {
        res.end('${_.capitalize(name)} controller works.');
    }
}
export default new ${_.capitalize(name)}Controller();
`
}