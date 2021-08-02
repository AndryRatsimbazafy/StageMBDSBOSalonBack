
import * as mongoose from 'mongoose';

const Schema = mongoose.Schema
let ContentsSchema = new Schema({
    content: {
        types: [
            {
                name: String,
                url: String,
                maxPersonnage: Number,
                maxEcran: Number,
            }
        ],
        variantes: [
            {
                idTypes: String,
                name: String,
                url: String,
                videoPreviewUrl: String
            }
        ],
        mob: [
            {
                idTypes: String,
                name: String,
                url: String,
            }
        ],
        personnages: [
            {
                name: String,
                url: String,
                types: [String],
            }
        ]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, required: false }
}, { _id: true });

export default mongoose.model('contents', ContentsSchema)
