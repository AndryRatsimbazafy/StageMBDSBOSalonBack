import { Router } from 'express';
import CrudController from '../controllers/CrudController';

class CrudRouter {

    router: Router;

    constructor(){
        this.router = Router();
        this.routes();
    }

    routes(){
        this.router.post('/:table/add', CrudController.Add) //Create
        this.router.post('/:table/query', CrudController.Querying) //Querying
        this.router.get('/:table/count', CrudController.Count)
        this.router.get('/:table', CrudController.GetAll)
        this.router.get('/:table/:_id', CrudController.GetOne) //Read
        this.router.put('/:table/:_id', CrudController.Update) //Update
        this.router.delete('/:table/:_id', CrudController.Delete) //Delete
    }
}

export default  new CrudRouter().router;