import * as mongoose from 'mongoose';

let Schema = mongoose.Schema

let TimerSchema = new Schema({
    start: {
        type: String,
        required: true,
        trim: true
    },
    end: {
        type: String,
        required: true,
        trim: true
    },
    identity: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: true });

export default mongoose.model('timers', TimerSchema)