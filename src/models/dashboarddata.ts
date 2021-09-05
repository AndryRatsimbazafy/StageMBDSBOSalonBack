import * as mongoose from 'mongoose';

let Schema = mongoose.Schema

let DashboardDataSchema = new Schema({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: "assets",
        required: false
    },
    exposantId: {
        type: Schema.Types.ObjectId,
        ref: "assets",
        required: false
    },
    exposantName: {
        type: String,
        trim: true,
        required: false,
    },
    assetType: {
        type: String,
        trim: true,
        required: false,
    },
    hours: {
        type: Array,
        required: false
    },
    days: {
        type: Array,
        required: false
    },
    ages: {
        type: Array,
        required: false
    },
    visit: {
        type: Number,
        required: false,
    },
    visitTime: {
        type: Number,
        required: false,
    }
}, { _id: true });

export default mongoose.model('dashboarddata', DashboardDataSchema)