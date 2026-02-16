import React, { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { WEEKDAYS, TIME_SLOTS, CLASS_DURATION_OPTIONS } from "../../../lib/constants";

export function ClassEditor({ onSave, onCancel, initialData = {} }) {
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        instructor: initialData.instructor || "",
        dayOfWeek: initialData.dayOfWeek || WEEKDAYS[0],
        startTime: initialData.startTime || TIME_SLOTS[0],
        durationMinutes: initialData.durationMinutes || 60,
        capacity: initialData.capacity || 10,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            ...(initialData.id && { id: initialData.id }),
            durationMinutes: Number(formData.durationMinutes),
            capacity: Number(formData.capacity)
        });
    };

    const selectClass = "flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">{initialData.id ? "Editar Clase" : "Agregar Nueva Clase"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre de la Clase</label>
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="ej. Yoga" required className="bg-background/50" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Instructor</label>
                        <Input name="instructor" value={formData.instructor} onChange={handleChange} placeholder="Nombre del instructor" required className="bg-background/50" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Día</label>
                        <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className={selectClass}>
                            {WEEKDAYS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Hora</label>
                        <select name="startTime" value={formData.startTime} onChange={handleChange} className={selectClass}>
                            {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Duración</label>
                        <select name="durationMinutes" value={formData.durationMinutes} onChange={handleChange} className={selectClass}>
                            {CLASS_DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} min</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium">Capacidad</label>
                        <Input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min="1" required className="bg-background/50" />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" className="btn-gradient text-white px-5 py-2 rounded-xl text-sm font-semibold">
                        Guardar Clase
                    </button>
                </div>
            </form>
        </div>
    );
}
