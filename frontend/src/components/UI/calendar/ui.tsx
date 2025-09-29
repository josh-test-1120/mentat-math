'use client'

import React, {MouseEventHandler, ReactNode} from 'react';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={`bg-zinc-900 rounded-2xl shadow-md p-4 ${className}`}>
            {children}
        </div>
    );
}

export function CardContent({ children }: {children: ReactNode}) {
    return (
        <div className="p-4">
            {children}
        </div>
    );
}

export function Button({
   children,
   onClick,
   type = "button",
   className
}: {
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    type?: "button" | "submit" | "reset";
    className?: string;
}) {    return (
        <button
            type={type}
            onClick={onClick}
            className={`bg-red-700 hover:bg-red-600 text-mentat-gold font-bold py-2 px-4 rounded-lg ${className}`}
        >
            {children}
        </button>
    );
}
