import React from "react";
import { Link, useLocation } from "react-router-dom";
import { GYM_NAME } from "../../lib/constants";
import { InstallPrompt } from "../pwa/InstallPrompt";

export function Layout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full glass-strong">
                <div className="container flex h-16 max-w-screen-2xl items-center px-4 mx-auto">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <img
                                src="/logo.png"
                                alt="Lagunita Health Club"
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all"
                            />
                            <span className="font-bold text-lg tracking-tight">{GYM_NAME}</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-end">
                        <nav className="flex items-center">
                            <Link
                                to="/"
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === "/"
                                    ? "bg-primary/15 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                    }`}
                            >
                                Horario
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main - page transition */}
            <main key={location.pathname} className="flex-1 page-enter">
                {children}
            </main>

            <InstallPrompt />

            {/* Footer */}
            <footer className="py-6 px-4 border-t border-border/30">
                <div className="container max-w-screen-xl mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        © 2026 {GYM_NAME}. Todos los derechos reservados.
                    </p>
                    <p className="text-center text-xs text-muted-foreground/60">
                        Tu bienestar empieza aquí
                    </p>
                </div>
            </footer>
        </div>
    );
}
