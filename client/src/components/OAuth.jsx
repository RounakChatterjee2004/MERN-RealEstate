import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { signInFailure, signInSuccess } from "../redux/user/userSlice.js";
import { app } from "../firebase.js";
import { useNavigate } from "react-router-dom";
export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await fetch("http://localhost:3000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to sign in with Google:", errorData);
        return;
      }

      const data = await response.json();
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (err) {
      console.log("Could not sign in with Google", err);
      // dispatch(signInFailure(err.message));
      // Navigate("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="bg-red-700 text-white rounded-lg p-3 uppercase hover:opacity-95"
    >
      Continue with Google
    </button>
  );
}
