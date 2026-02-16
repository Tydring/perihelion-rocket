import React, { useState } from "react";
import { useBooking } from "../../booking/hooks/useBooking";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export function BookingModal({ classItem, onClose, onBookingSuccess }) {
    const { bookClass, loading, error, success } = useBooking();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        healthConditions: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await bookClass(classItem.id, {
            ...formData,
            age: Number(formData.age)
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md glass-strong rounded-2xl shadow-2xl shadow-black/40 animate-scale-in relative overflow-hidden">
                {/* Top accent */}
                <div className="h-1 bg-gradient-to-r from-primary via-cyan-400 to-primary" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors z-10"
                >
                    <X className="h-4 w-4" />
                </button>

                {success ? (
                    /* Success state */
                    <div className="p-8 text-center animate-scale-in">
                        <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">¡Reserva Confirmada!</h3>
                        <p className="text-muted-foreground mb-1">
                            Has reservado <strong className="text-foreground">{classItem.name}</strong> exitosamente.
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Te esperamos el {classItem.dayOfWeek} a las {classItem.startTime}
                        </p>
                        <button
                            onClick={() => { onBookingSuccess(); onClose(); }}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold btn-gradient text-white"
                        >
                            ¡Genial!
                        </button>
                    </div>
                ) : (
                    /* Form state */
                    <div className="p-6">
                        <div className="mb-5">
                            <h3 className="text-xl font-bold">Reservar {classItem.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{classItem.dayOfWeek} • {classItem.startTime}</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4 animate-slide-down">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nombre Completo</label>
                                <Input name="name" value={formData.name} onChange={handleChange} required className="bg-background/50" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Correo Electrónico</label>
                                <Input type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-background/50" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Edad</label>
                                <Input type="number" name="age" value={formData.age} onChange={handleChange} required min="10" className="bg-background/50" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Condiciones de Salud</label>
                                <textarea
                                    name="healthConditions"
                                    value={formData.healthConditions}
                                    onChange={handleChange}
                                    className="flex min-h-[80px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Opcional"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                                    loading ? "bg-secondary text-muted-foreground" : "btn-gradient text-white"
                                )}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Reservando...
                                    </span>
                                ) : "Confirmar Reserva"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}
