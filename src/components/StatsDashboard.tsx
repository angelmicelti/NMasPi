import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Reading, Activity } from "../types";
import { BookOpen, Award, BarChart3, PieChartIcon, CheckSquare } from "lucide-react";

interface StatsDashboardProps {
  readings: Reading[];
  activities: Activity[];
}

const COLORS = ["#059669", "#0284c7", "#ea580c", "#84cc16", "#e11d48", "#7c3aed", "#2563eb", "#db2777"];

export default function StatsDashboard({ readings, activities }: StatsDashboardProps) {
  // Stats calculations
  const stats = useMemo(() => {
    const totalReadings = readings.length;
    const totalActivities = activities.length;
    const totalRecords = totalReadings + totalActivities;

    // 1. Distribution by Term (Trimestre)
    const termMap: { [key: string]: { lecturas: number; actividades: number; total: number } } = {
      "1º Trimestre": { lecturas: 0, actividades: 0, total: 0 },
      "2º Trimestre": { lecturas: 0, actividades: 0, total: 0 },
      "3º Trimestre": { lecturas: 0, actividades: 0, total: 0 }
    };

    readings.forEach(r => {
      if (termMap[r.term]) {
        termMap[r.term].lecturas++;
        termMap[r.term].total++;
      }
    });

    activities.forEach(a => {
      if (termMap[a.term]) {
        termMap[a.term].actividades++;
        termMap[a.term].total++;
      }
    });

    const termData = Object.keys(termMap).map(key => ({
      name: key,
      Lecturas: termMap[key].lecturas,
      Actividades: termMap[key].actividades,
      Total: termMap[key].total
    }));

    // 2. Distribution by Course
    const courses = ["1º ESO", "2º ESO", "3º ESO", "4º ESO", "1º Bachillerato", "2º Bachillerato", "Otro"];
    const courseData = courses.map(course => {
      const lecturasCount = readings.filter(r => r.course === course).length;
      const actividadesCount = activities.filter(a => a.course === course).length;
      return {
        name: course,
        Lecturas: lecturasCount,
        Actividades: actividadesCount,
        Total: lecturasCount + actividadesCount
      };
    }).filter(d => d.Total > 0);

    // 3. Distribution by Topic (for activities)
    const topicMap: { [key: string]: number } = {};
    activities.forEach(a => {
      topicMap[a.topic] = (topicMap[a.topic] || 0) + 1;
    });

    const topicData = Object.keys(topicMap).map(key => ({
      name: key,
      value: topicMap[key]
    }));

    // 4. Participant stats
    const totalStudentsInReadings = readings.reduce((sum, r) => sum + (r.studentsCount || 0), 0);
    const totalStudentsInActivities = activities.reduce((sum, a) => sum + (a.studentsCount || 0), 0);

    return {
      totalReadings,
      totalActivities,
      totalRecords,
      termData,
      courseData,
      topicData,
      totalStudentsInReadings,
      totalStudentsInActivities
    };
  }, [readings, activities]);

  return (
    <div id="stats-dashboard" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Lecturas</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReadings}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{stats.totalStudentsInReadings} alumnos alcanzados</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-sky-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Actividades</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalActivities}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{stats.totalStudentsInActivities} alumnos alcanzados</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-violet-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registros Totales</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalRecords}</h3>
            <p className="text-xs text-gray-400 mt-0.5">En toda la base de datos</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-100 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <PieChartIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alumnos Totales</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {stats.totalStudentsInReadings + stats.totalStudentsInActivities}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Participación acumulada</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Term Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
          <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Distribución por Trimestre
          </h4>
          <div className="h-72 w-full">
            {readings.length === 0 && activities.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Sin datos para mostrar gráficos
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.termData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Lecturas" fill="#059669" name="Lecturas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actividades" fill="#0284c7" name="Actividades" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Level / Course Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs">
          <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-sky-600" />
            Registros por Nivel Educativo
          </h4>
          <div className="h-72 w-full">
            {stats.courseData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Sin datos para mostrar gráficos
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.courseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="Total" fill="#6366f1" name="Registros Totales" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Topic Distribution */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs lg:col-span-2">
          <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-amber-600" />
            Actividades por Bloque de Contenido Matemático
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-64 w-full">
              {stats.topicData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Registra actividades para ver bloques
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.topicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            {/* Topic Legend List */}
            <div className="space-y-2">
              {stats.topicData.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Registra actividades para ver el desglose.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {stats.topicData.map((topic, index) => (
                    <div key={topic.name} className="flex items-center space-x-2 text-sm text-gray-700">
                      <div 
                        className="w-3.5 h-3.5 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate font-medium">{topic.name}:</span>
                      <span className="text-gray-500 font-semibold">({topic.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
