"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function Modal({ children }: { children: React.ReactNode }) {
    const overlay = useRef<HTMLDivElement>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const onDismiss = useCallback(() => {
        router.back();
    }, [router]);

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            if (e.target === overlay.current || e.target === wrapper.current) {
                if (onDismiss) onDismiss();
            }
        },
        [onDismiss, overlay, wrapper]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") onDismiss();
        },
        [onDismiss]
    );

    useEffect(() => {
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [onKeyDown]);

    return (
        <div
            ref={overlay}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClick}
        >
            <div
                ref={wrapper}
                className="flex min-h-full items-center justify-center p-4 sm:p-6"
            >
                <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    <button
                        onClick={onDismiss}
                        className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all"
                        aria-label="Close modal"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <div className="max-h-[90vh] overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
