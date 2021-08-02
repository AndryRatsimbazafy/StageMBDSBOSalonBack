import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../middlewares";
import timer from "../models/timer";
import { ErrorResponse, sendMail } from "../utils";

class TimerController {
    constructor() { }

    post = asyncHandler(
        async (req: any, res: Response, next: NextFunction) => {
            const {
                start,
                end
            } = req.body;

            let newtimer: any;
            try {
                newtimer = await timer.updateOne({ 'identity': "timer" }, {
                    start,
                    end
                }, {
                    new: true,
                });
                console.log("newtimer", newtimer);

                res.status(200).json({ success: true, body: newtimer });
            } catch (error) {
                console.log("the error", error);
                return next(
                    (error && error.message)
                        ? new ErrorResponse(error.message, 500)
                        : new ErrorResponse("Timer not found", 500)
                );
            }
        }
    );

    get = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            let timers: any = await timer.find({ 'identity': "timer" });
            console.log('timers', timers);

            timers = timers ? timers[0] : undefined
            res.status(200).json({
                success: true,
                body: timers,
            });
        }
    );
}

const timerController = new TimerController();

export default timerController;
