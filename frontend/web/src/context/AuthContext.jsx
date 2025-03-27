import { createContext,useState } from "react";

export const AuthContext = createContext()

export const AuthProvider = ({children}) => {
    const [isLoggedIn , setIsLoggedIn] = useState(false)
    const [userRole , setUserRole] = useState(null)    

    const handleLogin = ()=>{
        setIsLoggedIn(true)
        setUserRole(role)
    }

    const handleLogout = ()=>{
        setIsLoggedIn(false)
        setUserRole(null)
    }

    return(
        <AuthContext.Provider>
            {children}
        </AuthContext.Provider>
    )
}