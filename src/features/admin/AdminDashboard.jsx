import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAdminActions } from "./hooks/useAdminActions";
import { useClasses } from "../schedule/hooks/useClasses";
import { ClassEditor } from "./components/ClassEditor";
import { Button } from "../../components/ui/Button";
import { WEEKDAYS } from "../../lib/constants";
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, LogOut } from "lucide-react";

export function AdminDashboard() {
    const { classes, loading: classesLoading } = useClasses();
    const { addClass, deleteClass, updateClass } = useAdminActions();
    const [isEditing, setIsEditing] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [expandedDay, setExpandedDay] = useState(null);

    const handleCreate = async (data) => {
        await addClass(data);
        setIsEditing(false);
    };

    const handleUpdate = async (data) => {
        const { id, ...updates } = data;
        await updateClass(id, updates);
        setEditingClass(null);
        setIsEditing(false);
    };

    const handleDelete = async (id) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta clase?")) {
            await deleteClass(id);
        }
    };

    if (classesLoading) {
        return (
            <div className="container max-w-screen-xl mx-auto px-4 py-16">
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Cargando horario...
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-screen-xl mx-auto px-4 md:px-6 py-8 space-y-6 page-enter">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
                    <p className="text-muted-foreground text-sm mt-1">{classes.length} clases programadas</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setEditingClass(null); setIsEditing(true); }}
                        className="btn-gradient text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Agregar Clase
                    </button>
                    <button
                        onClick={() => signOut(auth)}
                        className="px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Salir
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="glass-strong rounded-2xl p-6 animate-scale-in">
                    <ClassEditor
                        initialData={editingClass || {}}
                        onSave={editingClass ? handleUpdate : handleCreate}
                        onCancel={() => { setIsEditing(false); setEditingClass(null); }}
                    />
                </div>
            )}

            <div className="space-y-3">
                {WEEKDAYS.map(day => {
                    const dayClasses = classes.filter(c => c.dayOfWeek === day);
                    const isExpanded = expandedDay === day || expandedDay === null;

                    return (
                        <div key={day} className="glass-card rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                                className="w-full flex items-center justify-between p-4 hover:bg-accent/20 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-bold">{day}</h2>
                                    <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {dayClasses.length} clases
                                    </span>
                                </div>
                                {isExpanded
                                    ? <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                            </button>

                            {isExpanded && dayClasses.length > 0 && (
                                <div className="px-4 pb-4 space-y-2 animate-slide-down">
                                    {dayClasses.map(cls => (
                                        <div
                                            key={cls.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-mono text-primary font-bold w-14">{cls.startTime}</div>
                                                <div>
                                                    <div className="font-semibold text-sm">{cls.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {cls.instructor} • {cls.durationMinutes}min • {cls.bookedCount}/{cls.capacity} reservas
                                                        {cls.waitlistCount > 0 && <span className="ml-2 text-amber-500 font-medium">• {cls.waitlistCount} en espera</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditingClass(cls); setIsEditing(true); }}
                                                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cls.id)}
                                                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                {classes.length === 0 && (
                    <div className="text-center text-muted-foreground py-16 glass rounded-2xl">
                        Aún no hay clases programadas. ¡Agrega una!
                    </div>
                )}
            </div>
        </div>
    );
}
