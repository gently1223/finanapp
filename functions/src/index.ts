import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import NORDIGEN from './nordigen';
const API = NORDIGEN();
export const api = functions.https.onRequest(API);
//TODO on uuser creation check if admin role set to true the set custom claim
export const listenPrivateUsers = functions.firestore
  .document('adminUsers/{id}')
  .onWrite(async (snap, ctx) => {
    await admin.auth().setCustomUserClaims(ctx.params.id, { admin: true });
  });
