export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'student';
  lastLogin?: number;
}

export interface UserProgress {
  completedLessons: string[];
  lastLessonId?: string;
  updatedAt: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  quiz?: Question[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  title: string;
  description: string;
  modules: Module[];
}
