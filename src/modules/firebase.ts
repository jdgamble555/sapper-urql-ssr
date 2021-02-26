import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/firestore";
import * as config from "../config.json";

const fb = (process as any).browser ? firebase : require('firebase');

fb.initializeApp(config);

export const auth = fb.auth() as firebase.auth.Auth;
export const googleProvider = new fb.auth.GoogleAuthProvider();
export const db = fb.firestore();

export const getToken = async (): Promise<any> => {

  // todo, save token, authstate here...

  const user = await getCurrentUser(auth);
  if (user) {
    return await user.getIdToken();
  }
  return Promise.resolve();
};

/**
 * Promise version of onAuthStateChanged
 * @param auth
 * @returns - updated user
 */
export function getCurrentUser(auth: firebase.auth.Auth): Promise<firebase.User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user: firebase.User) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}
