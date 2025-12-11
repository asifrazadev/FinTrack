import { auth, firestore } from "@/config/firebase";
import { AuthContextType, UserType } from "@/types";
import { router } from "expo-router";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";

const authContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,(firebaseUser) => {
     if (firebaseUser) {
         // User is signed in
setUser({
              uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                name: firebaseUser.displayName || "",
            });
            updateUserData(firebaseUser.uid);
            router.replace("/(tabs)")
        } else {
            // User is signed out
            setUser(null);
            router.replace('/(auth)/welcome')
        }
    });
    return () => unsubscribe();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: "Login successful" };
    } catch (error: any) {
      let msg = error.message || "Login failed";
      if (msg.includes("auth/user-not-found") || msg.includes("auth/wrong-password")  || msg.includes("auth/missing-password")|| msg.includes("auth/invalid-credential")){
        msg = "Invalid email or password.";
      } else if (msg.includes("auth/invalid-email")){
        msg = "The email address is invalid.";
      }
      return { success: false,  msg };
            
  
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(firestore, "users", response.user.uid), {
        name,
        email,
        uid: response.user.uid,
      });
      return { success: true, message: "Registration successful" };
    } catch (error: any) {
      let msg = error.message || "Registration failed";
      if (msg.includes("auth/email-already-in-use")) {
        msg = "The email address is already in use.";
      } else if (msg.includes("auth/invalid-email")) {
        msg = "The email address is invalid.";
      } 
      return { success: false,  msg };
    }
  };
  const updateUserData = async (uid: string) => {
    try {
      const userDoc = doc(firestore, "users", uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        setUser(userSnap.data() as UserType);
      }
    } catch (error: any) {
      let msg = error.message || "Registration failed";
      console.log(msg);
    }
  };
  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
  };
  return (
    <authContext.Provider value={contextValue}>{children}</authContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
