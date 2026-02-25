import React, { useState, useEffect, useMemo } from 'react';
import { db, firebaseConfig } from '../firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Search, 
  UserPlus,
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  Mail,
  Calendar,
  Trash2,
  Edit2,
  Lock,
  Plus,
  Image as ImageIcon,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { cn } from '../lib/utils';

interface UserStats {
  email: string;
  name?: string;
  completedLessons: string[];
  lastLogin: number;
  uid: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  courses: any[];
  onUpdateCourses: (courses: any[]) => void;
}

export default function AdminDashboard({ onBack, courses, onUpdateCourses }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState<UserStats | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'course'>('users');
  
  // Course Management State
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showEditCourseInfo, setShowEditCourseInfo] = useState<any | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseThumb, setNewCourseThumb] = useState('');
  
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null); // moduleId
  const [newLessonTitle, setNewLessonTitle] = useState('');

  const selectedCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId),
  [courses, selectedCourseId]);

  const totalLessons = useMemo(() => 
    courses.reduce((acc, c) => acc + (c.modules || []).reduce((mAcc: number, m: any) => mAcc + (m.lessons?.length || 0), 0), 0)
  , [courses]);

  const allLessonIds = useMemo(() => 
    new Set(courses.flatMap(c => (c.modules || []).flatMap((m: any) => (m.lessons || []).map((l: any) => l.id))))
  , [courses]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([uid, profile]: [string, any]) => {
          const rawCompleted = profile.progress?.completedLessons || [];
          const validCompleted = rawCompleted.filter((id: string) => allLessonIds.has(id));
          
          return {
            uid,
            email: profile.email || 'N/A',
            name: profile.name || '',
            completedLessons: validCompleted,
            lastLogin: profile.lastLogin || 0,
          };
        });
        setUsers(userList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [allLessonIds]);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    
    setActionLoading(true);
    try {
      const secondaryApp = getApps().find(app => app.name === 'secondary') 
        || initializeApp(firebaseConfig, 'secondary');
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUser = userCredential.user;
      
      await set(ref(db, `users/${newUser.uid}`), {
        email: newEmail,
        name: newName,
        role: 'student',
        createdAt: Date.now(),
        lastLogin: Date.now()
      });
      
      await signOut(secondaryAuth);
      
      setShowAddUser(false);
      setNewEmail('');
      setNewPassword('');
      setNewName('');
      alert('Usuário criado com sucesso!');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao criar usuário: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditUser || !editEmail) return;

    setActionLoading(true);
    try {
      await update(ref(db, `users/${showEditUser.uid}`), {
        email: editEmail,
        name: editName
      });
      setShowEditUser(null);
      alert('Usuário atualizado!');
    } catch (err: any) {
      alert('Erro ao atualizar: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    setActionLoading(true);
    try {
      await remove(ref(db, `users/${userId}`));
      alert('Usuário removido!');
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle) return;

    const newCourse = {
      id: Math.random().toString(36).substring(2, 9),
      title: newCourseTitle,
      description: newCourseDesc,
      thumbnail: newCourseThumb,
      modules: []
    };

    const updatedCourses = [...courses, newCourse];

    try {
      await set(ref(db, 'courses'), updatedCourses);
      setNewCourseTitle('');
      setNewCourseDesc('');
      setNewCourseThumb('');
      setShowAddCourse(false);
    } catch (err: any) {
      alert('Erro ao adicionar curso: ' + err.message);
    }
  };

  const handleEditCourseInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditCourseInfo || !newCourseTitle) return;

    const updatedCourses = courses.map(c => {
      if (c.id === showEditCourseInfo.id) {
        return {
          ...c,
          title: newCourseTitle,
          description: newCourseDesc,
          thumbnail: newCourseThumb
        };
      }
      return c;
    });

    try {
      await set(ref(db, 'courses'), updatedCourses);
      setShowEditCourseInfo(null);
      setNewCourseTitle('');
      setNewCourseDesc('');
      setNewCourseThumb('');
    } catch (err: any) {
      alert('Erro ao editar curso: ' + err.message);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso e todo o seu conteúdo?')) return;

    const updatedCourses = courses.filter(c => c.id !== courseId);
    try {
      await set(ref(db, 'courses'), updatedCourses);
      if (selectedCourseId === courseId) setSelectedCourseId(null);
    } catch (err: any) {
      alert('Erro ao excluir curso: ' + err.message);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle || !selectedCourseId) return;

    const newModule = {
      id: Math.random().toString(36).substring(2, 9),
      title: newModuleTitle,
      lessons: []
    };

    const updatedCourses = [...courses];
    const courseIdx = updatedCourses.findIndex(c => c.id === selectedCourseId);
    if (courseIdx !== -1) {
      if (!updatedCourses[courseIdx].modules) updatedCourses[courseIdx].modules = [];
      updatedCourses[courseIdx].modules.push(newModule);

      try {
        await set(ref(db, 'courses'), updatedCourses);
        setNewModuleTitle('');
        setShowAddModule(false);
      } catch (err: any) {
        alert('Erro ao adicionar módulo: ' + err.message);
      }
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!newLessonTitle || !selectedCourseId) return;

    const newLesson = {
      id: Math.random().toString(36).substring(2, 9),
      title: newLessonTitle,
      content: '# Nova Lição\nComece a escrever aqui...'
    };

    const updatedCourses = [...courses];
    const courseIdx = updatedCourses.findIndex(c => c.id === selectedCourseId);
    if (courseIdx !== -1) {
      if (!updatedCourses[courseIdx].modules) updatedCourses[courseIdx].modules = [];
      const module = updatedCourses[courseIdx].modules.find((m: any) => m.id === moduleId);
      if (module) {
        if (!module.lessons) module.lessons = [];
        module.lessons.push(newLesson);
        try {
          await set(ref(db, 'courses'), updatedCourses);
          setNewLessonTitle('');
          setShowAddLesson(null);
        } catch (err: any) {
          alert('Erro ao adicionar lição: ' + err.message);
        }
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo e todas as suas lições?')) return;

    const updatedCourses = [...courses];
    const courseIdx = updatedCourses.findIndex(c => c.id === selectedCourseId);
    if (courseIdx !== -1) {
      if (!updatedCourses[courseIdx].modules) updatedCourses[courseIdx].modules = [];
      updatedCourses[courseIdx].modules = updatedCourses[courseIdx].modules.filter((m: any) => m.id !== moduleId);
      try {
        await set(ref(db, 'courses'), updatedCourses);
      } catch (err: any) {
        alert('Erro ao excluir módulo: ' + err.message);
      }
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta lição?')) return;

    const updatedCourses = [...courses];
    const courseIdx = updatedCourses.findIndex(c => c.id === selectedCourseId);
    if (courseIdx !== -1) {
      if (!updatedCourses[courseIdx].modules) updatedCourses[courseIdx].modules = [];
      const module = updatedCourses[courseIdx].modules.find((m: any) => m.id === moduleId);
      if (module) {
        if (!module.lessons) module.lessons = [];
        module.lessons = module.lessons.filter((l: any) => l.id !== lessonId);
        try {
          await set(ref(db, 'courses'), updatedCourses);
        } catch (err: any) {
          alert('Erro ao excluir lição: ' + err.message);
        }
      }
    }
  };

  const handleReorderCourses = (newOrder: any[]) => {
    onUpdateCourses(newOrder);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('users')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === 'users' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Usuários
              </button>
              <button 
                onClick={() => setActiveTab('course')}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === 'course' ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                )}
              >
                Conteúdo
              </button>
            </div>
            {activeTab === 'users' && (
              <button 
                onClick={() => setShowAddUser(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
              >
                <UserPlus size={18} />
                Novo Usuário
              </button>
            )}
            {activeTab === 'course' && (
              <button 
                onClick={() => selectedCourseId ? setShowAddModule(true) : setShowAddCourse(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
              >
                <Plus size={18} />
                {selectedCourseId ? 'Novo Módulo' : 'Novo Curso'}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Users size={24} />
                  </div>
                  <span className="text-slate-400 font-medium">Total de Alunos</span>
                </div>
                <div className="text-3xl font-bold">{users.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <BookOpen size={24} />
                  </div>
                  <span className="text-slate-400 font-medium">Lições Totais</span>
                </div>
                <div className="text-3xl font-bold">{totalLessons}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                  <span className="text-slate-400 font-medium">Média de Progresso</span>
                </div>
                <div className="text-3xl font-bold">
                  {users.length > 0 
                    ? Math.round(users.reduce((acc, u) => acc + (u.completedLessons.length / totalLessons * 100), 0) / users.length)
                    : 0}%
                </div>
              </div>
            </div>

            {/* User List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold">Lista de Alunos</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar por e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-full sm:w-64 transition-colors"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Aluno</th>
                      <th className="px-6 py-4 font-semibold">Progresso</th>
                      <th className="px-6 py-4 font-semibold">Último Acesso</th>
                      <th className="px-6 py-4 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          Carregando usuários...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          Nenhum aluno encontrado.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const progress = Math.round((user.completedLessons.length / totalLessons) * 100);
                        return (
                          <tr key={user.uid} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-primary-500 font-bold">
                                  {user.email[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">{user.name || user.email.split('@')[0]}</span>
                                  <span className="text-xs text-slate-500">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-2 min-w-[120px]">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-400">{user.completedLessons.length}/{totalLessons} lições</span>
                                  <span className="font-bold text-primary-500">{progress}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary-500" 
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveMenu(activeMenu === user.uid ? null : user.uid)}
                                  className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                >
                                  <MoreVertical size={18} />
                                </button>

                                <AnimatePresence>
                                  {activeMenu === user.uid && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setActiveMenu(null)}
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden"
                                      >
                                        <button
                                          onClick={() => {
                                            setShowEditUser(user);
                                            setEditEmail(user.email);
                                            setEditName(user.name || '');
                                            setActiveMenu(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                                        >
                                          <Edit2 size={16} className="text-primary-400" />
                                          Editar Aluno
                                        </button>
                                        <button
                                          onClick={() => {
                                            handleDeleteUser(user.uid);
                                            setActiveMenu(null);
                                          }}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                                        >
                                          <Trash2 size={16} />
                                          Excluir Usuário
                                        </button>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {!selectedCourseId ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Cursos Disponíveis</h2>
                  <p className="text-slate-400 text-sm">Arraste os cursos para reordenar.</p>
                </div>
                <Reorder.Group 
                  axis="y" 
                  values={courses} 
                  onReorder={handleReorderCourses}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {courses.map((c) => (
                    <Reorder.Item 
                      key={c.id} 
                      value={c}
                      whileDrag={{ 
                        scale: 1.02, 
                        zIndex: 50,
                        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)"
                      }}
                      className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group cursor-default relative"
                    >
                      <div className="aspect-video bg-slate-800 relative overflow-hidden">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={40} className="text-slate-700" />
                          </div>
                        )}
                        
                        {/* Drag Handle */}
                        <div className="absolute top-2 left-2 p-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white/50 group-hover:text-white cursor-grab active:cursor-grabbing transition-colors">
                          <GripVertical size={16} />
                        </div>

                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEditCourseInfo(c);
                              setNewCourseTitle(c.title);
                              setNewCourseDesc(c.description);
                              setNewCourseThumb(c.thumbnail || '');
                            }}
                            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCourse(c.id);
                            }}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg mb-2 line-clamp-1">{c.title}</h3>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{c.description}</p>
                        <button 
                          onClick={() => setSelectedCourseId(c.id)}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          Editar Conteúdo
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedCourseId(null)}
                      className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCourse?.title}</h2>
                      <p className="text-slate-400 text-sm">Gerencie módulos e lições deste curso.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  {selectedCourse?.modules && selectedCourse.modules.length > 0 ? (
                    selectedCourse.modules.map((module: any) => (
                      <div key={module.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-bold">
                              {(selectedCourse?.modules || []).indexOf(module) + 1}
                            </div>
                            <h3 className="text-lg font-bold">{module.title}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setShowAddLesson(module.id)}
                              className="p-2 hover:bg-slate-700 rounded-lg text-emerald-400 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Plus size={18} />
                              Nova Lição
                            </button>
                            <button 
                              onClick={() => handleDeleteModule(module.id)}
                              className="p-2 hover:bg-red-900/20 rounded-lg text-red-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid gap-2">
                            {(module.lessons || []).map((lesson: any) => (
                              <div key={lesson.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group">
                                <div className="flex items-center gap-3">
                                  <BookOpen size={16} className="text-slate-500" />
                                  <span className="font-medium">{lesson.title}</span>
                                </div>
                                <button 
                                  onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-900/20 rounded-lg text-red-400 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            {(!module.lessons || module.lessons.length === 0) && (
                              <p className="text-center py-4 text-slate-500 text-sm italic">Nenhuma lição neste módulo.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                      <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-300">Nenhum módulo encontrado</h3>
                      <p className="text-slate-500 mb-6">Comece adicionando o primeiro módulo ao seu curso.</p>
                      <button 
                        onClick={() => setShowAddModule(true)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-bold transition-all inline-flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Adicionar Módulo
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <UserPlus className="text-primary-500" />
                Convidar Novo Aluno
              </h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Nome do Aluno</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                      placeholder="Nome completo"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">E-mail do Aluno</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                      placeholder="aluno@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Senha Inicial</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Convidar'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Edit2 className="text-primary-500" />
                Editar Aluno
              </h3>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Nome do Aluno</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                      placeholder="Nome completo"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">E-mail do Aluno</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setShowEditUser(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Salvar'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Course Modal */}
      <AnimatePresence>
        {showAddCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-primary-500" />
                Novo Curso
              </h3>
              <form onSubmit={handleAddCourse} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Título do Curso</label>
                  <input 
                    type="text" 
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    placeholder="Ex: Marketing para Advogados"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Descrição</label>
                  <textarea 
                    required
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 h-24"
                    placeholder="Breve descrição do curso"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">URL da Thumbnail</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      value={newCourseThumb}
                      onChange={(e) => setNewCourseThumb(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddCourse(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Criar Curso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Course Info Modal */}
      <AnimatePresence>
        {showEditCourseInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Edit2 className="text-primary-500" />
                Editar Curso
              </h3>
              <form onSubmit={handleEditCourseInfo} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Título do Curso</label>
                  <input 
                    type="text" 
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Descrição</label>
                  <textarea 
                    required
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 h-24"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">URL da Thumbnail</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      value={newCourseThumb}
                      onChange={(e) => setNewCourseThumb(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowEditCourseInfo(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Module Modal */}
      <AnimatePresence>
        {showAddModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-primary-500" />
                Novo Módulo
              </h3>
              <form onSubmit={handleAddModule} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Título do Módulo</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    placeholder="Ex: Introdução ao Direito"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModule(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Criar Módulo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Lesson Modal */}
      <AnimatePresence>
        {showAddLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="text-primary-500" />
                Nova Lição
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Título da Lição</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddLesson(showAddLesson)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    placeholder="Ex: Aula 01 - Conceitos Básicos"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddLesson(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => handleAddLesson(showAddLesson)}
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Criar Lição
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
