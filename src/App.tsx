/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  X, 
  PlayCircle,
  Award,
  ArrowRight,
  GraduationCap,
  LogOut,
  LayoutDashboard,
  LayoutGrid,
  Home,
  Settings,
  Plus,
  Trash2,
  FileText,
  Upload,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { courseData } from './courseData';
import { Question, Course } from './types';
import { auth, db, storage } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, onValue, set, update } from 'firebase/database';
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import Certificate from './components/Certificate';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [courses, setCourses] = useState<Course[]>(courseData);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editPdfUrl, setEditPdfUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editQuiz, setEditQuiz] = useState<Question[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [userName, setUserName] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const isAdmin = user?.email === 'contato@adveasy.com.br';

  const selectedCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId) || courses[0],
  [courses, selectedCourseId]);

  useEffect(() => {
    // Load courses from Firebase
    const coursesRef = ref(db, 'courses');
    onValue(coursesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Handle both object and array from Firebase
        const coursesList = Array.isArray(data) ? data : Object.values(data);
        setCourses(coursesList as Course[]);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setAuthLoading(false);
      
      if (u) {
        const isAdmin = u.email === 'contato@adveasy.com.br';
        const userRef = ref(db, `users/${u.uid}`);
        
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          
          // If user doesn't exist in DB and is not admin, they were deleted
          if (!data && !isAdmin) {
            signOut(auth);
            setUser(null);
            return;
          }

          setUser(u);
          
          if (data) {
            if (data.name) setUserName(data.name);
            // Update last login
            update(userRef, {
              email: u.email,
              lastLogin: Date.now()
            });
          }

          if (data && data.progress && data.progress.completedLessons) {
            setCompletedLessons(data.progress.completedLessons);
          }
        }, { onlyOnce: true });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const saveProgress = (newCompleted: string[]) => {
    if (user) {
      set(ref(db, `users/${user.uid}/progress`), {
        completedLessons: newCompleted,
        updatedAt: Date.now()
      });
    }
  };

  const currentModule = selectedCourse?.modules?.[currentModuleIndex] || { title: '', lessons: [] };
  const currentLesson = currentModule?.lessons?.[currentLessonIndex] || { id: '', title: '', content: '' };

  const totalLessons = useMemo(() => {
    if (!selectedCourse?.modules) return 0;
    return selectedCourse.modules.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
  }, [selectedCourse]);

  const validCompletedLessons = useMemo(() => {
    if (!selectedCourse?.modules) return [];
    const allLessonIds = new Set(selectedCourse.modules.flatMap(m => (m.lessons || []).map(l => l.id)));
    return completedLessons.filter(id => allLessonIds.has(id));
  }, [completedLessons, selectedCourse]);

  const progress = useMemo(() => {
    if (totalLessons === 0) return 0;
    return (validCompletedLessons.length / totalLessons) * 100;
  }, [validCompletedLessons, totalLessons]);

  const handleNext = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < selectedCourse.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = selectedCourse.modules[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLessonCompletion = (lessonId: string) => {
    const newCompleted = validCompletedLessons.includes(lessonId) 
      ? validCompletedLessons.filter(id => id !== lessonId)
      : [...validCompletedLessons, lessonId];
    
    setCompletedLessons(newCompleted);
    saveProgress(newCompleted);
  };

  const handleQuizSubmit = (lessonId: string, quiz: Question[]) => {
    const correctCount = quiz.reduce((acc, q) => {
      return acc + (quizAnswers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = (correctCount / quiz.length) * 100;
    
    setQuizSubmitted(prev => ({ ...prev, [lessonId]: true }));
    
    if (percentage >= 80) {
      if (!validCompletedLessons.includes(lessonId)) {
        toggleLessonCompletion(lessonId);
      }
    }
  };

  const handleResetQuiz = (lessonId: string, quiz: Question[]) => {
    setQuizSubmitted(prev => ({ ...prev, [lessonId]: false }));
    setQuizAnswers(prev => {
      const next = { ...prev };
      quiz.forEach(q => delete next[q.id]);
      return next;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    setIsUploading(true);
    try {
      if (!storage) {
        throw new Error('O serviço de armazenamento (Firebase Storage) não está disponível. Verifique se ele está ativado no console do Firebase.');
      }
      const fileRef = sRef(storage, `lessons/pdfs/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditPdfUrl(url);
    } catch (error) {
      console.error('Erro ao subir PDF:', error);
      alert('Erro ao subir o PDF. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveEdit = () => {
    const newCourses = [...courses];
    const courseIdx = newCourses.findIndex(c => c.id === selectedCourseId);
    if (courseIdx === -1) return;

    const lesson = newCourses[courseIdx].modules[currentModuleIndex].lessons[currentLessonIndex];
    lesson.title = editTitle;
    lesson.content = editContent;
    lesson.imageUrl = editImageUrl;
    lesson.videoUrl = editVideoUrl;
    lesson.pdfUrl = editPdfUrl;
    lesson.quiz = editQuiz.length > 0 ? editQuiz : undefined;
    
    setCourses(newCourses);
    set(ref(db, 'courses'), newCourses);
    setIsEditing(false);
  };

  const getQuizScore = (lessonId: string, quiz: Question[]) => {
    const correctCount = quiz.reduce((acc, q) => {
      return acc + (quizAnswers[q.id] === q.correctAnswer ? 1 : 0);
    }, 0);
    return (correctCount / quiz.length) * 100;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-900/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onSuccess={() => {}} />;
  }

  if (showAdmin && isAdmin) {
    return <AdminDashboard onBack={() => setShowAdmin(false)} courses={courses} />;
  }

  if (!selectedCourseId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500 rounded-xl">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Adveasy Academy</span>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors flex items-center gap-2"
                >
                  <LayoutDashboard size={20} />
                  <span className="hidden sm:inline">Painel</span>
                </button>
              )}
              <button 
                onClick={() => signOut(auth)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors flex items-center gap-2"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-extrabold mb-4">Seus Cursos</h1>
            <p className="text-slate-400 text-lg">Continue sua jornada de aprendizado e domine a advocacia moderna.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ y: -5 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-800">
                  {c.thumbnail ? (
                    <img 
                      src={c.thumbnail} 
                      alt={c.title} 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-slate-700" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-primary-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                      Curso
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{c.title}</h3>
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-1">
                    {c.description}
                  </p>
                  <button
                    onClick={() => setSelectedCourseId(c.id)}
                    className="w-full py-3 bg-slate-800 hover:bg-primary-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                  >
                    Acessar Curso
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-100">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-50 p-4 bg-primary-600 text-white rounded-full shadow-lg lg:hidden"
          >
            <Menu size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? '320px' : '0px',
          opacity: isSidebarOpen ? 1 : 0
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-slate-800 overflow-hidden transition-all duration-300 lg:relative",
          !isSidebarOpen && "lg:w-0"
        )}
      >
        <div className="w-[320px] h-full flex flex-col">
          <div className="p-6 border-b border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-primary-500">
                <GraduationCap size={28} />
                <span className="font-bold text-lg tracking-tight">Adveasy Academy</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Treinamentos</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedCourseId(null)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-primary-400 rounded-xl transition-all border border-slate-700/50"
                  title="Voltar para Cursos"
                >
                  <Home size={20} />
                </button>
                {isAdmin && (
                  <button 
                    onClick={() => setShowAdmin(true)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-primary-400 rounded-xl transition-all border border-slate-700/50"
                    title="Painel Admin"
                  >
                    <Settings size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Progresso</span>
              <span className="text-xs font-bold text-primary-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary-500"
              />
            </div>

            {progress === 100 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowCertificate(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-900/20"
              >
                <Award size={18} />
                Emitir Certificado
              </motion.button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {selectedCourse?.modules?.map((module, mIdx) => (
              <div key={module.id} className="space-y-2">
                <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  {module.title}
                </h3>
                <div className="space-y-1">
                  {module.lessons?.map((lesson, lIdx) => {
                    const isActive = currentModuleIndex === mIdx && currentLessonIndex === lIdx;
                    const isCompleted = validCompletedLessons.includes(lesson.id);
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => {
                          setCurrentModuleIndex(mIdx);
                          setCurrentLessonIndex(lIdx);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left",
                          isActive 
                            ? "bg-primary-900/30 text-primary-400 font-medium shadow-sm" 
                            : "text-slate-400 hover:bg-slate-800"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <PlayCircle size={18} className={cn("shrink-0", isActive ? "text-primary-400" : "text-slate-500")} />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-primary-500 font-bold text-xs">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-white truncate">{user.email}</span>
                <span className="text-[10px] text-slate-500 uppercase">{isAdmin ? 'Admin' : 'Aluno'}</span>
              </div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-lg text-xs font-medium transition-all"
            >
              <LogOut size={14} />
              Sair da Conta
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg hidden lg:block"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-medium text-slate-400">{currentModule.title}</h2>
              <h1 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {currentLesson.title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={currentModuleIndex === (selectedCourse?.modules?.length || 0) - 1 && currentLessonIndex === (currentModule?.lessons?.length || 0) - 1}
              className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
          <motion.div
            key={currentLesson.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-8 sm:p-12 mb-8"
          >
            <div className="prose prose-invert max-w-none">
              <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-4">
                <h1 className="text-3xl font-extrabold text-white m-0">
                  {currentLesson.title}
                </h1>
                {isAdmin && (
                  <button 
                    onClick={() => {
                      setEditContent(currentLesson.content);
                      setEditImageUrl(currentLesson.imageUrl || '');
                      setEditVideoUrl(currentLesson.videoUrl || '');
                      setEditPdfUrl(currentLesson.pdfUrl || '');
                      setEditTitle(currentLesson.title);
                      setEditQuiz(currentLesson.quiz || []);
                      setIsEditing(true);
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg transition-colors"
                  >
                    Editar Lição
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Título da Lição</label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Conteúdo (Markdown)</label>
                    <textarea 
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-[400px] bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 font-mono text-sm focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">URL da Imagem (opcional)</label>
                      <input 
                        type="text"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">URL do Vídeo (YouTube/Vimeo - opcional)</label>
                      <input 
                        type="text"
                        value={editVideoUrl}
                        onChange={(e) => setEditVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Material em PDF (opcional)</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text"
                          value={editPdfUrl}
                          onChange={(e) => setEditPdfUrl(e.target.value)}
                          placeholder="URL do PDF ou suba um arquivo"
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-100 text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shrink-0">
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload size={18} />
                        )}
                        {isUploading ? 'Subindo...' : 'Subir PDF'}
                        <input 
                          type="file" 
                          accept=".pdf" 
                          className="hidden" 
                          onChange={handleFileUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    {editPdfUrl && (
                      <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <CheckCircle2 size={10} /> PDF vinculado com sucesso
                      </p>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Quiz da Lição</h3>
                      <button 
                        onClick={() => {
                          const newQuestion: Question = {
                            id: Math.random().toString(36).substring(2, 9),
                            text: 'Nova Pergunta',
                            options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
                            correctAnswer: 0
                          };
                          setEditQuiz([...editQuiz, newQuestion]);
                        }}
                        className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Plus size={14} />
                        Adicionar Pergunta
                      </button>
                    </div>

                    <div className="space-y-6">
                      {editQuiz.map((q, qIdx) => (
                        <div key={q.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-primary-500 uppercase">Pergunta {qIdx + 1}</span>
                            <button 
                              onClick={() => setEditQuiz(editQuiz.filter(item => item.id !== q.id))}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <input 
                            type="text"
                            value={q.text}
                            onChange={(e) => {
                              const newList = [...editQuiz];
                              newList[qIdx].text = e.target.value;
                              setEditQuiz(newList);
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                            placeholder="Texto da pergunta"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <input 
                                  type="radio"
                                  name={`correct-${q.id}`}
                                  checked={q.correctAnswer === oIdx}
                                  onChange={() => {
                                    const newList = [...editQuiz];
                                    newList[qIdx].correctAnswer = oIdx;
                                    setEditQuiz(newList);
                                  }}
                                  className="accent-primary-500"
                                />
                                <input 
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newList = [...editQuiz];
                                    newList[qIdx].options[oIdx] = e.target.value;
                                    setEditQuiz(newList);
                                  }}
                                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-primary-500"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-colors"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {currentLesson.videoUrl && (
                    <div className="mb-8 aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-black">
                      {currentLesson.videoUrl.includes('youtube.com') || currentLesson.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${currentLesson.videoUrl.split('v=')[1]?.split('&')[0] || currentLesson.videoUrl.split('/').pop()}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      ) : (
                        <video src={currentLesson.videoUrl} controls className="w-full h-full" />
                      )}
                    </div>
                  )}

                  {currentLesson.imageUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-slate-800">
                      <img src={currentLesson.imageUrl} alt={currentLesson.title} className="w-full h-auto object-cover" />
                    </div>
                  )}

                  {currentLesson.pdfUrl && (
                    <div className="mb-8 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white">Material Complementar (PDF)</h4>
                          <p className="text-sm text-slate-400">Clique para baixar ou visualizar o material.</p>
                        </div>
                      </div>
                      <a 
                        href={currentLesson.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto p-3 bg-slate-700 hover:bg-primary-600 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        <span className="font-bold text-sm">Download PDF</span>
                      </a>
                    </div>
                  )}

                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                    h1: () => null, // Already rendered above
                    h2: ({ children }) => <h2 className="text-2xl font-bold text-slate-100 mt-12 mb-6">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-bold text-slate-200 mt-8 mb-4">{children}</h3>,
                    p: ({ children }) => <p className="text-slate-400 leading-relaxed mb-6 text-lg">{children}</p>,
                    ul: ({ children }) => <ul className="space-y-3 mb-8 list-none pl-0">{children}</ul>,
                    li: ({ children }) => (
                      <li className="flex items-start gap-3 text-slate-400 text-lg">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-8 border border-slate-800 rounded-xl">
                        <table className="w-full text-left border-collapse">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-slate-800/50 text-slate-200">{children}</thead>,
                    th: ({ children }) => <th className="p-4 font-bold border-b border-slate-800">{children}</th>,
                    td: ({ children }) => <td className="p-4 text-slate-400 border-b border-slate-800">{children}</td>,
                    blockquote: ({ children }) => (
                      <blockquote className="my-8 p-6 bg-primary-900/10 border-l-4 border-primary-500 rounded-r-xl italic text-slate-300">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {currentLesson.content}
                </ReactMarkdown>
              </>
            )}
          </div>

            {/* Quiz Section */}
            {currentLesson.quiz && (
              <div className="mt-16 pt-16 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-primary-900/50 text-primary-400 rounded-lg">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Quiz de Conhecimento</h2>
                </div>

                <div className="space-y-12">
                  {currentLesson.quiz.map((q, qIdx) => (
                    <div key={q.id} className="space-y-6">
                      <p className="text-lg font-semibold text-slate-200">
                        {qIdx + 1}. {q.text}
                      </p>
                      <div className="grid gap-3">
                        {q.options.map((option, oIdx) => {
                          const isSelected = quizAnswers[q.id] === oIdx;
                          const isSubmitted = quizSubmitted[currentLesson.id];
                          const isCorrect = q.correctAnswer === oIdx;
                          
                          return (
                            <button
                              key={oIdx}
                              disabled={isSubmitted}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                              className={cn(
                                "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                                isSubmitted 
                                  ? isCorrect 
                                    ? "bg-emerald-900/20 border-emerald-800 text-emerald-400"
                                    : isSelected 
                                      ? "bg-red-900/20 border-red-800 text-red-400"
                                      : "bg-slate-800/50 border-slate-800 text-slate-600"
                                  : isSelected
                                    ? "bg-primary-900/20 border-primary-500 text-primary-400"
                                    : "bg-slate-800 border-slate-700 hover:border-primary-700 hover:bg-slate-700/50"
                              )}
                            >
                              <span className="text-base">{option}</span>
                              {isSubmitted && isCorrect && <CheckCircle2 size={20} className="text-emerald-500" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!quizSubmitted[currentLesson.id] ? (
                  <button
                    onClick={() => handleQuizSubmit(currentLesson.id, currentLesson.quiz!)}
                    disabled={currentLesson.quiz.some(q => quizAnswers[q.id] === undefined)}
                    className="mt-12 w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-900/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    Enviar Respostas
                  </button>
                ) : (
                  <div className="mt-12 space-y-6">
                    {getQuizScore(currentLesson.id, currentLesson.quiz) >= 80 ? (
                      <div className="p-6 bg-emerald-900/20 border border-emerald-800 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 text-white rounded-full">
                          <Award size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-400">Parabéns! Você passou!</h4>
                          <p className="text-emerald-500">Sua nota: {Math.round(getQuizScore(currentLesson.id, currentLesson.quiz))}%</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-red-900/20 border border-red-800 rounded-2xl space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-red-500 text-white rounded-full">
                            <X size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-red-400">Ops! Você não atingiu o mínimo de 80%.</h4>
                            <p className="text-red-500">Sua nota: {Math.round(getQuizScore(currentLesson.id, currentLesson.quiz))}%</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResetQuiz(currentLesson.id, currentLesson.quiz!)}
                          className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                        >
                          Tentar Novamente
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Completion Button (if no quiz) */}
            {!currentLesson.quiz && (
              <div className="mt-12 pt-8 border-t border-slate-800 flex justify-center">
                <button
                  onClick={() => toggleLessonCompletion(currentLesson.id)}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all",
                    completedLessons.includes(currentLesson.id)
                      ? "bg-emerald-900/30 text-emerald-400"
                      : "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-900/20"
                  )}
                >
                  {completedLessons.includes(currentLesson.id) ? (
                    <>
                      <CheckCircle2 size={20} />
                      Lição Concluída
                    </>
                  ) : (
                    "Marcar como Concluída"
                  )}
                </button>
              </div>
            )}
          </motion.div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pb-20">
            <button
              onClick={handlePrev}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="flex items-center gap-2 text-slate-400 font-medium hover:text-primary-400 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <ChevronLeft size={20} />
              Anterior
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentModuleIndex === (selectedCourse?.modules?.length || 0) - 1 && currentLessonIndex === (currentModule?.lessons?.length || 0) - 1}
              className="flex items-center gap-2 bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-30"
            >
              Próxima Lição
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showCertificate && (
          <Certificate 
            userName={userName || user?.email?.split('@')[0] || 'Aluno'} 
            courseTitle={selectedCourse.title}
            onClose={() => setShowCertificate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
