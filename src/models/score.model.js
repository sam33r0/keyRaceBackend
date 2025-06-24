// import bcrypt from 'bcrypt'
import mongoose, { Schema } from "mongoose";
// import jwt from 'jsonwebtoken';
const scoreSchema = new Schema({
    accuracy:{
        type: String
    },
    mistypes: {
        type: Number
    },
    finalScore:{
        type: String
    },
    averageWpm:{
        type: Number
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true })

export const Score = mongoose.model('Score', scoreSchema)