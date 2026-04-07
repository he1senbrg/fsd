"use client";

export default function EmptyState({
    icon,
    title,
    description,
    className = "",
    iconClassName = "",
    titleClassName = "",
    descriptionClassName = "",
}) {
    return (
        <div className={`text-center py-12 text-stone-400 ${className}`.trim()}>
            {icon ? (
                <span className={`material-symbols-outlined text-5xl mb-2 block ${iconClassName}`.trim()}>
                    {icon}
                </span>
            ) : null}
            {title ? <p className={`font-semibold ${titleClassName}`.trim()}>{title}</p> : null}
            {description ? <p className={`${descriptionClassName}`.trim()}>{description}</p> : null}
        </div>
    );
}