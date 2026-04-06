"use client";
import { authAPI } from "@/lib/api";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("kalasetu_token");
        if (stored) {
            setToken(stored);
            authAPI
                .getMe()
                .then((res) => setUser(res.data.user))
                .catch((err) => {
                    if (err?.status === 401) {
                        localStorage.removeItem("kalasetu_token");
                    } else {
                        setToken(null);
                    }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password, rememberMe = false) => {
        const res = await authAPI.login(email, password, rememberMe);
        const { token: jwt, user: u } = res.data;
        localStorage.setItem("kalasetu_token", jwt);
        setToken(jwt);
        setUser(u);
        return u;
    }, []);

    const register = useCallback(async (fullName, email, password, role) => {
        const res = await authAPI.register(fullName, email, password, role);
        const { token: jwt, user: u } = res.data;
        localStorage.setItem("kalasetu_token", jwt);
        setToken(jwt);
        setUser(u);
        return u;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("kalasetu_token");
        setToken(null);
        setUser(null);
        authAPI.logout().catch(() => { });
    }, []);

    const updateUser = useCallback((newData) => {
        setUser((prev) => ({ ...prev, ...newData }));
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}