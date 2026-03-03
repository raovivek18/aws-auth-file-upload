import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children, value }) => {
    const memoValue = useMemo(() => value, [value]);
    return <AuthContext.Provider value={memoValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};
