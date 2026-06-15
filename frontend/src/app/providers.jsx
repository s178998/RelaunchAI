import authContext from "../context/AuthContext";
import { useState } from "react";



export function AuthProvider({children}) {

    const [user, setUser] = useState()

    function login(setDatauser){
        setUser(setDatauser);
    }
    function logout() {
        setUser(null);
    }

    return (
        <authContext.Provider value={{user, login, logout}}>
            {children}
        </authContext.Provider>
    )


}