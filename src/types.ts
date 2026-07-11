export type CourseType = "1º ESO" | "2º ESO" | "3º ESO" | "4º ESO" | "1º Bachillerato" | "2º Bachillerato" | "Otro";

export type TermType = "1º Trimestre" | "2º Trimestre" | "3º Trimestre";

export type TopicType = 
  | "Aritmética" 
  | "Álgebra" 
  | "Geometría" 
  | "Funciones" 
  | "Estadística y Probabilidad" 
  | "Lógica" 
  | "Resolución de Problemas" 
  | "Otro";

export type DifficultyType = "Muy fácil" | "Fácil" | "Media" | "Difícil" | "Muy difícil";

export interface Reading {
  id: string;
  title: string;
  author: string;
  course: CourseType;
  department: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  term: TermType;
  date: string; // YYYY-MM-DD
  url?: string;
  studentsCount?: number;
  evaluation?: string;
  rating?: number; // 1 to 5
  createdAt?: string | any;
  updatedAt?: string | any;
}

export interface Activity {
  id: string;
  title: string;
  topic: TopicType;
  course: CourseType;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  term: TermType;
  date: string; // YYYY-MM-DD
  url?: string;
  durationMinutes?: number;
  studentsCount?: number;
  evaluation?: string;
  difficulty?: DifficultyType;
  createdAt?: string | any;
  updatedAt?: string | any;
}

export interface TeacherProfile {
  uid: string;
  name: string;
  email: string;
  department: string;
}
