import { createContext, useContext, useState } from "react";

// Create context
const AuthContext = createContext(null);

// Hook to use Auth
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // login method
  const login = (email, password) => {
    if (email === "admin@hrms.com" && password === "123456#erqe*&^%$E") {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // logout method
  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
