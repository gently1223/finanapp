import * as admin from 'firebase-admin';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { Axios } from 'axios';
// import NordigenClient from 'nordigen-node';

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.

const NORDIGEN_ID = functions.config().nordigen.id;
const NORDIGEN_KEY = functions.config().nordigen.key;

export const authenticate: express.RequestHandler = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer ')
  ) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);
    functions.logger.log('Decode token', decodedIdToken);
    req.user_id = decodedIdToken.uid;
    req.email = decodedIdToken.email || '';
    req.admin = decodedIdToken.admin;
    next();
    return;
  } catch (e) {
    functions.logger.log('error decoding auth token');
    functions.logger.log(e);

    res.status(403).send('Unauthorized');
    return;
  }
};

export const refreshNordigen: express.RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const userRef = admin.firestore().collection('users').doc(req.user_id);
    const userDoc = await userRef.get();
    // const banksCollection = await userRef.collection('banks').get();
    //Only check nordigen if a bank have been added
    // if (banksCollection.size > 0) {
    let nordigenToken = userDoc.get('token');
    let nordigenRefresh = userDoc.get('refresh');
    const userEmail = userDoc.get('email');
    let tokenChanged = false;
    let outOfDate = false;
    //check if the user has a refrsh token
    if (nordigenRefresh) {
      try {
        // Exchange refresh token. Refresh token is valid for 30 days
        // functions.logger.log('refresh token');
        // functions.logger.log(nordigenRefresh);
        const newTokenResponse = await (req.nordigen as Axios).post(
          'token/refresh/',
          {
            refresh: nordigenRefresh,
          }
        );
        nordigenToken = newTokenResponse.data.access;
        tokenChanged = true;
      } catch (error) {
        functions.logger.log('error refresh token');
        functions.logger.log(error);
        outOfDate = true;
      }
    }
    if (!nordigenToken || outOfDate) {
      //Generate a new token
      //Get the access token for nordigen
      const tokenResponse = await (req.nordigen as Axios).post('token/new/', {
        secret_id: NORDIGEN_ID,
        secret_key: NORDIGEN_KEY,
      });
      // nordigenRefresh = tokenData.refresh;
      nordigenRefresh = tokenResponse.data.refresh;
      nordigenToken = tokenResponse.data.access;
      tokenChanged = true;
      // functions.logger.log('new token');
      // functions.logger.log(tokenResponse.data);
    }

    if (tokenChanged || !userEmail) {
      //Save the tokens on FB
      await userRef.set(
        {
          access: nordigenToken,
          refresh: nordigenRefresh,
          email: req.email || '',
        },
        { merge: true }
      );
    }
    //Set nordigen new long token
    // req.nordigen.token = nordigenToken;
    (req.nordigen as Axios).defaults.headers.common['Authorization'] =
      'Bearer ' + nordigenToken;
    //add all needed fields from the user to the request
    req.token = nordigenToken; //Dont really need this
    // }
    next();
    return;
  } catch (e) {
    functions.logger.log('error refresgin nordigen');
    functions.logger.log(e);

    res.status(403).send('Unauthorized');
    return;
  }
};
