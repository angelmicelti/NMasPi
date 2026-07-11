import React, { useState, useEffect } from "react";
import { Reading, CourseType, TermType } from "../types";
import { BookOpen, X, AlertCircle } from "lucide-react";

interface ReadingFormProps {
  onClose: () => void;
  onSubmit: (data: Omit<Reading, "id" | "teacherId" | "teacherName" | "teacherEmail" | "createdAt" | "updatedAt">) => void;
  reading?: Reading;
  defaultDepartment?: string;
  loading?: boolean;
}

const COURSES: CourseType[] = ["1º ESO", "2º ESO", "3º ESO", "4º ESO", "1º Bachillerato", "2º Bachillerato", "Otro"];
const TERMS: TermType[] = ["1º Trimestre", "2º Trimestre", "3º Trimestre"];

export default function ReadingForm({ onClose, onSubmit, reading, defaultDepartment = "Matemáticas", loading = false }: ReadingFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [course, setCourse] = useState<CourseType>("1º ESO");
  const [department, setDepartment] = useState(defaultDepartment);
  const [term, setTerm] = useState<TermType>("1º Trimestre");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [url, setUrl] = useState("");
  const [studentsCount, setStudentsCount] = useState<number>(25);
  const [evaluation, setEvaluation] = useState("");
  const [rating, setRating] = useState<number>(4);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (reading) {
      setTitle(reading.title || "");
      setAuthor(reading.author || "");
      setCourse(reading.course || "1º ESO");
      setDepartment(reading.department || defaultDepartment);
      setTerm(reading.term || "1º Trimestre");
      setDate(reading.date || new Date().toISOString().split("T")[0]);
      setUrl(reading.url || "");
      setStudentsCount(reading.studentsCount ?? 25);
      setEvaluation(reading.evaluation || "");
      setRating(reading.rating ?? 4);
    }
  }, [reading, defaultDepartment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate lengths
    if (title.trim().length < 3 || title.trim().length > 100) {
      setValidationError("El título debe tener entre 3 y 100 caracteres.");
      return;
    }
    if (author.trim().length < 3 || author.trim().length > 100) {
      setValidationError("El autor debe tener entre 3 y 100 caracteres.");
      return;
    }
    if (department.trim().length < 2 || department.trim().length > 50) {
      setValidationError("El departamento debe tener entre 2 y 50 caracteres.");
      return;
    }
    if (url.trim() && url.trim().length > 500) {
      setValidationError("El enlace del recurso no puede superar los 500 caracteres.");
      return;
    }
    if (evaluation.trim() && evaluation.trim().length > 2000) {
      setValidationError("Los comentarios o evaluación no pueden superar los 2000 caracteres.");
      return;
    }

    onSubmit({
      title: title.trim(),
      author: author.trim(),
      course,
      department: department.trim(),
      term,
      date,
      url: url.trim() || undefined,
      studentsCount: Number(studentsCount) >= 0 ? Number(studentsCount) : 0,
      evaluation: evaluation.trim() || undefined,
      rating: Number(rating)
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {reading ? "Modificar Lectura" : "Registrar Nueva Lectura"}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
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
                Título de la Lectura *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. El diablo de los números"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Autor de la Lectura *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ej. Hans Magnus Enzensberger"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Curso / Nivel *
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value as CourseType)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Departamento responsable *
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ej. Matemáticas"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Nº Alumnos Participantes
              </label>
              <input
                type="number"
                min={0}
                value={studentsCount}
                onChange={(e) => setStudentsCount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Valoración / Evaluación del Alumnado
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value={5}>Excelente (5 Estrellas)</option>
                <option value={4}>Muy Buena (4 Estrellas)</option>
                <option value={3}>Buena / Adecuada (3 Estrellas)</option>
                <option value={2}>Mejorable (2 Estrellas)</option>
                <option value={1}>No recomendada (1 Estrella)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Observaciones y Comentarios Pedagógicos
              </label>
              <textarea
                value={evaluation}
                onChange={(e) => setEvaluation(e.target.value)}
                placeholder="Escribe comentarios sobre cómo reaccionó el grupo, la dificultad de la lectura o ideas para el próximo año..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
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
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : reading ? "Actualizar Lectura" : "Guardar Registro"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
