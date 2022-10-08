import { Router } from 'express';
import { googleOAuthRouter } from './google.oauth.mjs';

const oauthRouter = Router();
oauthRouter.use('/user/login/oauth/2/google', googleOAuthRouter);

export { oauthRouter };
