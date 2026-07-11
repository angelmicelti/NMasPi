import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import TeacherAuth from "./components/TeacherAuth";
import Dashboard from "./components/Dashboard";
import { GraduationCap, BookOpen, Calculator, CalendarDays } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-700 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-emerald-700 animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-700 uppercase tracking-widest animate-pulse">
            Iniciando Plataforma Docente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col text-gray-900 font-sans">
      
      {/* Platform Branding Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-700 text-white rounded-xl shadow-xs">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-950 tracking-tight leading-none">
                Planes de Lectura y Razonamiento
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mt-0.5">
                I.E.S. Virgen de Valme
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-6 text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5 hover:text-emerald-700 transition">
              <BookOpen className="h-4 w-4" /> Lecturas
            </span>
            <span className="flex items-center gap-1.5 hover:text-sky-700 transition">
              <Calculator className="h-4 w-4" /> Razonamiento
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <CalendarDays className="h-4 w-4" /> Curso 2025/2026
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {user ? (
          <Dashboard />
        ) : (
          <TeacherAuth onSuccess={() => {}} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 text-center text-xs text-gray-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-gray-600">
            © {new Date().getFullYear()} I.E.S. Virgen de Valme — Junta de Andalucía
          </p>
          <div className="flex gap-4">
            <a href="https://blogsaverroes.juntadeandalucia.es/" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 font-bold transition">
              SeneS / Averroes
            </a>
            <span className="text-gray-300">•</span>
            <a href="https://www.juntadeandalucia.es/educacion/portals/web/ced" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 font-bold transition">
              Consejería de Desarrollo Educativo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
