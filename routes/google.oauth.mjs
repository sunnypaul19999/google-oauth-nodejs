import express from 'express';
import qs from 'qs';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const googleOAuthRouter = express.Router();

async function getGoogleUserInfo(idToken, accessToken) {
    const url = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';
    //appending the access_token to the url
    const requestURL = `${url}&access_token=${accessToken}`;
    try {
        const userInfoRes = await axios.get(requestURL, {
            withCredentials: true,
            headers: {
                //passing the id_token
                'Authorization': `Bearer ${idToken}`
            }
        });
        console.log(userInfoRes.data);
        return userInfoRes.data;
    } catch (err) {
        console.log(err, 'failed to get user info');
    }
}

function getGoogleOAuthAuthTokenExchangeBody(authorizationCode) {
    //defined in 'https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1'
    const params = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    };

    //url encoded string needed to be passed on request to
    //'https://oauth2.googleapis.com/token' in the body
    //thus returning url encoded string of params
    return qs.stringify(params);
}

async function onGoogleCallback(req, res) {
    console.log(req.query);
    try {
        const url = 'https://oauth2.googleapis.com/token';
        const googleOAuthAuthTokenBody = getGoogleOAuthAuthTokenExchangeBody(req.query.code);
        //request must of type 'post'
        //passing url endcoded of required params and setting appr headers
        //according to 'https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1'
        /*
        response on call to 'https://oauth2.googleapis.com/token':
            {
                access_token: "ya29.a0Aa4xrXMdmJ5uhubi6fCFOnE_Sux9Dhq-wJqdE2GSbYpNsyy2o3OvvK15eTPbWSxJ90ExOf9a1tsvMu59n-TRsXYCIqmD7lNOChQh0_x3mGkwPQQlM2-ZF91tidyAouU-v-bIgI5ZSYagg7xihrsKSqranFmvaCgYKATASARMSFQEjDvL9re-eaLT_1jBIeXo7tB0nJw0163",
                expires_in: 3599,
                scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
                token_type: "Bearer",
                id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImVkMzZjMjU3YzQ3ZWJhYmI0N2I0NTY4MjhhODU4YWE1ZmNkYTEyZGQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4MDI4MjEzODM0Ni10dnU1ZWY3M3NlMHZpcHJsc3BlZmlzcjZna3UyNXY3Mi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjgwMjgyMTM4MzQ2LXR2dTVlZjczc2UwdmlwcmxzcGVmaXNyNmdrdTI1djcyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTEzMjExOTc1NzAzNzc0NzY2NjEzIiwiZW1haWwiOiJoaWVuc3VuYmVyZ0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IkduVGtNWHFvUk81eUNfWHhFaTVCLVEiLCJuYW1lIjoiSGllbnN1bmJlcmcgV2F0ZXJzIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FMbTV3dTBNWk1QcDVoQ2RzSGhDRFcxbHVuSEhvX1h5REl6b3k0bWNRcDVQPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IkhpZW5zdW5iZXJnIiwiZmFtaWx5X25hbWUiOiJXYXRlcnMiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTY2NTI2MjU3MSwiZXhwIjoxNjY1MjY2MTcxfQ.kiRM_3A1EeqzT_vPXnlkjCvYVgg_tpj6_cazI6owT1Gz-QC5FtslBAdjQk-e3mcfKoPFRhv-MgBhLd3hTqNyUVyyQGBol0DEX9BNpvy7woWj65v-gSo2YSLQXraREsIE7i1VGNRLAk5xzedyG5A8M6BWh4sPGaOiCgXrIP6KXfqTLbzSA1-2lYO6JHf2fvku5dgduMXkdghifPl_Jo5wPlCmr9FQh6eLI3NHYLUCr0y_e2JBjzgub-RwQ8XTYdybrcl4T6xbWGeqXftHF-eEw4DBIFIWuZS2PmaKmwhzB-RavGSNCJy-liqVlNegQNaXPVEsbtUDFFJxxnXJb7xqog"
            }
        */
        const oauthRes = await axios.post(url, googleOAuthAuthTokenBody, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const userInfo = await getGoogleUserInfo(oauthRes.data.id_token, oauthRes.data.access_token);
        res.send(userInfo);
    } catch (err) {
        console.log(err, 'failed to exchange auth token');
    }
}

googleOAuthRouter.get('/redirect', onGoogleCallback);

export { googleOAuthRouter }