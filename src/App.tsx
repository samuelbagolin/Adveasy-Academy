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
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { courseData } from './courseData';
import { Question } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { ref, onValue, set, update } from 'firebase/database';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [course, setCourse] = useState(courseData);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const isAdmin = user?.email === 'contato@adveasy.com.br';

  useEffect(() => {
    // Load course from Firebase
    const courseRef = ref(db, 'course');
    onValue(courseRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCourse(data);
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
          
          // Update last login
          update(userRef, {
            email: u.email,
            lastLogin: Date.now()
          });

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

  const currentModule = course.modules[currentModuleIndex];
  const currentLesson = currentModule.lessons[currentLessonIndex];

  const totalLessons = useMemo(() => {
    return course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  }, [course]);

  const validCompletedLessons = useMemo(() => {
    const allLessonIds = new Set(course.modules.flatMap(m => m.lessons.map(l => l.id)));
    return completedLessons.filter(id => allLessonIds.has(id));
  }, [completedLessons, course]);

  const progress = useMemo(() => {
    if (totalLessons === 0) return 0;
    return (validCompletedLessons.length / totalLessons) * 100;
  }, [validCompletedLessons, totalLessons]);

  const handleNext = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
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

  const handleSaveEdit = () => {
    const newCourse = { ...course };
    newCourse.modules[currentModuleIndex].lessons[currentLessonIndex].content = editContent;
    setCourse(newCourse);
    set(ref(db, 'course'), newCourse);
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
    return <AdminDashboard onBack={() => setShowAdmin(false)} course={course} />;
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
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary-500">
              <GraduationCap size={28} />
              <span className="font-bold text-lg tracking-tight">Adveasy Academy</span>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="p-2 text-slate-400 hover:text-primary-500 transition-colors"
                  title="Painel Admin"
                >
                  <LayoutDashboard size={20} />
                </button>
              )}
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
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
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {course.modules.map((module, mIdx) => (
              <div key={module.id} className="space-y-2">
                <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  {module.title}
                </h3>
                <div className="space-y-1">
                  {module.lessons.map((lesson, lIdx) => {
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
              disabled={currentModuleIndex === course.modules.length - 1 && currentLessonIndex === currentModule.lessons.length - 1}
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
                      setIsEditing(true);
                    }}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg transition-colors"
                  >
                    Editar Lição
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-[500px] bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-100 font-mono text-sm focus:outline-none focus:border-primary-500"
                  />
                  <div className="flex gap-3">
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
              disabled={currentModuleIndex === course.modules.length - 1 && currentLessonIndex === currentModule.lessons.length - 1}
              className="flex items-center gap-2 bg-slate-100 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-white transition-all disabled:opacity-30"
            >
              Próxima Lição
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
