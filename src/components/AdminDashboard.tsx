import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
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
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { courseData } from '../courseData';

interface UserStats {
  email: string;
  completedLessons: string[];
  lastLogin: number;
  uid: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  course: any;
}

export default function AdminDashboard({ onBack, course }: AdminDashboardProps) {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const totalLessons = course.modules.reduce((acc: number, mod: any) => acc + mod.lessons.length, 0);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.entries(data).map(([uid, profile]: [string, any]) => ({
          uid,
          email: profile.email || 'N/A',
          completedLessons: profile.progress?.completedLessons || [],
          lastLogin: profile.lastLogin || 0,
        }));
        setUsers(userList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd use Firebase Admin SDK or a cloud function to create users.
    // Here we'll just simulate adding to a whitelist or just showing a message.
    alert('Funcionalidade de criação de usuário requer Firebase Admin SDK. Por enquanto, usuários podem se cadastrar na tela de login.');
    setShowAddUser(false);
    setNewEmail('');
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
          <button 
            onClick={() => setShowAddUser(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all"
          >
            <UserPlus size={18} />
            Novo Usuário
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                              <span className="font-medium">{user.email}</span>
                              <span className="text-xs text-slate-500">ID: {user.uid.slice(0, 8)}...</span>
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
                          <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
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
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Convidar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
