
import { Response, Request, NextFunction } from 'express';
import { asyncHandler } from '../middlewares';
import contents from '../models/contents';

class ContentsController {
  constructor() {}

  Default(req: Request, res: Response): void {
    res.end("Contents controller works.");
  }

  getContents = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = await contents.find();

      res.status(200).json({
        success: true,
        body: data,
      });
    }
  );

  addContent = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const content = await contents.create(req.body);

      res.status(200).json({
        success: true,
        body: content,
      });
    }
  );

  updateContent = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const contentValues: any = await contents.findOne({_id: req.params._id})
      const values = contentValues.content
      
      const content = await contents.findByIdAndUpdate(req.params._id, {
        content: {
          ...values,
          ...req.body
        }
      }, {
          new: true
      })

      res.status(200).json({
        success: true,
        body: content,
      });
    }
  );
}
export default new ContentsController();
