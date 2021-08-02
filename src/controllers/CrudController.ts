import { Response, Request, NextFunction } from 'express';
import users from '../models/users';

class CrudController {
  constructor() {}

  table(name) {
    switch (name.toLowerCase()) {
      case 'users':
        return users;
    }
  }

  Querying = (req: Request, res: Response) => {
    let query = req.body;

    this.table(req.params.table)
      .find(query)
      .sort({ createdAt: 'desc' })
      .then((data) => {
        res.json({ success: true, body: data });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  };

  GetAll = (req: Request, res: Response) => {
    this.table(req.params.table)
      .find()
      .sort({ createdAt: 'desc' })
      .then((data) => {
        res.json({ success: true, body: data });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  };

  GetOne = (req: Request, res: Response, next?: NextFunction) => {
    this.table(req.params.table)
      .findOne({ _id: req.params._id })
      .then((data) => {
        res.json({ success: true, body: data });
      })
      .catch((err) => {
        res.json({ success: false, message: 'No elements found.' });
      });
  };

  Add = (req: any, res: Response, next?: NextFunction) => {
    this.table(req.params.table)
      .create(req.body)
      .then((body: any) => {
        res.json({ success: true, body });
      })
      .catch((e) => {
        res.json({ success: false, message: e });
      });
  };

  Update = (req: any, res: Response, next?: NextFunction) => {
    req.body.updatedAt = new Date();

    this.table(req.params.table)
      .findOneAndUpdate({ _id: req.params._id }, req.body, {
        new: true,
        upsert: true,
      })
      .then((data) => {
        res.json({ success: true, body: data });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  };

  Delete = (req: Request, res: Response, next?: NextFunction) => {
    this.table(req.params.table)
      .deleteOne({ _id: req.params._id })
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  };

  Count = (req: Request, res: Response) => {
    this.table(req.params.table)
      .countDocuments()
      .then((count: any) => {
        res.json({ success: true, body: count });
      })
      .catch((err) => {
        res.json({ success: false, message: err });
      });
  };
}

export default new CrudController();
