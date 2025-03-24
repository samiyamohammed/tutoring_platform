import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      let userToken;
      let userRole;

      try {
        userToken = await AsyncStorage.getItem("userToken");
        userRole = await AsyncStorage.getItem("userRole");
      } catch (e) {
        console.log("Failed to restore auth state:", e);
      }

      dispatch({ type: "RESTORE_TOKEN", token: userToken, role: userRole });
    };

    bootstrapAsync();
  }, []);

  const authContext = useMemo(
    () => ({
      signIn: async (data) => {
        let userRole = "student"; // Default role

        if (data.email === "student@gmail.com") {
          userRole = "student";
        } else if (data.email === "tutor@gmail.com") {
          userRole = "tutor";
        } else if (data.email === "admin@gmail.com") {
          userRole = "admin";
        }

        try {
          await AsyncStorage.setItem("userToken", "dummy-auth-token");
          await AsyncStorage.setItem("userRole", userRole);
        } catch (e) {
          console.log("Failed to save auth state:", e);
        }

        dispatch({
          type: "SIGN_IN",
          token: "dummy-auth-token",
          role: userRole,
        });
      },
      signOut: async () => {
        console.log("Sign Out Called"); 
        try {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("userRole");
        } catch (e) {
          console.log("Failed to remove auth state:", e);
        }

        dispatch({ type: "SIGN_OUT" });
      },
      signUp: async (data) => {
        let userRole = "student"; // Default role

        if (data.email === "student@gmail.com") {
          userRole = "student";
        } else if (data.email === "tutor@gmail.com") {
          userRole = "tutor";
        } else if (data.email === "admin@gmail.com") {
          userRole = "admin";
        }

        try {
          await AsyncStorage.setItem("userToken", "dummy-auth-token");
          await AsyncStorage.setItem("userRole", userRole);
        } catch (e) {
          console.log("Failed to save auth state:", e);
        }

        dispatch({
          type: "SIGN_UP",
          token: "dummy-auth-token",
          role: userRole,
        });
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
