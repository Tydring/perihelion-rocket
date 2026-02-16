import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Input } from "../../../components/ui/Input";
import { Lock, AlertCircle } from "lucide-react";

export function LoginPage() {
    const { user, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    if (loading) return null;
    if (user) return <Navigate to="/admin" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Credenciales inválidas. Intenta de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4 page-enter">
            <div className="w-full max-w-sm glass-strong rounded-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />
                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-xl font-bold">Acceso Administrador</h1>
                        <p className="text-sm text-muted-foreground mt-1">Ingresa tus credenciales</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive animate-slide-down">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Correo</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-background/50"
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Contraseña</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-background/50"
                                autoComplete="current-password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${submitting ? "bg-secondary text-muted-foreground" : "btn-gradient text-white"}`}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Ingresando...
                                </span>
                            ) : "Ingresar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
