import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { auth, isAuthorizedTeacherEmail } from "../lib/firebase";
import { LogIn, UserPlus, GraduationCap, ShieldAlert, BookOpen, Calculator, HelpCircle } from "lucide-react";

interface TeacherAuthProps {
  onSuccess: () => void;
}

export default function TeacherAuth({ onSuccess }: TeacherAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Matemáticas");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim();

    // Enforce email domain validation
    if (!isAuthorizedTeacherEmail(cleanEmail)) {
      setError(
        "Acceso denegado: El correo electrónico debe pertenecer al dominio oficial docente de Andalucía (@g.educaand.es o @juntadeandalucia.es). Para pruebas, puedes usar un correo @gmail.com."
      );
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError("Por favor, introduce tu nombre completo.");
          setLoading(false);
          return;
        }

        // 1. Create firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        // 2. Set profile name and custom attributes (stored in profile or metadata)
        await updateProfile(user, {
          displayName: `${name.trim()} (${department})`
        });

      } else {
        // Sign in
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let errMsg = "Error al autenticar. Por favor, comprueba tus credenciales.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "El correo ya está registrado por otro docente.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "La contraseña debe tener al menos 6 caracteres.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errMsg = "Credenciales incorrectas o usuario inexistente.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative">
        
        {/* Andalusia Top Accent Bar */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 w-full" />

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-700 rounded-full mb-3">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-950 tracking-tight">
              Planes IES Andalucía
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Lecturas y Razonamiento Matemático
            </p>
          </div>

          {/* Teacher Access Restriction Notice */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl text-xs text-emerald-800 mb-6 flex items-start gap-2.5">
            <GraduationCap className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Acceso restringido a docentes:</span> Es necesario registrarse con el correo oficial <span className="font-semibold">@g.educaand.es</span> o <span className="font-semibold">@juntadeandalucia.es</span> para participar en la gestión real del centro.
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs text-rose-800 mb-5 flex items-start gap-2.5">
              <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Profesor Juan Pérez"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Departamento
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
                  >
                    <option value="Matemáticas">Matemáticas</option>
                    <option value="Física y Química">Física y Química</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Biología y Geología">Biología y Geología</option>
                    <option value="Otro">Otro Departamento</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@g.educaand.es"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-700/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" /> Registrar Cuenta Docente
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Iniciar Sesión Docente
                </>
              )}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
            >
              {isSignUp
                ? "¿Ya tienes una cuenta registrada? Inicia Sesión"
                : "¿Eres un nuevo docente en el centro? Regístrate aquí"}
            </button>
          </div>

          {/* Sandbox Info Toggle */}
          <div className="mt-8 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setShowDemoInfo(!showDemoInfo)}
              className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <HelpCircle className="h-4 w-4 text-gray-400" />
                Información para demostración y pruebas
              </span>
              <span>{showDemoInfo ? "Ocultar" : "Mostrar"}</span>
            </button>

            {showDemoInfo && (
              <div className="mt-2 bg-gray-50 border border-gray-100 p-3 rounded-lg text-xs text-gray-500 space-y-1.5 leading-relaxed">
                <p>
                  Para propósitos de prueba e inspección de la aplicación, está habilitado el registro con correos de tipo <span className="font-semibold text-gray-700">@gmail.com</span>.
                </p>
                <p>
                  En producción, los docentes deben usar sus cuentas oficiales de la Consejería de Desarrollo Educativo y Formación Profesional de la Junta de Andalucía (<span className="font-semibold text-emerald-700">@g.educaand.es</span>).
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
