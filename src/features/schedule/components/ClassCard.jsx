import React, { useMemo } from "react";
import { Button } from "../../../components/ui/Button";
import { cn } from "../../../lib/utils";
import { Clock, Users, Timer } from "lucide-react";

// Class type icon/color mapping
const CLASS_STYLES = {
    "Yoga": { emoji: "🧘", accent: "from-violet-500/20 to-purple-600/10", bar: "bg-violet-500" },
    "Spinning": { emoji: "🚴", accent: "from-cyan-500/20 to-blue-600/10", bar: "bg-cyan-500" },
    "Boxeo": { emoji: "🥊", accent: "from-red-500/20 to-orange-600/10", bar: "bg-red-500" },
    "TRX": { emoji: "💪", accent: "from-amber-500/20 to-yellow-600/10", bar: "bg-amber-500" },
    "Funcional": { emoji: "⚡", accent: "from-emerald-500/20 to-green-600/10", bar: "bg-emerald-500" },
    "Pilates": { emoji: "🤸", accent: "from-pink-500/20 to-rose-600/10", bar: "bg-pink-500" },
    "Baile": { emoji: "💃", accent: "from-fuchsia-500/20 to-purple-600/10", bar: "bg-fuchsia-500" },
    "STEP": { emoji: "🏃", accent: "from-teal-500/20 to-emerald-600/10", bar: "bg-teal-500" },
};

function getClassStyle(name) {
    return CLASS_STYLES[name] || { emoji: "🏋️", accent: "from-blue-500/20 to-indigo-600/10", bar: "bg-blue-500" };
}

function CountdownTimer({ startTime, dayOfWeek }) {
    const countdown = useMemo(() => {
        const now = new Date();
        const dayMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const todayName = dayMap[now.getDay()];

        if (todayName !== dayOfWeek) return null;

        const [hours, minutes] = startTime.split(":").map(Number);
        const classTime = new Date(now);
        classTime.setHours(hours, minutes, 0, 0);

        const diff = classTime - now;
        if (diff <= 0 || diff > 12 * 60 * 60 * 1000) return null;

        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { hours: h, minutes: m };
    }, [startTime, dayOfWeek]);

    if (!countdown) return null;

    return (
        <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            <Timer className="h-3 w-3" />
            <span>En {countdown.hours > 0 ? `${countdown.hours}h ` : ""}{countdown.minutes}min</span>
        </div>
    );
}

export function ClassCard({ classItem, onBook }) {
    const { bookedCount, capacity } = classItem;
    const isFull = bookedCount >= capacity;
    const isAlmostFull = !isFull && bookedCount >= capacity * 0.8;
    const spotsRemaining = capacity - bookedCount;
    const fillPercent = (bookedCount / capacity) * 100;
    const style = getClassStyle(classItem.name);

    return (
        <div className={cn(
            "glass-card rounded-2xl overflow-hidden group",
            isFull && "opacity-50"
        )}>
            {/* Top accent gradient */}
            <div className={cn("h-1 bg-gradient-to-r", style.accent.replace("/20", "").replace("/10", ""))} />

            <div className="p-5">
                {/* Header row */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "h-11 w-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br",
                            style.accent,
                            "group-hover:scale-110 transition-transform duration-300"
                        )}>
                            {style.emoji}
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">{classItem.name}</h3>
                            <p className="text-sm text-muted-foreground">{classItem.instructor}</p>
                        </div>
                    </div>
                    <CountdownTimer startTime={classItem.startTime} dayOfWeek={classItem.dayOfWeek} />
                </div>

                {/* Info chips */}
                <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{classItem.startTime}</span>
                    </div>
                    <span className="text-border">•</span>
                    <span>{classItem.durationMinutes} min</span>
                    <span className="text-border">•</span>
                    <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{bookedCount}/{capacity}</span>
                    </div>
                </div>

                {/* Capacity bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className={cn(
                            "font-semibold",
                            isFull ? "text-destructive" : isAlmostFull ? "text-orange-400" : "text-emerald-400"
                        )}>
                            {isFull ? "Clase Llena" : isAlmostFull ? "¡Últimos cupos!" : `${spotsRemaining} cupos disponibles`}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-1000 ease-out",
                                isFull ? "bg-destructive" : isAlmostFull ? "bg-gradient-to-r from-orange-400 to-amber-400" : cn("bg-gradient-to-r", "from-emerald-400 to-cyan-400")
                            )}
                            style={{ width: `${fillPercent}%` }}
                        />
                    </div>
                </div>

                {/* Book button */}
                <button
                    className={cn(
                        "w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg transform active:scale-95",
                        isFull
                            ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25"
                            : "btn-gradient text-white shadow-primary/25"
                    )}
                    onClick={() => onBook(classItem, isFull)}
                >
                    {isFull ? "Unirse a Lista de Espera" : "Reservar Cupo"}
                </button>
            </div>
        </div>
    );
}
