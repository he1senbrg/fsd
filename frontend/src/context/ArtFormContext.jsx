"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { artFormAPI } from "../lib/api";

const ArtFormContext = createContext();

const defaultArtForms = [
    "Kathak",
    "Bharatanatyam",
    "Classical Music",
    "Odissi",
    "Kuchipudi",
    "Manipuri",
    "Mohiniyattam",
    "Sattriya",
];

export function ArtFormProvider({ children }) {
    const [artForms, setArtForms] = useState(defaultArtForms);

    useEffect(() => {
        const fetchArtForms = async () => {
            try {
                const res = await artFormAPI.getAll();
                if (res.status === 'success' && res.data?.artForms?.length > 0) {
                    const dbForms = res.data.artForms.map(f => f.name);
                    setArtForms(dbForms);
                } else {
                    for (const form of defaultArtForms) {
                        artFormAPI.create({ name: form }).catch(() => {});
                    }
                }
            } catch (e) {
                console.error("Failed to fetch art forms from DB", e);
                const stored = localStorage.getItem("kalasetu_art_forms");
                if (stored) {
                    setArtForms(JSON.parse(stored));
                }
            }
        };
        fetchArtForms();
    }, []);

    const addArtForm = async (newForm) => {
        if (!newForm || typeof newForm !== 'string') return;
        const form = newForm.trim();
        if (!form || artForms.includes(form)) return;
        
        const updated = [...artForms, form];
        setArtForms(updated);
        
        try {
            await artFormAPI.create({ name: form, category: 'Custom' });
            localStorage.setItem("kalasetu_art_forms", JSON.stringify(updated));
        } catch (e) {
            console.error("Failed to save art form to DB", e);
        }
    };

    return (
        <ArtFormContext.Provider value={{ artForms, addArtForm }}>
            {children}
        </ArtFormContext.Provider>
    );
}

export function useArtForms() {
    return useContext(ArtFormContext);
}
