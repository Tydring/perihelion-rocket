import React, { useState } from "react";
import { useBooking } from "../../booking/hooks/useBooking";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { X, CheckCircle, AlertCircle, Bell, Shield } from "lucide-react";
import { GYM_PHONE } from "../../../lib/constants";

// Only letters, spaces, accented chars, hyphens, apostrophes
const NAME_REGEX = /^[a-zA-ZÀ-ÿñÑ\s'-]{2,100}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function stripHtml(str) {
    return str.replace(/<[^>]*>/g, "").trim();
}

function validateForm(data) {
    if (!NAME_REGEX.test(data.name)) {
        return "El nombre solo puede contener letras y espacios (2-100 caracteres).";
    }
    if (!EMAIL_REGEX.test(data.email)) {
        return "Por favor ingresa un correo electrónico válido.";
    }
    const age = Number(data.age);
    if (!age || age < 10 || age > 119 || !Number.isInteger(age)) {
        return "La edad debe ser un número entero entre 10 y 119.";
    }
    return null;
}

export function BookingModal({ classItem, onClose, onBookingSuccess }) {
    const { bookClass, joinWaitlist, loading, error, success } = useBooking();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        age: "",
        healthConditions: ""
    });
    const [wantsReminder, setWantsReminder] = useState(false);
    const [validationError, setValidationError] = useState(null);

    const isWaitlistMode = classItem.bookedCount >= classItem.capacity;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationError) setValidationError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const vError = validateForm(formData);
        if (vError) {
            setValidationError(vError);
            return;
        }

        const userData = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            age: Number(formData.age),
            healthConditions: stripHtml(formData.healthConditions)
        };

        if (isWaitlistMode) {
            await joinWaitlist(classItem.id, userData, wantsReminder);
        } else {
            await bookClass(classItem.id, userData, wantsReminder);
        }
    };

    const displayError = validationError || error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-md glass-strong rounded-2xl shadow-2xl shadow-black/40 animate-scale-in relative overflow-hidden">
                {/* Top accent */}
                <div className={cn(
                    "h-1 bg-gradient-to-r",
                    isWaitlistMode ? "from-amber-400 via-orange-500 to-amber-400" : "from-primary via-cyan-400 to-primary"
                )} />

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
                        <div className={cn(
                            "h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4",
                            isWaitlistMode ? "bg-amber-500/15" : "bg-emerald-500/15"
                        )}>
                            <CheckCircle className={cn("h-8 w-8", isWaitlistMode ? "text-amber-500" : "text-emerald-400")} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{isWaitlistMode ? "¡Estás en la lista!" : "¡Reserva Confirmada!"}</h3>
                        <p className="text-muted-foreground mb-1">
                            {isWaitlistMode
                                ? <span>Te avisaremos si se libera un cupo para <strong className="text-foreground">{classItem.name}</strong>.</span>
                                : <span>Has reservado <strong className="text-foreground">{classItem.name}</strong> exitosamente.</span>
                            }
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            {classItem.dayOfWeek} a las {classItem.startTime}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    const msg = isWaitlistMode
                                        ? `Hola, me uní a la lista de espera para ${classItem.name} el ${classItem.dayOfWeek} a las ${classItem.startTime}. Soy ${formData.name}.`
                                        : `Hola, acabo de reservar para ${classItem.name} el ${classItem.dayOfWeek} a las ${classItem.startTime}. Soy ${formData.name}.`;
                                    window.open(`https://wa.me/${GYM_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#25D366] hover:bg-[#128C7E] text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                Confirmar por WhatsApp
                            </button>

                            <button
                                onClick={() => { onBookingSuccess(); onClose(); }}
                                className="w-full py-2.5 rounded-xl text-sm font-semibold btn-gradient text-white"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Form state */
                    <div className="p-6">
                        <div className="mb-5">
                            <h3 className="text-xl font-bold">{isWaitlistMode ? "Unirse a Lista de Espera" : `Reservar ${classItem.name}`}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{classItem.dayOfWeek} • {classItem.startTime}</p>
                            {isWaitlistMode && (
                                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-sm flex gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <span>La clase está llena. Únete a la lista de espera y te avisaremos si hay cupo.</span>
                                </div>
                            )}
                        </div>

                        {displayError && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4 animate-slide-down">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {displayError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Nombre Completo</label>
                                <Input name="name" value={formData.name} onChange={handleChange} required className="bg-background/50" maxLength={100} />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Correo Electrónico</label>
                                <Input type="email" name="email" value={formData.email} onChange={handleChange} required className="bg-background/50" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Edad</label>
                                <Input type="number" name="age" value={formData.age} onChange={handleChange} required min="10" max="119" className="bg-background/50" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Condiciones de Salud</label>
                                <textarea
                                    name="healthConditions"
                                    value={formData.healthConditions}
                                    onChange={handleChange}
                                    className="flex min-h-[80px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    placeholder="Opcional"
                                    maxLength={500}
                                />
                            </div>

                            {/* Reminder toggle */}
                            <label className="flex items-center gap-3 p-3 rounded-xl bg-background/30 border border-border/50 cursor-pointer select-none">
                                <div className={cn(
                                    "relative h-6 w-11 rounded-full transition-colors",
                                    wantsReminder ? "bg-primary" : "bg-secondary"
                                )} onClick={() => setWantsReminder(v => !v)}>
                                    <div className={cn(
                                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                                        wantsReminder && "translate-x-5"
                                    )} />
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Bell className="h-4 w-4 text-muted-foreground" />
                                    <span>{isWaitlistMode ? "Avisarme al correo si hay cupo" : "Recibir recordatorio antes de la clase"}</span>
                                </div>
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                                    loading
                                        ? "bg-secondary text-muted-foreground"
                                        : isWaitlistMode
                                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
                                            : "btn-gradient text-white"
                                )}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {isWaitlistMode ? "Uniendo..." : "Reservando..."}
                                    </span>
                                ) : (isWaitlistMode ? "Unirse a Lista de Espera" : "Confirmar Reserva")}
                            </button>

                            {/* Privacy disclaimer */}
                            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                                <Shield className="h-3 w-3" />
                                Tus datos se usan solo para gestionar tu reserva y no se comparten con terceros.
                            </p>
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
