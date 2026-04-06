"use client";
import ToastContainer from "@/components/Toast";
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let _nextId = 1;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    /**
     * showToast(message, type?)
     * type: "success" | "error" | "info" | "warning"  (default: "info")
     */
    const showToast = useCallback((message, type = "info") => {
        const id = _nextId++;
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
