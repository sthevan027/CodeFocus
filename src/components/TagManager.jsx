import React, { useState, useEffect } from 'react';

const TagManager = ({ tags, onUpdate, userId }) => {
  const [userTags, setUserTags] = useState({});
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [editingTag, setEditingTag] = useState(null);

  const tagColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  useEffect(() => {
    loadUserTags();
  }, [userId]);

  const loadUserTags = () => {
    try {
      const savedTags = JSON.parse(localStorage.getItem(`codefocus-tags-${userId}`) || '{}');
      setUserTags(savedTags);
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    }
  };

  const saveUserTags = (tags) => {
    try {
      localStorage.setItem(`codefocus-tags-${userId}`, JSON.stringify(tags));
      setUserTags(tags);
      onUpdate();
    } catch (error) {
      console.error('Erro ao salvar tags:', error);
    }
  };

  const addTag = () => {
    if (!newTag.trim()) return;

    const tagName = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    const updatedTags = {
      ...userTags,
      [tagName]: {
        name: newTag.trim(),
        color: newTagColor,
        createdAt: new Date().toISOString(),
        usage: 0
      }
    };

    saveUserTags(updatedTags);
    setNewTag('');
    setNewTagColor('#3B82F6');
  };

  const updateTag = (oldTagName, newTagName, newColor) => {
    const updatedTags = { ...userTags };
    
    if (oldTagName !== newTagName) {
      // Renomear tag
      const tagData = updatedTags[oldTagName];
      delete updatedTags[oldTagName];
      updatedTags[newTagName] = {
        ...tagData,
        name: newTagName,
        color: newColor
      };
    } else {
      // Apenas atualizar cor
      updatedTags[oldTagName] = {
        ...updatedTags[oldTagName],
        color: newColor
      };
    }

    saveUserTags(updatedTags);
    setEditingTag(null);
  };

  const deleteTag = (tagName) => {
    const updatedTags = { ...userTags };
    delete updatedTags[tagName];
    saveUserTags(updatedTags);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Gerenciar Tags</h2>
        <button
          onClick={() => setEditingTag('new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ Nova Tag
        </button>
      </div>

      {/* Adicionar Nova Tag */}
      {editingTag === 'new' && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Nova Tag</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Nome da Tag</label>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Ex: frontend, backend, bugfix"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-2">Cor</label>
              <div className="flex space-x-2">
                {tagColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newTagColor === color ? 'border-white scale-110' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setEditingTag(null);
                  setNewTag('');
                  setNewTagColor('#3B82F6');
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(userTags).map(([tagName, tagData]) => (
          <div key={tagName} className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tagData.color }}
                />
                <span className="text-white font-medium">#{tagName}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingTag(tagName)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTag(tagName)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white/60 text-sm">
                Nome: {tagData.name}
              </p>
              {tags[tagName] && (
                <>
                  <p className="text-white/60 text-sm">
                    Tempo: {formatTime(tags[tagName].time)}
                  </p>
                  <p className="text-white/60 text-sm">
                    Sessões: {tags[tagName].sessions}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingTag && editingTag !== 'new' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Editar Tag</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Nome</label>
                <input
                  type="text"
                  defaultValue={userTags[editingTag]?.name}
                  id="editTagName"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">Cor</label>
                <div className="flex space-x-2">
                  {tagColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newTagColor === color ? 'border-white scale-110' : 'border-white/20'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const newName = document.getElementById('editTagName').value.trim();
                    if (newName) {
                      updateTag(editingTag, newName.toLowerCase().replace(/\s+/g, '-'), newTagColor);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setNewTagColor('#3B82F6');
                  }}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas de Tags */}
      {Object.keys(tags).length > 0 && (
        <div className="bg-white/5 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Estatísticas de Tags</h3>
          <div className="space-y-3">
            {Object.entries(tags)
              .sort(([,a], [,b]) => b.time - a.time)
              .map(([tagName, data]) => (
                <div key={tagName} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: userTags[tagName]?.color || '#3B82F6' }}
                    />
                    <span className="text-white font-medium">#{tagName}</span>
                    <span className="text-white/60 text-sm">
                      {data.sessions} sessões
                    </span>
                  </div>
                  <div className="text-white font-semibold">
                    {formatTime(data.time)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager; 