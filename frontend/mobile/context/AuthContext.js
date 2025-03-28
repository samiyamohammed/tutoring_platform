import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInUser as authSignIn, signupUser as authSignUp } from "../application/services/authService"; 

const AuthContext = createContext();

const initialState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  userRole: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...state,
        userToken: action.token,
        userRole: action.role,
        isLoading: false,
      };
    case "SIGN_IN":
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        userRole: action.role,
      };
    case "SIGN_OUT":
      return {
        ...state,
        isSignout: true,
        userToken: null,
        userRole: null,
      };
    case "SIGN_UP":
      return {
        ...state,
        isSignout: false,
        userToken: action.token,
        userRole: action.role,
      };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load the token and role from storage
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userRole = await AsyncStorage.getItem("userRole");
        dispatch({ type: "RESTORE_TOKEN", token: userToken, role: userRole });
      } catch (e) {
        console.log("Failed to restore auth state:", e);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (token, role) => {
        try {
          if (!token) throw new Error("Token is missing during sign-in.");
          if (!role) throw new Error("User role is missing during sign-in.");
      
          await AsyncStorage.setItem("userToken", token);
          await AsyncStorage.setItem("userRole", role);
      
          dispatch({ type: "SIGN_IN", token, role });
      
          
        } catch (e) {
          console.error("Sign-in context error:", e);
          throw new Error("Error during authentication.");
        }
      },    
      
      
      signOut: async () => {
        try {
          console.log("Logging out...");
      
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userRole");
      
          dispatch({ type: "SIGN_OUT" });
      
          console.log("Logout state updated:", state); // Ensure state change before navigating
      
        } catch (e) {
          console.error("Sign-out error:", e);
        }
      },
      
      
           

      signUp: async (email, password) => {
        try {
          const response = await authSignUp(email, password); // Call auth service
          const { token, role } = response;

          await AsyncStorage.setItem("userToken", token);
          await AsyncStorage.setItem("userRole", role);

          dispatch({ type: "SIGN_UP", token, role });
        } catch (e) {
          console.error("Sign-up error:", e);
          throw new Error("Failed to register. Try again later.");
        }
      },
      state,
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
