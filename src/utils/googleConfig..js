import { google } from "googleapis";
import {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
} from './../constant.js'
const oAuth2 = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'postmessage'
)

export default oAuth2