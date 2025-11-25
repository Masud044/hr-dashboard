import { createContext, useContext, useState, useEffect } from "react";

import api from "@/api/Api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // store user data
  const [loading, setLoading] = useState(true);

  // 🔹 Check session on page reload
   const checkSession = async () => {
    try {
      const res = await api.get("/sessionCheck.php");

      if (res.data.logged_in) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log("Session error", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Check session on initial load
  useEffect(() => {
    checkSession();
  }, []);

  // 🔹 Login function
  const login = async (username, password) => {
    try {
      const res = await api.put(
        "/login.php",
        { username, password },
       
      );
      console.log(res.data)

      if (res.data.success) {
        setUser(res.data.data); // store user
        return true;
      }
    } catch (error) {
      console.log("Login Failed", error);
      return false;
    }
  };

  // 🔹 Logout function
  const logout = async () => {
    try {
      await api.get(
        "/logout.php",
       
      );
      setUser(null);
    } catch (error) {
      console.log("Logout error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
