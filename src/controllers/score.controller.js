import { Score } from "../models/score.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addScore = asyncHandler(async (req, res) => {
    const user = req.user;
    const { accuracy, mistypes, finalScore, averageWpm } = req.body;
    if (!user) {
        throw new ApiError(400, 'unauthorized request')
    }
    if ([accuracy, finalScore, mistypes].some(val => val === undefined || val === null)) {
        throw new ApiError(401, 'Missing data field');
    }

    const score = await Score.create({
        accuracy,
        mistypes,
        finalScore,
        averageWpm: averageWpm ? averageWpm : 0,
        user: user._id
    })
    // console.log(user, score);
    res.status(200).json(new ApiResponse(200, {
        score
    }, "saved score"))
})

const getPastHistory = asyncHandler(async (req, res) => {
    const user = req.user;
    const scoreAggreg = await Score.aggregate([
        {
            $match: {
                user: user._id
            }
        }
    ])
    // console.log(scoreAggreg);
    res.status(200).json(new ApiResponse(200, scoreAggreg, 'previous score'))

})
export {
    addScore,
    getPastHistory
}