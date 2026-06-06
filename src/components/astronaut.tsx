export function Astronaut({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 240 280"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Body */}
            <path
                d="M75 130 Q75 120 85 118 L155 118 Q165 120 165 130 L165 200 Q165 210 155 212 L85 212 Q75 210 75 200 Z"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
                fill="var(--background)"
            />
            {/* Chest panel */}
            <rect
                x="95"
                y="145"
                width="50"
                height="30"
                rx="4"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="var(--background)"
            />
            <circle cx="105" cy="158" r="2.5" fill="currentColor" opacity="0.8" />
            <circle cx="115" cy="158" r="2.5" fill="currentColor" opacity="0.4" />
            <rect x="125" y="155" width="14" height="6" rx="1" fill="currentColor" opacity="0.3" />
            {/* Helmet */}
            <circle
                cx="120"
                cy="80"
                r="42"
                stroke="currentColor"
                strokeWidth="3"
                fill="var(--background)"
            />
            {/* Visor */}
            <ellipse
                cx="120"
                cy="78"
                rx="30"
                ry="26"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="currentColor"
                fillOpacity="0.08"
            />
            {/* Visor reflection */}
            <ellipse
                cx="108"
                cy="68"
                rx="9"
                ry="6"
                fill="currentColor"
                opacity="0.25"
                transform="rotate(-25 108 68)"
            />
            {/* Antenna */}
            <line x1="120" y1="38" x2="120" y2="28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="120" cy="24" r="4" fill="currentColor" />
            {/* Left arm (raised, waving) */}
            <path
                d="M75 140 Q45 130 30 105 Q22 90 28 75"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
            <circle
                cx="28"
                cy="68"
                r="11"
                stroke="currentColor"
                strokeWidth="3"
                fill="var(--background)"
            />
            {/* Right arm (down by side) */}
            <path
                d="M165 145 Q190 165 195 195"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
            <circle
                cx="197"
                cy="203"
                r="11"
                stroke="currentColor"
                strokeWidth="3"
                fill="var(--background)"
            />
            {/* Legs */}
            <path
                d="M95 212 L88 250 L82 262"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M145 212 L152 250 L158 262"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
            />
            {/* Boots */}
            <ellipse
                cx="82"
                cy="266"
                rx="11"
                ry="6"
                stroke="currentColor"
                strokeWidth="3"
                fill="var(--background)"
            />
            <ellipse
                cx="158"
                cy="266"
                rx="11"
                ry="6"
                stroke="currentColor"
                strokeWidth="3"
                fill="var(--background)"
            />
        </svg>
    );
}

export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            aria-hidden="true"
        >
            <path
                d="M8 0 L9 6 L16 8 L9 10 L8 16 L7 10 L0 8 L7 6 Z"
                fill="currentColor"
            />
        </svg>
    );
}
