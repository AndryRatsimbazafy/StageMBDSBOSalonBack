import * as mongoose from 'mongoose';

let Schema = mongoose.Schema

let AssetsSchema = new Schema({
    idExposant: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true,
        trim: true
    },
    logo: {
        type: String,
        trim: true
    },
    videos: {
        type: [{
            index: Number,
            name: String
        }],
    },
    flyers: {
        type: [String]
    },
    gallery: {
        type: [String]
    },
    model3D: {
        type: String,
        trim: true
    },
    gameObjectId: {
        type: String
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

export default mongoose.model('assets', AssetsSchema)