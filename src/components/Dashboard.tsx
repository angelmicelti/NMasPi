import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { Reading, Activity, CourseType, TermType, TopicType } from "../types";
import { 
  BookOpen, 
  Award, 
  BarChart3, 
  LogOut, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  CheckCircle2, 
  BookOpenCheck,
  Star,
  RefreshCw,
  Users
} from "lucide-react";
import ReadingForm from "./ReadingForm";
import ActivityForm from "./ActivityForm";
import StatsDashboard from "./StatsDashboard";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"readings" | "activities" | "stats">("readings");
  
  // Real-time states
  const [readings, setReadings] = useState<Reading[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTerm, setFilterTerm] = useState<"Todos" | TermType>("Todos");
  const [filterCourse, setFilterCourse] = useState<"Todos" | CourseType>("Todos");
  const [filterTeacher, setFilterTeacher] = useState<"Todos" | "MisRegistros">("Todos");
  const [filterTopic, setFilterTopic] = useState<"Todos" | TopicType>("Todos");

  // Modals state
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | undefined>(undefined);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined);
  const [actionLoading, setActionLoading] = useState(false);

  // Logged in user info
  const currentUser = auth.currentUser;
  const teacherName = currentUser?.displayName?.split(" (")[0] || currentUser?.email?.split("@")[0] || "Docente";
  const teacherDepartment = currentUser?.displayName?.includes(" (") 
    ? currentUser.displayName.split(" (")[1].replace(")", "") 
    : "Matemáticas";

  // Subscribe to Readings collection in real-time
  useEffect(() => {
    setReadingsLoading(true);
    const path = "readings";
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const readingsList: Reading[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          readingsList.push({
            id: docSnap.id,
            ...data
          } as Reading);
        });
        // Sort by date descending
        readingsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setReadings(readingsList);
        setReadingsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setReadingsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Subscribe to Activities collection in real-time
  useEffect(() => {
    setActivitiesLoading(true);
    const path = "activities";
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const activitiesList: Activity[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          activitiesList.push({
            id: docSnap.id,
            ...data
          } as Activity);
        });
        // Sort by date descending
        activitiesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivities(activitiesList);
        setActivitiesLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        setActivitiesLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch(console.error);
  };

  // CREATE OR UPDATE READING
  const handleReadingSubmit = async (formData: Omit<Reading, "id" | "teacherId" | "teacherName" | "teacherEmail" | "createdAt" | "updatedAt">) => {
    if (!currentUser) return;
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        teacherId: currentUser.uid,
        teacherName: teacherName,
        teacherEmail: currentUser.email || "",
        updatedAt: serverTimestamp()
      };

      if (editingReading) {
        // Edit mode
        const docRef = doc(db, "readings", editingReading.id);
        await updateDoc(docRef, payload);
      } else {
        // Create mode
        const collRef = collection(db, "readings");
        await addDoc(collRef, {
          ...payload,
          createdAt: serverTimestamp()
        });
      }

      setShowReadingForm(false);
      setEditingReading(undefined);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la lectura. Asegúrate de tener los permisos correctos en tu base de datos de Firebase.");
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE READING
  const handleReadingDelete = async (readingId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro de lectura? Esta acción no se puede deshacer.")) return;
    
    try {
      await deleteDoc(doc(db, "readings", readingId));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la lectura.");
    }
  };

  // CREATE OR UPDATE ACTIVITY
  const handleActivitySubmit = async (formData: Omit<Activity, "id" | "teacherId" | "teacherName" | "teacherEmail" | "createdAt" | "updatedAt">) => {
    if (!currentUser) return;
    setActionLoading(true);

    try {
      const payload = {
        ...formData,
        teacherId: currentUser.uid,
        teacherName: teacherName,
        teacherEmail: currentUser.email || "",
        updatedAt: serverTimestamp()
      };

      if (editingActivity) {
        // Edit mode
        const docRef = doc(db, "activities", editingActivity.id);
        await updateDoc(docRef, payload);
      } else {
        // Create mode
        const collRef = collection(db, "activities");
        await addDoc(collRef, {
          ...payload,
          createdAt: serverTimestamp()
        });
      }

      setShowActivityForm(false);
      setEditingActivity(undefined);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la actividad. Asegúrate de tener los permisos correctos en tu base de datos de Firebase.");
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE ACTIVITY
  const handleActivityDelete = async (activityId: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro de actividad? Esta acción no se puede deshacer.")) return;

    try {
      await deleteDoc(doc(db, "activities", activityId));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la actividad.");
    }
  };

  // FILTERED LISTS
  const filteredReadings = readings.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTerm = filterTerm === "Todos" || r.term === filterTerm;
    const matchesCourse = filterCourse === "Todos" || r.course === filterCourse;
    const matchesTeacher = filterTeacher === "Todos" || r.teacherId === currentUser?.uid;
    return matchesSearch && matchesTerm && matchesCourse && matchesTeacher;
  });

  const filteredActivities = activities.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTerm = filterTerm === "Todos" || a.term === filterTerm;
    const matchesCourse = filterCourse === "Todos" || a.course === filterCourse;
    const matchesTeacher = filterTeacher === "Todos" || a.teacherId === currentUser?.uid;
    const matchesTopic = filterTopic === "Todos" || a.topic === filterTopic;
    return matchesSearch && matchesTerm && matchesCourse && matchesTeacher && matchesTopic;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Real-time sync connection banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-900 text-xs gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
          <p className="font-medium">
            <span className="font-bold">Sincronización Activa:</span> Conectado a la base de datos de Firebase en tiempo real. Todos los cambios son dinámicos e instantáneos.
          </p>
        </div>
        <div className="text-gray-400 flex items-center gap-1">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          <span className="font-semibold text-emerald-700">Tiempo Real</span>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-emerald-700 text-white rounded-2xl shadow-md">
            <User className="h-6 w-6" />
          </div>
          <div>
            <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
              Docente Conectado
            </span>
            <h2 className="text-xl font-black text-gray-950 mt-1 leading-tight">
              Prof. {teacherName}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Dpto. {teacherDepartment} • {currentUser?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="px-4 py-2.5 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-700 font-bold rounded-xl text-xs transition-all border border-gray-100 hover:border-rose-100 flex items-center gap-2 cursor-pointer self-stretch md:self-auto justify-center"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => { setActiveTab("readings"); setSearchQuery(""); }}
          className={`px-5 py-3.5 font-bold text-sm transition-all flex items-center gap-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "readings"
              ? "border-emerald-700 text-emerald-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Lecturas Matemáticas
          <span className="ml-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {readings.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab("activities"); setSearchQuery(""); }}
          className={`px-5 py-3.5 font-bold text-sm transition-all flex items-center gap-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "activities"
              ? "border-sky-700 text-sky-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Award className="h-4 w-4" />
          Actividades de Razonamiento
          <span className="ml-1 bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {activities.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`px-5 py-3.5 font-bold text-sm transition-all flex items-center gap-2.5 border-b-2 whitespace-nowrap cursor-pointer ${
            activeTab === "stats"
              ? "border-violet-700 text-violet-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Estadísticas y Reportes
        </button>
      </div>

      {/* Main Container */}
      {activeTab !== "stats" && (
        <div className="space-y-6">
          {/* Filters card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full lg:max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, autor o profesor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-gray-50/50"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={() => activeTab === "readings" ? setShowReadingForm(true) : setShowActivityForm(true)}
                className={`w-full lg:w-auto px-5 py-2.5 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer ${
                  activeTab === "readings" 
                    ? "bg-emerald-700 hover:bg-emerald-800" 
                    : "bg-sky-700 hover:bg-sky-800"
                }`}
              >
                <Plus className="h-4 w-4" />
                {activeTab === "readings" ? "Registrar Lectura" : "Registrar Actividad"}
              </button>
            </div>

            {/* Select filters inline grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-gray-100">
              
              {/* Trimestre filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Trimestre
                </label>
                <select
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden"
                >
                  <option value="Todos">Todos</option>
                  <option value="1º Trimestre">1º Trimestre</option>
                  <option value="2º Trimestre">2º Trimestre</option>
                  <option value="3º Trimestre">3º Trimestre</option>
                </select>
              </div>

              {/* Curso filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Curso / Nivel
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden"
                >
                  <option value="Todos">Todos los niveles</option>
                  <option value="1º ESO">1º ESO</option>
                  <option value="2º ESO">2º ESO</option>
                  <option value="3º ESO">3º ESO</option>
                  <option value="4º ESO">4º ESO</option>
                  <option value="1º Bachillerato">1º Bachillerato</option>
                  <option value="2º Bachillerato">2º Bachillerato</option>
                  <option value="Otro">Otro nivel</option>
                </select>
              </div>

              {/* Teacher ownership filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                  Autoría
                </label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden"
                >
                  <option value="Todos">Todos los profesores</option>
                  <option value="MisRegistros">Mis registros únicamente</option>
                </select>
              </div>

              {/* Topic filter for Activities only */}
              {activeTab === "activities" && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Bloque matemático
                  </label>
                  <select
                    value={filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-hidden"
                  >
                    <option value="Todos">Todos los bloques</option>
                    <option value="Aritmética">Aritmética</option>
                    <option value="Álgebra">Álgebra</option>
                    <option value="Geometría">Geometría</option>
                    <option value="Funciones">Funciones</option>
                    <option value="Estadística y Probabilidad">Estadística y Probabilidad</option>
                    <option value="Lógica">Lógica</option>
                    <option value="Resolución de Problemas">Resolución de Problemas</option>
                    <option value="Otro">Otros temas</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* List display */}
          {activeTab === "readings" ? (
            readingsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white rounded-2xl border border-gray-100">
                <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Cargando lecturas matemáticas en tiempo real...</p>
              </div>
            ) : filteredReadings.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500">
                <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-base font-bold text-gray-700">No se encontraron lecturas</p>
                <p className="text-xs text-gray-400 mt-1">Prueba a cambiar tus filtros de búsqueda o registra una lectura nueva.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReadings.map((reading) => (
                  <div 
                    key={reading.id} 
                    className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top bar of card */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                          {reading.course}
                        </span>
                        <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {reading.date}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-gray-950 line-clamp-2 leading-snug">
                          {reading.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 italic font-medium">
                          Por {reading.author}
                        </p>
                      </div>

                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {reading.term}
                        </span>
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          Dpto. {reading.department}
                        </span>
                        {reading.studentsCount !== undefined && (
                          <span className="bg-sky-50 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {reading.studentsCount} Alumnos
                          </span>
                        )}
                      </div>

                      {/* Evaluation Text if present */}
                      {reading.evaluation && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/80 mt-2 text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
                          <p className="font-bold text-gray-700 mb-0.5">Observaciones:</p>
                          {reading.evaluation}
                        </div>
                      )}
                    </div>

                    {/* Bottom bar of card */}
                    <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1.5 bg-white text-gray-500 rounded-lg border border-gray-100">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Profesor/a</p>
                          <p className="text-xs font-bold text-gray-700 leading-tight mt-0.5 truncate max-w-[120px]" title={reading.teacherName}>
                            {reading.teacherName}
                          </p>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2">
                        {reading.url && (
                          <a 
                            href={reading.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Ver Recurso"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        {/* Edit/Delete only for author */}
                        {reading.teacherId === currentUser?.uid && (
                          <>
                            <button
                              onClick={() => { setEditingReading(reading); setShowReadingForm(true); }}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar lectura"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReadingDelete(reading.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar lectura"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // ACTIVITIES TAB LIST
            activitiesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white rounded-2xl border border-gray-100">
                <div className="w-8 h-8 border-3 border-sky-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Cargando actividades matemáticas en tiempo real...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500">
                <Award className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-base font-bold text-gray-700">No se encontraron actividades</p>
                <p className="text-xs text-gray-400 mt-1">Prueba a cambiar tus filtros de búsqueda o registra una actividad nueva.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="bg-white rounded-2xl border border-gray-100 hover:border-sky-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top bar of card */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-sky-50 text-sky-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                          {activity.course}
                        </span>
                        <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {activity.date}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-gray-950 line-clamp-2 leading-snug">
                          {activity.title}
                        </h4>
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1">
                          Bloque: {activity.topic}
                        </span>
                      </div>

                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        <span className="bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {activity.term}
                        </span>
                        {activity.durationMinutes !== undefined && (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {activity.durationMinutes} min
                          </span>
                        )}
                        {activity.difficulty && (
                          <span className="bg-violet-50 text-violet-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            Dificultad: {activity.difficulty}
                          </span>
                        )}
                        {activity.studentsCount !== undefined && (
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {activity.studentsCount} Alumnos
                          </span>
                        )}
                      </div>

                      {/* Evaluation Text if present */}
                      {activity.evaluation && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100/80 mt-2 text-xs text-gray-600 leading-relaxed max-h-32 overflow-y-auto">
                          <p className="font-bold text-gray-700 mb-0.5">Evaluación:</p>
                          {activity.evaluation}
                        </div>
                      )}
                    </div>

                    {/* Bottom bar of card */}
                    <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1.5 bg-white text-gray-500 rounded-lg border border-gray-100">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Profesor/a</p>
                          <p className="text-xs font-bold text-gray-700 leading-tight mt-0.5 truncate max-w-[120px]" title={activity.teacherName}>
                            {activity.teacherName}
                          </p>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-2">
                        {activity.url && (
                          <a 
                            href={activity.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 text-sky-600 hover:text-sky-800 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Ver Recurso"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        {/* Edit/Delete only for author */}
                        {activity.teacherId === currentUser?.uid && (
                          <>
                            <button
                              onClick={() => { setEditingActivity(activity); setShowActivityForm(true); }}
                              className="p-1.5 text-gray-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar actividad"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleActivityDelete(activity.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar actividad"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <StatsDashboard readings={readings} activities={activities} />
      )}

      {/* Modals Form */}
      {showReadingForm && (
        <ReadingForm
          onClose={() => { setShowReadingForm(false); setEditingReading(undefined); }}
          onSubmit={handleReadingSubmit}
          reading={editingReading}
          defaultDepartment={teacherDepartment}
          loading={actionLoading}
        />
      )}

      {showActivityForm && (
        <ActivityForm
          onClose={() => { setShowActivityForm(false); setEditingActivity(undefined); }}
          onSubmit={handleActivitySubmit}
          activity={editingActivity}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
