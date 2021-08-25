import { Response, Request, NextFunction } from 'express';
import { asyncHandler } from '../middlewares';
import actions from '../models/actions';

class ActionsController {
    constructor() { }

    Default(req: Request, res: Response): void {
        res.end("Actions controller works.");
    }

    getActions = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await actions.find();

            res.status(200).json({
                success: true,
                body: data,
            });
        }
    );

    addAction = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const action = await actions.create(req.body);

            res.status(200).json({
                success: true,
                body: action,
            });
        }
    );

    updateAction = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const actionValues: any = await actions.findOne({ _id: req.params._id })
            const values = actionValues.action

            const action = await actions.findByIdAndUpdate(req.params._id, {
                content: {
                    ...values,
                    ...req.body
                }
            }, {
                new: true
            })

            res.status(200).json({
                success: true,
                body: action,
            });
        }
    );
}

export default new ActionsController();