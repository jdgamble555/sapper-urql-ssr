import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/firestore";
import * as config from "../config.json";

const fb = (process as any).browser ? firebase : require('firebase');

fb.initializeApp(config);

export const auth = fb.auth() as firebase.auth.Auth;
export const googleProvider = new fb.auth.GoogleAuthProvider();
export const db = fb.firestore();

export async function getToken(): Promise<any> {
  return await new Promise((resolve: any, reject: any) =>
    auth.onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        user?.getIdTokenResult()
          .then(async (r: firebase.auth.IdTokenResult) => {
            const token = (r.claims["https://dgraph.io/jwt/claims"])
              ? r.token
              : await user.getIdToken(true);
            resolve(token);
          }, (e: any) => reject(e));
      }
    })
  );
}
