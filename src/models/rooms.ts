import * as mongoose from 'mongoose';

let Schema = mongoose.Schema

let RoomsSchema = new Schema({
    commercial: {
        type: [{
            index: Number,
            user_id: {
                type: Schema.Types.ObjectId,
                ref: "users",
            }
        }],
        required: false
    },
    visio: {
        type: String,
        required: false,
        trim: true
    },
    color: {
        type: String,
        required: false,
        trim: true
    },
    // statistic_visitor: {
    //     type: Number,
    //     required: true
    // },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: false
    },
    type: {
        _id: Schema.Types.ObjectId,
        name: String,
        url: String,
    },
    variant: {
        _id: Schema.Types.ObjectId,
        name: String,
        url: String
    },
    mob: {
        _id: Schema.Types.ObjectId,
        name: String,
        url: String,
    },
    characters: [
        {
            _id: Schema.Types.ObjectId,
            name: String,
            url: String,
        }
    ],
    visitors: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "users",
        }],
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        required: false
    }

}, { _id: true });

export default mongoose.model('rooms', RoomsSchema)
