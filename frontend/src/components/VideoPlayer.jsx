"use client";

export default function VideoPlayer({ src, className = "" }) {
    return (
        <div
            className={`relative group rounded-xl overflow-hidden bg-[var(--dark-brown)] select-none ${className}`}
            style={{ aspectRatio: "16/9" }}
        >
            {/* Video element */}
            <video
                src={src}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
                style={{ cursor: "pointer" }}
            />
        </div>
    );
}
