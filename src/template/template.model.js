const _  = require('lodash');
module.exports = (name) => {
    return `
import * as mongoose from 'mongoose';

const Schema = mongoose.Schema
let ${_.capitalize(name)}Schema = new Schema({
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, required: false }
}, { _id: true });

export default mongoose.model('${_.lowerCase(name)}', ${_.capitalize(name)}Schema)
`
}