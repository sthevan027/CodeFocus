import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const TagManager = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar tags e tarefas da API (Supabase)
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setTags([]);
      setTasks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [tagsRes, tasksRes] = await Promise.all([
        apiService.getTags(),
        apiService.getTasks()
      ]);
      setTags(Array.isArray(tagsRes) ? tagsRes : []);
      setTasks(Array.isArray(tasksRes) ? tasksRes : []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
      setTags([]);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adicionar nova tag
  const addTag = async () => {
    if (!newTag.trim() || !user?.id) return;
    if (tags.some((t) => (typeof t === 'string' ? t : t.name) === newTag.trim())) return;
    try {
      const created = await apiService.createTag(newTag.trim());
      setTags((prev) => [...prev, created]);
      setNewTag('');
      if (window.showToast) {
        window.showToast(`Tag "${newTag}" criada com sucesso!`, 'success');
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Erro ao criar tag', 'error');
      }
    }
  };

  // Remover tag
  const removeTag = async (tagToRemove) => {
    const tagObj = tags.find((t) => (typeof t === 'string' ? t : t.name) === tagToRemove);
    const tagId = tagObj?.id;
    if (!tagId) return;
    try {
      await apiService.deleteTag(tagId);
      setTags((prev) => prev.filter((t) => (typeof t === 'string' ? t : t.name) !== tagToRemove));
      setSelectedTags((prev) => prev.filter((t) => t !== tagToRemove));
      if (window.showToast) {
        window.showToast(`Tag "${tagToRemove}" removida`, 'info');
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Erro ao remover tag', 'error');
      }
    }
  };

  // Adicionar nova tarefa
  const addTask = async () => {
    if (!newTask.trim() || !user?.id) return;
    try {
      const created = await apiService.createTask({
        text: newTask.trim(),
        tags: selectedTags,
        completed: false,
        pomodoro_count: 0
      });
      setTasks((prev) => [{ ...created, tags: created.tags || [] }, ...prev]);
      setNewTask('');
      setSelectedTags([]);
      if (window.showToast) {
        window.showToast('Tarefa adicionada com sucesso!', 'success');
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Erro ao adicionar tarefa', 'error');
      }
    }
  };

  // Toggle tarefa completa
  const toggleTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      const updated = await apiService.updateTask(taskId, {
        completed: !task.completed
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updated } : t))
      );
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Erro ao atualizar tarefa', 'error');
      }
    }
  };

  // Remover tarefa
  const removeTask = async (taskId) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (window.showToast) {
        window.showToast('Tarefa removida', 'info');
      }
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Erro ao remover tarefa', 'error');
      }
    }
  };

  // Incrementar contador Pomodoro
  const incrementPomodoro = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const count = (task.pomodoroCount ?? task.pomodoro_count ?? 0) + 1;
    try {
      const updated = await apiService.updateTask(taskId, {
        pomodoro_count: count
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, pomodoroCount: count, ...updated } : t))
      );
    } catch (err) {
      if (window.showToast) {
        window.showToast(err.message || 'Erro ao atualizar tarefa', 'error');
      }
    }
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter((task) => {
    const completed = task.completed ?? false;
    if (filter === 'active') return !completed;
    if (filter === 'completed') return completed;
    return true;
  });

  // Estatísticas
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    active: tasks.filter((t) => !t.completed).length,
    totalPomodoros: tasks.reduce((sum, t) => sum + (t.pomodoroCount ?? t.pomodoro_count ?? 0), 0)
  };

  const tagNames = tags.map((t) => (typeof t === 'string' ? t : t.name));

  if (!user?.id) {
    return (
      <div className="min-h-screen animate-fade-in flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-2">Gerenciador de Tarefas</h1>
        <p className="text-white/60 text-lg mb-6">Organize suas tarefas e acompanhe seu progresso</p>
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-md">
          <p className="text-white/80 text-lg">Faça login para gerenciar suas tarefas e tags.</p>
          <p className="text-white/50 mt-2">Os dados serão sincronizados na nuvem (Supabase).</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen animate-fade-in flex items-center justify-center">
        <p className="text-white/60">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gerenciador de Tarefas</h1>
        <p className="text-white/60 text-lg">Organize suas tarefas e acompanhe seu progresso</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Concluídas</p>
          <p className="text-2xl font-bold text-white">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Ativas</p>
          <p className="text-2xl font-bold text-white">{stats.active}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">Pomodoros</p>
          <p className="text-2xl font-bold text-white">{stats.totalPomodoros}</p>
        </div>
      </div>

      {/* Tag Management */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span>🏷️</span> Gerenciar Tags
        </h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Nova tag..."
            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTag}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Adicionar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tagNames.map((tag) => (
            <div
              key={tag}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags((prev) => prev.filter((t) => t !== tag));
                } else {
                  setSelectedTags((prev) => [...prev, tag]);
                }
              }}
            >
              <span>{tag}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="text-white/60 hover:text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span>➕</span> Nova Tarefa
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="O que você precisa fazer?"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Tags selecionadas:</span>
              <div className="flex gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
          >
            Adicionar Tarefa
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'completed'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              filter === filterType
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {filterType === 'all' ? 'Todas' : filterType === 'active' ? 'Ativas' : 'Concluídas'}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const completed = task.completed ?? false;
          const taskTags = Array.isArray(task.tags) ? task.tags : [];
          const taskDate = task.createdAt ?? task.created_at;
          const pomoCount = task.pomodoroCount ?? task.pomodoro_count ?? 0;

          return (
            <div
              key={task.id}
              className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 ${
                completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                    completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-white/40 hover:border-white'
                  }`}
                >
                  {completed && <span className="text-white text-sm">✓</span>}
                </button>

                <div className="flex-1">
                  <p className={`text-white ${completed ? 'line-through' : ''}`}>
                    {task.text}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {taskTags.length > 0 && (
                      <div className="flex gap-1">
                        {taskTags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {taskDate && (
                      <span className="text-white/40 text-sm">
                        {new Date(taskDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => incrementPomodoro(task.id)}
                    className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm flex items-center gap-1"
                    title="Adicionar Pomodoro"
                  >
                    <span>🍅</span>
                    <span>{pomoCount}</span>
                  </button>

                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                    title="Remover tarefa"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-lg">
              {filter === 'completed'
                ? 'Nenhuma tarefa concluída ainda'
                : filter === 'active'
                  ? 'Nenhuma tarefa ativa'
                  : 'Nenhuma tarefa adicionada ainda'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManager;
