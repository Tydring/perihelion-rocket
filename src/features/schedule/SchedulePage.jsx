import React, { useState, useMemo } from "react";
import { useClasses } from "./hooks/useClasses";
import { ClassCard } from "./components/ClassCard";
import { BookingModal } from "../booking/components/BookingModal";
import { WEEKDAYS, GYM_NAME } from "../../lib/constants";
import { cn } from "../../lib/utils";
import { Calendar, Dumbbell, Zap, Heart } from "lucide-react";

function HeroSection() {
    return (
        <section className="relative overflow-hidden hero-gradient py-16 md:py-24 -mx-4 md:-mx-6 px-4 md:px-6 mb-8">
            {/* Background glow orbs */}
            <div className="hero-glow w-72 h-72 bg-primary top-[-50px] left-[-50px]" />
            <div className="hero-glow w-96 h-96 bg-cyan-500 bottom-[-100px] right-[-100px]" style={{ animationDelay: "3s" }} />
            <div className="hero-glow w-48 h-48 bg-blue-400 top-[20%] right-[30%]" style={{ animationDelay: "1.5s" }} />

            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className="animate-fade-in">
                    <img
                        src="/logo.png"
                        alt={GYM_NAME}
                        className="mx-auto w-80 md:w-96 lg:w-[28rem] object-contain mb-4"
                    />
                </div>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
                    Tu bienestar empieza aquí. Reserva tu clase hoy.
                </p>

                {/* Stats row */}
                <div className="flex justify-center gap-8 md:gap-12 mt-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center">
                            <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-2xl font-bold">6</span>
                        <span className="text-xs text-muted-foreground">Días</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-emerald-400" />
                        </div>
                        <span className="text-2xl font-bold">23</span>
                        <span className="text-xs text-muted-foreground">Clases</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-10 w-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-rose-400" />
                        </div>
                        <span className="text-2xl font-bold">8</span>
                        <span className="text-xs text-muted-foreground">Disciplinas</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function DaySelector({ selectedDay, onSelectDay }) {
    return (
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar">
            {WEEKDAYS.map((day, i) => (
                <button
                    key={day}
                    onClick={() => onSelectDay(day)}
                    className={cn(
                        "relative flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                        selectedDay === day
                            ? "btn-gradient text-white shadow-lg"
                            : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                >
                    {day}
                </button>
            ))}
        </div>
    );
}

export function SchedulePage() {
    const [selectedDay, setSelectedDay] = useState(() => {
        // Auto-select today's day
        const dayMap = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const today = dayMap[new Date().getDay()];
        return WEEKDAYS.includes(today) ? today : WEEKDAYS[0];
    });
    const { classes, loading, error } = useClasses(selectedDay);
    const [selectedClass, setSelectedClass] = useState(null);

    return (
        <div>
            <HeroSection />

            <div className="container max-w-screen-xl mx-auto px-4 md:px-6 pb-12 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Horario Semanal</h2>
                        <p className="text-muted-foreground text-sm mt-1">Selecciona un día para ver las clases disponibles.</p>
                    </div>
                </div>

                <DaySelector selectedDay={selectedDay} onSelectDay={setSelectedDay} />

                {loading && (
                    <div className="flex justify-center py-16">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            Cargando horario...
                        </div>
                    </div>
                )}

                {!loading && !error && classes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center glass rounded-2xl animate-scale-in">
                        <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No hay clases para el {selectedDay}</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                            No hay clases programadas para este día. ¡Vuelve pronto!
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {classes.map((cls, i) => (
                        <div key={cls.id} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                            <ClassCard
                                classItem={cls}
                                onBook={setSelectedClass}
                            />
                        </div>
                    ))}
                </div>

                {selectedClass && (
                    <BookingModal
                        classItem={selectedClass}
                        onClose={() => setSelectedClass(null)}
                        onBookingSuccess={() => { }}
                    />
                )}
            </div>
        </div>
    );
}
