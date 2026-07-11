import React, { useState, useEffect } from "react";
import { Activity, CourseType, TermType, TopicType, DifficultyType } from "../types";
import { Award, X, AlertCircle } from "lucide-react";

interface ActivityFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Activity, "id" | "teacherId" | "teacherName" | "teacherEmail" | "createdAt" | "updatedAt">) => void;
  activity?: Activity;
  loading?: boolean;
}

const COURSES: CourseType[] = ["1º ESO", "2º ESO", "3º ESO", "4º ESO", "1º Bachillerato", "2º Bachillerato", "Otro"];
const TERMS: TermType[] = ["1º Trimestre", "2º Trimestre", "3º Trimestre"];
const TOPICS: TopicType[] = [
  "Aritmética", 
  "Álgebra", 
  "Geometría", 
  "Funciones", 
  "Estadística y Probabilidad", 
  "Lógica", 
  "Resolución de Problemas", 
  "Otro"
];
const DIFFICULTIES: DifficultyType[] = ["Muy fácil", "Fácil", "Media", "Difícil", "Muy difícil"];

export default function ActivityForm({ onClose, onSubmit, activity, loading = false }: ActivityFormProps) {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<TopicType>("Aritmética");
  const [course, setCourse] = useState<CourseType>("1º ESO");
  const [term, setTerm] = useState<TermType>("1º Trimestre");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [url, setUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number>(55);
  const [studentsCount, setStudentsCount] = useState<number>(25);
  const [evaluation, setEvaluation] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyType>("Media");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (activity) {
      setTitle(activity.title || "");
      setTopic(activity.topic || "Aritmética");
      setCourse(activity.course || "1º ESO");
      setTerm(activity.term || "1º Trimestre");
      setDate(activity.date || new Date().toISOString().split("T")[0]);
      setUrl(activity.url || "");
      setDurationMinutes(activity.durationMinutes ?? 55);
      setStudentsCount(activity.studentsCount ?? 25);
      setEvaluation(activity.evaluation || "");
      setDifficulty(activity.difficulty || "Media");
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate lengths
    if (title.trim().length < 3 || title.trim().length > 100) {
      setValidationError("El título debe tener entre 3 y 100 caracteres.");
      return;
    }
    if (url.trim() && url.trim().length > 500) {
      setValidationError("El enlace del recurso no puede superar los 500 caracteres.");
      return;
    }
    if (evaluation.trim() && evaluation.trim().length > 2000) {
      setValidationError("La evaluación o comentarios no pueden superar los 2000 caracteres.");
      return;
    }

    onSubmit({
      title: title.trim(),
      topic,
      course,
      term,
      date,
      url: url.trim() || undefined,
      durationMinutes: Number(durationMinutes) >= 0 ? Number(durationMinutes) : 0,
      studentsCount: Number(studentsCount) >= 0 ? Number(studentsCount) : 0,
      evaluation: evaluation.trim() || undefined,
      difficulty
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-sky-700 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold flex items-center gap-2">
            <Award className="h-5 w-5" />
            {activity ? "Modificar Actividad" : "Registrar Nueva Actividad"}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-sky-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {validationError && (
            <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-semibold">{validationError}</div>
            </div>
          )}

          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Título de la Actividad *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Torneo de problemas lógicos"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Bloque de Contenido *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as TopicType)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Curso / Nivel *
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value as CourseType)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Trimestre *
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as TermType)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Fecha de Realización *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Duración (Minutos) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Nº Alumnos Participantes *
              </label>
              <input
                type="number"
                min={0}
                required
                value={studentsCount}
                onChange={(e) => setStudentsCount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Enlace al Material / Recurso (opcional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Dificultad Estimada *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Observaciones y Comentarios de la Actividad
              </label>
              <textarea
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                placeholder="Describe la resolución de problemas lógicos, el nivel de asimilación del alumnado y conclusiones pedagógicas..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : activity ? "Actualizar Actividad" : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
