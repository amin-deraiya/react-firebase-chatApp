import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, doc, documentId, onSnapshot, query, setDoc, Timestamp, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function logOut() {
    return signOut(auth);
  }

  async function googleSignIn() {
    const googleAuthProvider = new GoogleAuthProvider();
    try {
      const res = await signInWithRedirect(auth, googleAuthProvider);
      console.log('res google', { res });
    } catch (err) {
      alert(err.message);
    }
  }

  async function githubSignIn() {
    const githubAuthProvider = new GithubAuthProvider();
    try {
      const res = await signInWithRedirect(auth, githubAuthProvider);
      console.log('res github', { res });
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    if (user?.uid) {
      const q = query(collection(db, 'users'), where(documentId(), '==', user?.uid));
      onSnapshot(q, (querySnapshot) => {
        if (!querySnapshot.docs.length) {
          profileCreation(user);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function detectMob() {
    const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];

    return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    });
  }

  const profileCreation = (user) => {
    if (user) {
      try {
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          displayName: user.displayName ? user.displayName : user.email.match(/^([^@]*)@/)[1],
          profile_pictures: user.photoURL,
          created_at: Timestamp.now(),
          email: user.email,
        }).then((res) => {
          toast.success('Profile Creation Successfully!');
          navigate('/chat');
        });
      } catch (err) {
        console.log(err, 'firestore err');
        window.confirm('Something went wrong during profile creation, Please Retry') === true &&
          window.location.reload();
      }
    }
  };

  function googleSignInWithPopup() {
    const googleAuthProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleAuthProvider)
      .then((result) => {})
      .catch((err) => alert(err.message));
  }

  function githubSignInWithPopup() {
    const githubAuthProvider = new GithubAuthProvider();
    return signInWithPopup(auth, githubAuthProvider)
      .then((result) => {})
      .catch((err) => alert(err.message));
  }

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentuser) => {
      setUser(currentuser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <userAuthContext.Provider
      value={{
        user,
        loading,
        googleSignIn,
        githubSignIn,
        detectMob,
        googleSignInWithPopup,
        githubSignInWithPopup,
        logOut,
      }}
    >
      {children}
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
