import { Response, Request, NextFunction } from 'express';
import { asyncHandler } from '../middlewares';
import dashboarddata from '../models/dashboarddata';
import assets from '../models/assets';
import users from '../models/users';

class DashBoardController {
    constructor() { }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    substractUntilZero(num) {
        let visits: number[] = []
        const numIni7 = num / 30;
        for (let i = 0; i < 20; i++) {
            if (num > 0) {
                let nb = Math.floor(this.getRandomArbitrary(10, numIni7))
                visits.push(nb)
                num = num - nb
            }
        }
        if (num > 0) {
            while (num > 0) {
                let nb = Math.floor(this.getRandomArbitrary(10, numIni7))
                let ind = Math.floor(Math.random() * 12)
                visits[ind] = visits[ind] + nb
                num = num - nb
                if (num < 0) visits[ind] = visits[ind] - num
            }
        }
        return visits
    }

    shuffle(data: any) {
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
        }
        return data;
    }

    Default(req: Request, res: Response): void {
        res.end("Actions controller works.");
    }

    generateDashboardActions = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            let allContent: any = await assets.find().populate('idExposant');
            const visitByAssets: any = [];
            allContent.forEach(async (e, i) => {
                const visit = Math.floor(this.getRandomArbitrary(1500, 2500))

                // DAYS
                const v7 = Math.floor(visit / 7)
                const ed1 = Math.floor(Math.random() * 80);
                const ed3 = Math.floor(Math.random() * 100);
                const ed5 = Math.floor(Math.random() * 60);
                const ed6 = Math.floor(Math.random() * 10);
                const ds = [v7 + ed1, v7 - ed1, v7 + ed3, v7 + ed5, v7 - ed3, v7 - ed5 - ed6, v7 + ed6]
                const dsSuffled = this.shuffle(ds)

                // HOURS
                const arrayOfVisits = this.substractUntilZero(visit);

                //AGES
                const v6 = Math.floor(visit / 6);
                const aed1 = Math.floor(Math.random() * 60);
                const aed3 = Math.floor(Math.random() * 110);
                const aed5 = Math.floor(Math.random() * 90);
                const ads = [v6 + aed1, v6 - aed1, v6 + aed3, v6 + aed5, v6 - aed3, v6 - aed5];
                const aadsSuffled = this.shuffle(ads);
                const arrayType = ["Stand", "Video", "Galerie", "Flyer", "Chat"];
                const typeIndex = Math.floor(Math.random() * arrayType.length);

                const obj = {
                    assetId: e._id,
                    assetType: "Stand",
                    exposantId: e.idExposant._id,
                    exposantName: `${e.idExposant.firstName} ${e.idExposant.lastName}`,
                    hours: {
                        5: arrayOfVisits[17], 6: arrayOfVisits[18], 7: arrayOfVisits[19], 8: arrayOfVisits[0], 9: arrayOfVisits[1],
                        10: arrayOfVisits[3], 11: arrayOfVisits[4], 12: arrayOfVisits[5], 13: arrayOfVisits[6], 14: arrayOfVisits[7],
                        15: arrayOfVisits[8], 16: arrayOfVisits[9], 17: arrayOfVisits[10], 18: arrayOfVisits[11], 19: arrayOfVisits[12],
                        20: arrayOfVisits[13], 21: arrayOfVisits[14], 22: arrayOfVisits[15], 23: arrayOfVisits[16],
                    },
                    days: {
                        1: dsSuffled[0], 2: dsSuffled[1], 3: dsSuffled[2], 4: dsSuffled[3], 5: dsSuffled[4], 6: dsSuffled[5], 7: dsSuffled[6]
                    },
                    ages: {
                        30: aadsSuffled[0], 3040: aadsSuffled[1], 4045: aadsSuffled[2], 4550: aadsSuffled[3], 5055: aadsSuffled[4], 55: aadsSuffled[5],
                    },
                    visit: visit,
                    visitTime: Math.floor(Math.random() * 60),
                }
                visitByAssets.push(obj);
                await dashboarddata.create(obj);
                console.log('i', i);

            });
            res.status(200).json({
                visitByAssets
            });
        }
    );

    visitByAssetType = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const allAssets: any = await dashboarddata.find()
            const flyerCount = allAssets.filter(e => e.assetType == 'Flyer').reduce((accum, item) => accum + item.visit, 0)
            const videoCount = allAssets.filter(e => e.assetType == 'Video').reduce((accum, item) => accum + item.visit, 0)
            const galerieCount = allAssets.filter(e => e.assetType == 'Galerie').reduce((accum, item) => accum + item.visit, 0)
            const chatCount = allAssets.filter(e => e.assetType == 'Chat').reduce((accum, item) => accum + item.visit, 0)

            res.status(200).send({
                flyerCount,
                videoCount,
                galerieCount,
                chatCount
            });
        }
    );

    visitByAsset = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const visitByAssets = await dashboarddata.find({ assetType: 'Stand' })

            res.status(200).send({
                visitByAssets
            });
        }
    );

    visitTimeByExposant = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const visitTimeByExposant: any = await dashboarddata.aggregate([
                {
                    $group: {
                        _id: "$exposantName",
                        visitTime: { $sum: "$visitTime" }
                    }
                }
            ])
            res.status(200).send({
                visitTimeByExposant
            });
        }
    );

    visitByAges = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const visitByAges: any = await dashboarddata.find().select('ages')
            const a30 = visitByAges.reduce((accum, item) => accum + item.ages[0]["30"], 0)
            const a3040 = visitByAges.reduce((accum, item) => accum + item.ages[0]["3040"], 0)
            const a4045 = visitByAges.reduce((accum, item) => accum + item.ages[0]["4045"], 0)
            const a4550 = visitByAges.reduce((accum, item) => accum + item.ages[0]["4550"], 0)
            const a5055 = visitByAges.reduce((accum, item) => accum + item.ages[0]["5055"], 0)
            const a55 = visitByAges.reduce((accum, item) => accum + item.ages[0]["55"], 0)

            res.status(200).send({
                a30,
                a3040,
                a4045,
                a4550,
                a5055,
                a55
            });
        }
    );

    visitByAssetsPerHours = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const visitPerHours: any = await dashboarddata.find().select('hours')
            const sumSameProperties = [visitPerHours.map(e => e.hours[0]).reduce((acc, n) => {
                for (var prop in n) {
                    if (acc.hasOwnProperty(prop)) acc[prop] += n[prop];
                    else acc[prop] = n[prop];
                }
                return acc;
            }, {})]
            res.status(200).send({
                visitPerHours: sumSameProperties
            });
        }
    );

    visitAssetTypeByAges = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const visitByAges: any = await dashboarddata.find().select('ages assetType')
            let filtered = visitByAges.filter(e => e.assetType == 'Flyer')
            const flyer = {
                a30: filtered.reduce((accum, item) => accum + item.ages[0]["30"], 0),
                a3040: filtered.reduce((accum, item) => accum + item.ages[0]["3040"], 0),
                a4045: filtered.reduce((accum, item) => accum + item.ages[0]["4045"], 0),
                a4550: filtered.reduce((accum, item) => accum + item.ages[0]["4550"], 0),
                a5055: filtered.reduce((accum, item) => accum + item.ages[0]["5055"], 0),
                a55: filtered.reduce((accum, item) => accum + item.ages[0]["55"], 0)
            }
            filtered = visitByAges.filter(e => e.assetType == 'Video')
            const video = {
                a30: filtered.reduce((accum, item) => accum + item.ages[0]["30"], 0),
                a3040: filtered.reduce((accum, item) => accum + item.ages[0]["3040"], 0),
                a4045: filtered.reduce((accum, item) => accum + item.ages[0]["4045"], 0),
                a4550: filtered.reduce((accum, item) => accum + item.ages[0]["4550"], 0),
                a5055: filtered.reduce((accum, item) => accum + item.ages[0]["5055"], 0),
                a55: filtered.reduce((accum, item) => accum + item.ages[0]["55"], 0)
            }
            filtered = visitByAges.filter(e => e.assetType == 'Galerie')
            const galerie = {
                a30: filtered.reduce((accum, item) => accum + item.ages[0]["30"], 0),
                a3040: filtered.reduce((accum, item) => accum + item.ages[0]["3040"], 0),
                a4045: filtered.reduce((accum, item) => accum + item.ages[0]["4045"], 0),
                a4550: filtered.reduce((accum, item) => accum + item.ages[0]["4550"], 0),
                a5055: filtered.reduce((accum, item) => accum + item.ages[0]["5055"], 0),
                a55: filtered.reduce((accum, item) => accum + item.ages[0]["55"], 0)
            }
            filtered = visitByAges.filter(e => e.assetType == 'chat')
            const chat = {
                a30: filtered.reduce((accum, item) => accum + item.ages[0]["30"], 0),
                a3040: filtered.reduce((accum, item) => accum + item.ages[0]["3040"], 0),
                a4045: filtered.reduce((accum, item) => accum + item.ages[0]["4045"], 0),
                a4550: filtered.reduce((accum, item) => accum + item.ages[0]["4550"], 0),
                a5055: filtered.reduce((accum, item) => accum + item.ages[0]["5055"], 0),
                a55: filtered.reduce((accum, item) => accum + item.ages[0]["55"], 0)
            }

            res.status(200).send({
                flyer,
                galerie,
                video,
                chat
            });
        }
    );

    visitAssetPerDays = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const visitPerDays: any = await dashboarddata.find({ assetType: { $ne: 'Stand' } }).select('days')
            const sumSameProperties = [visitPerDays.map(e => e.days[0]).reduce((acc, n) => {
                for (var prop in n) {
                    if (acc.hasOwnProperty(prop)) acc[prop] += n[prop];
                    else acc[prop] = n[prop];
                }
                return acc;
            }, {})]

            res.status(200).send({
                visitPerDays: sumSameProperties
            });
        }
    );

    usersByAge = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const a30 = await users.find({ birthDate: { $gt: '1996-01-01' } }).count();
                const a3040 = await users.find({ birthDate: { $lte: '1996-01-01', $gt: '1981-01-01' } }).count();
                const a4045 = await users.find({ birthDate: { $lte: '1981-01-01', $gt: '1976-01-01' } }).count();
                const a4550 = await users.find({ birthDate: { $lte: '1976-01-01', $gt: '1971-01-01' } }).count();
                const a5055 = await users.find({ birthDate: { $lte: '1971-01-01', $gt: '1966-01-01' } }).count();
                const a55 = await users.find({ birthDate: { $lte: '1966-01-01' } }).count();
                return res.status(200).json({
                    a30,
                    a3040,
                    a4045,
                    a4550,
                    a5055,
                    a55,
                })
            } catch (err) {
                return res.status(500).json({ message: err.message });
            }
        }
    );

    usersByAgeByGender = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const a30m = await users.find({ birthDate: { $gt: '1996-01-01' }, gender: 'male' }).count();
                const a3040m = await users.find({ birthDate: { $lte: '1996-01-01', $gt: '1981-01-01' }, gender: 'male' }).count();
                const a4045m = await users.find({ birthDate: { $lte: '1981-01-01', $gt: '1976-01-01' }, gender: 'male' }).count();
                const a4550m = await users.find({ birthDate: { $lte: '1976-01-01', $gt: '1971-01-01' }, gender: 'male' }).count();
                const a5055m = await users.find({ birthDate: { $lte: '1971-01-01', $gt: '1966-01-01' }, gender: 'male' }).count();
                const a55m = await users.find({ birthDate: { $lte: '1966-01-01' }, gender: 'male' }).count();

                const a30f = await users.find({ birthDate: { $gt: '1996-01-01' }, gender: 'female' }).count();
                const a3040f = await users.find({ birthDate: { $lte: '1996-01-01', $gt: '1981-01-01' }, gender: 'female' }).count();
                const a4045f = await users.find({ birthDate: { $lte: '1981-01-01', $gt: '1976-01-01' }, gender: 'female' }).count();
                const a4550f = await users.find({ birthDate: { $lte: '1976-01-01', $gt: '1971-01-01' }, gender: 'female' }).count();
                const a5055f = await users.find({ birthDate: { $lte: '1971-01-01', $gt: '1966-01-01' }, gender: 'female' }).count();
                const a55f = await users.find({ birthDate: { $lte: '1966-01-01' }, gender: 'female' }).count();

                const a30o = await users.find({ birthDate: { $gt: '1996-01-01' }, gender: 'other' }).count();
                const a3040o = await users.find({ birthDate: { $lte: '1996-01-01', $gt: '1981-01-01' }, gender: 'other' }).count();
                const a4045o = await users.find({ birthDate: { $lte: '1981-01-01', $gt: '1976-01-01' }, gender: 'other' }).count();
                const a4550o = await users.find({ birthDate: { $lte: '1976-01-01', $gt: '1971-01-01' }, gender: 'other' }).count();
                const a5055o = await users.find({ birthDate: { $lte: '1971-01-01', $gt: '1966-01-01' }, gender: 'other' }).count();
                const a55o = await users.find({ birthDate: { $lte: '1966-01-01' }, gender: 'other' }).count();

                return res.status(200).json({
                    male: {
                        a30: a30m,
                        a3040: a3040m,
                        a4045: a4045m,
                        a4550: a4550m,
                        a5055: a5055m,
                        a55: a55m
                    },
                    female: {
                        a30: a30f,
                        a3040: a3040f,
                        a4045: a4045f,
                        a4550: a4550f,
                        a5055: a5055f,
                        a55: a55f
                    },
                    other: {
                        a30: a30o,
                        a3040: a3040o,
                        a4045: a4045o,
                        a4550: a4550o,
                        a5055: a5055o,
                        a55: a55o
                    },
                })
            } catch (err) {
                return res.status(500).json({ message: err.message });
            }
        }
    );

    getActions = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const data = await dashboarddata.find();

            res.status(200).json({
                success: true,
                body: data,
            });
        }
    );

    addAction = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const action = await dashboarddata.create(req.body);

            res.status(200).json({
                success: true,
                body: action,
            });
        }
    );

    updateAction = asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const actionValues: any = await dashboarddata.findOne({ _id: req.params._id })
            const values = actionValues.action

            const action = await dashboarddata.findByIdAndUpdate(req.params._id, {
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

export default new DashBoardController();