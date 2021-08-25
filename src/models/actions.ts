import * as mongoose from 'mongoose';

let Schema = mongoose.Schema

let ActionsSchema = new Schema({
    idUser: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
        trim: true
    },
    idAssets: {
        type: Schema.Types.ObjectId,
        ref: "assets",
        required: true,
        trim: true
    },
    contentType: {
        type: String,
        trim: true
    },
    contentUrl: {
        type: String,
        trim: true
    },
    startDate: { 
      type: Date, 
      default: Date.now 
    },
    endDate: { 
      type: Date, 
      required: false 
    }

}, { _id: true });

export default mongoose.model('assets', ActionsSchema)