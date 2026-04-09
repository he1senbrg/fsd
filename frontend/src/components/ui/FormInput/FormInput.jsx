"use client";

const BASE_CLASS = "w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[var(--secondary-color)]";

export default function FormInput({ className = "", ...props }) {
    return <input className={`${BASE_CLASS} ${className}`.trim()} {...props} />;
}