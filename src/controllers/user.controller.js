import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import oAuth2Client from "../utils/googleConfig..js";
import axios from "axios";
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "email is required");
    }

    const user = await User.findOne({
        // $or: [{ email }, { username }]
        email
    }).select(" -refreshToken");
    // const user = await User.findOne({
    //     $or: [{ email }, { username }]
    // }).select(" -refreshToken");

    if (!user) {
        throw new ApiError(404, "user does not exist please register");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password");
    }
    const { refreshToken, accessToken } = await generateToken(user);
    const options = {
        httpOnly: true,
        secure: true
    }
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    const userObj = user.toObject();
    delete userObj.password;
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,
            {
                'user': userObj, accessToken, refreshToken,
            },
            "User logged In Successfully"
        ))
})
const register = asyncHandler(async (req, res, next) => {
    // const { email, username, password } = req.body;
    const { username, email, fullName, password, avatar } = req.body;
    // console.log('called register ', username, email, fullName);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "incomplete data");
    }
    const existedUser = await User.findOne({
        $or: [{ email }]
    })

    if (existedUser)
        throw new ApiError(409, "User already exist");

    // if (!avatarLocalPath)
    //     throw new ApiError(409, "no dp to upload");

    //const avatar = await uploadOnCloudinary(avatarLocalPath);
    // if (!avatar)
    //     throw new ApiError(400, "Avatar file is required");
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar || '',
        password,
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )


})

const googleLogin = asyncHandler(async (req, res, next) => {
    const { code } = req.query;
    console.log('code recieved', code);

    const googleRes = await oAuth2Client.getToken(code)
    console.log('received googleRes');

    oAuth2Client.setCredentials(googleRes.tokens)
    // console.log('received googleRes 2', googleRes);
    const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`)
    // console.log('userRes ', userRes);

    const { email, name, picture } = userRes.data;
    let user = await User.findOne({ email })
    if (!user)
        user = await User.create({
            fullName: name,
            email,
            username: name,
            avatar: picture,

        })
    const { accessToken, refreshToken } = await generateToken(user);
    const options = {
        httpOnly: true,
        secure: true
    }
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    const userObj = user.toObject();
    delete userObj.password;
    
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200,
            {
                'user': userObj, accessToken, refreshToken,
            },
            "User logged In Successfully"
        ))

})

const generateToken = async (user) => {
    try {
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "user logged out successfully"));

})
export {
    login,
    register,
    logoutUser,
    googleLogin
}