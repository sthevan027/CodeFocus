import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TagManager = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');

  // Carregar tags e tarefas do localStorage
  useEffect(() => {
    const userKey = user ? `codefocus-tags-${user.id}` : 'codefocus-tags';
    const tasksKey = user ? `codefocus-tasks-${user.id}` : 'codefocus-tasks';
    
    const savedTags = JSON.parse(localStorage.getItem(userKey) || '[]');
    const savedTasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
    
    setTags(savedTags);
    setTasks(savedTasks);
  }, [user]);

  // Salvar tags
  const saveTags = (newTags) => {
    const userKey = user ? `codefocus-tags-${user.id}` : 'codefocus-tags';
    localStorage.setItem(userKey, JSON.stringify(newTags));
    setTags(newTags);
  };

  // Salvar tarefas
  const saveTasks = (newTasks) => {
    const tasksKey = user ? `codefocus-tasks-${user.id}` : 'codefocus-tasks';
    localStorage.setItem(tasksKey, JSON.stringify(newTasks));
    setTasks(newTasks);
  };

  // Adicionar nova tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      saveTags(updatedTags);
      setNewTag('');
      if (window.showToast) {
        window.showToast(`Tag "${newTag}" criada com sucesso!`, 'success');
      }
    }
  };

  // Remover tag
  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    saveTags(updatedTags);
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    if (window.showToast) {
      window.showToast(`Tag "${tagToRemove}" removida`, 'info');
    }
  };

  // Adicionar nova tarefa
  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        tags: [...selectedTags],
        completed: false,
        createdAt: new Date().toISOString(),
        pomodoroCount: 0
      };
      const updatedTasks = [task, ...tasks];
      saveTasks(updatedTasks);
      setNewTask('');
      setSelectedTags([]);
      if (window.showToast) {
        window.showToast('Tarefa adicionada com sucesso!', 'success');
      }
    }
  };

  // Toggle tarefa completa
  const toggleTask = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  // Remover tarefa
  const removeTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    if (window.showToast) {
      window.showToast('Tarefa removida', 'info');
    }
  };

  // Incrementar contador Pomodoro
  const incrementPomodoro = (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, pomodoroCount: task.pomodoroCount + 1 } : task
    );
    saveTasks(updatedTasks);
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  // Estatísticas
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    totalPomodoros: tasks.reduce((sum, t) => sum + t.pomodoroCount, 0)
  };

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Gerenciador de Tarefas</h1>
        <p className="text-white/60 text-lg">Organize suas tarefas e acompanhe seu progresso</p>
      </div>

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
        
        {/* Add Tag Input */}
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

        {/* Tags List */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              onClick={() => {
                if (selectedTags.includes(tag)) {
                  setSelectedTags(selectedTags.filter(t => t !== tag));
                } else {
                  setSelectedTags([...selectedTags, tag]);
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
                {selectedTags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">
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
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-200 ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  task.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-white/40 hover:border-white'
                }`}
              >
                {task.completed && <span className="text-white text-sm">✓</span>}
              </button>
              
              <div className="flex-1">
                <p className={`text-white ${task.completed ? 'line-through' : ''}`}>
                  {task.text}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-white/40 text-sm">
                    {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => incrementPomodoro(task.id)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm flex items-center gap-1"
                  title="Adicionar Pomodoro"
                >
                  <span>🍅</span>
                  <span>{task.pomodoroCount}</span>
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
        ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/40 text-lg">
              {filter === 'completed' ? 'Nenhuma tarefa concluída ainda' : 
               filter === 'active' ? 'Nenhuma tarefa ativa' : 
               'Nenhuma tarefa adicionada ainda'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManager; 