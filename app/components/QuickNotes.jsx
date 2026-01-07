import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const colorFromString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 80% 55%)`;
};

const QuickNotes = ({ onUpdate = () => {} } = {}) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [userTags, setUserTags] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (!userId) return;
    loadNotes();
    loadSessions();
    loadUserTags();
  }, [userId]);

  const loadNotes = () => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem(`codefocus-notes-${userId}`) || '[]');
      setNotes(savedNotes);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    }
  };

  const loadSessions = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(`codefocus-history-${userId}`) || '[]');
      setSessions(Array.isArray(saved) ? saved.filter((s) => s.type === 'session') : []);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const loadUserTags = () => {
    try {
      const savedTags = JSON.parse(localStorage.getItem(`codefocus-tags-${userId}`) || '[]');
      setUserTags(Array.isArray(savedTags) ? savedTags : []);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  };

  const saveNotes = (newNotes) => {
    try {
      localStorage.setItem(`codefocus-notes-${userId}`, JSON.stringify(newNotes));
      setNotes(newNotes);
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar notas:', error);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    if (!userId) return;

    const note = {
      id: Date.now(),
      message: newNote.trim(),
      tags: selectedTags,
      timestamp: new Date().toISOString(),
      type: 'note'
    };

    const updatedNotes = [note, ...notes];
    saveNotes(updatedNotes);
    setNewNote('');
    setSelectedTags([]);
  };

  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const tagMeta = useMemo(() => {
    const meta = {};
    userTags.forEach((t) => {
      meta[t] = { color: colorFromString(t) };
    });
    return meta;
  }, [userTags]);

  const filteredActivities = [...sessions, ...notes]
    .filter(activity => {
      // Filtro por tipo
      if (filter === 'sessions' && activity.type !== 'session') return false;
      if (filter === 'notes' && activity.type !== 'note') return false;
      
      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const message = activity.message || activity.name || '';
        const tags = activity.tags ? activity.tags.join(' ') : '';
        return message.toLowerCase().includes(searchLower) || 
               tags.toLowerCase().includes(searchLower);
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Notas e Atividades</h2>
        <button
          onClick={() => document.getElementById('newNoteInput').focus()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ✏️ Nova Nota
        </button>
      </div>

      {/* Adicionar Nova Nota */}
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Nova Nota</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Mensagem</label>
            <textarea
              id="newNoteInput"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="O que você fez durante esta sessão?"
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Seleção de Tags */}
          {userTags.length > 0 && (
            <div>
              <label className="block text-white/80 text-sm mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {userTags.map((tagName) => (
                  <button
                    key={tagName}
                    onClick={() => toggleTag(tagName)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tagName)
                        ? 'text-white'
                        : 'text-white/60 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tagName) ? tagMeta[tagName]?.color : 'transparent',
                      border: `1px solid ${tagMeta[tagName]?.color}`
                    }}
                  >
                    #{tagName}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={addNote}
              disabled={!newNote.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Adicionar Nota
            </button>
            <button
              onClick={() => {
                setNewNote('');
                setSelectedTags([]);
              }}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4">
        <div className="flex bg-white/10 rounded-lg p-1">
          {[
            { value: 'all', label: 'Tudo' },
            { value: 'sessions', label: 'Sessões' },
            { value: 'notes', label: 'Notas' }
          ].map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === filterOption.value
                  ? 'bg-blue-600 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar atividades..."
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredActivities.map((activity, index) => (
          <div key={activity.id || index} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-blue-400">
                    {activity.type === 'session' ? '⏱️' : '📝'}
                  </span>
                  <span className="text-white font-medium">
                    {activity.name || 'Nota'}
                  </span>
                  <span className="text-white/60 text-sm">
                    {formatDate(activity.timestamp)}
                  </span>
                </div>

                <p className="text-white/80 mb-2">
                  {activity.message || activity.name || 'Sessão de foco'}
                </p>

                {/* Tags */}
                {activity.tags && activity.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {activity.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: tagMeta[tag]?.color || '#3B82F6',
                          color: 'white'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Duração para sessões */}
                {activity.duration && (
                  <p className="text-white/60 text-sm">
                    Duração: {formatTime(activity.duration)}
                  </p>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex space-x-2 ml-4">
                {activity.type === 'note' && (
                  <button
                    onClick={() => deleteNote(activity.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white/60">Nenhuma atividade encontrada</p>
          </div>
        )}
      </div>

      {/* Exportar Dados */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            const data = {
              activities: filteredActivities,
              exportDate: new Date().toISOString(),
              filter,
              searchTerm
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `codefocus-activities-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📊 Exportar Atividades
        </button>
      </div>
    </div>
  );
};

export default QuickNotes; 