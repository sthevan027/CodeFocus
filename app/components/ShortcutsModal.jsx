import React from 'react';

const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Timer', items: [
      { key: 'Space', description: 'Iniciar/Pausar timer' },
      { key: 'R', description: 'Reiniciar timer' },
      { key: 'F', description: 'Iniciar sessão de foco' },
      { key: 'B', description: 'Iniciar pausa curta' },
      { key: 'L', description: 'Iniciar pausa longa' },
    ]},
    { category: 'Navegação', items: [
      { key: 'Ctrl+D', description: 'Abrir Dashboard' },
      { key: 'Ctrl+S', description: 'Abrir Configurações' },
      { key: 'Ctrl+M', description: 'Controles de música' },
      { key: 'Ctrl+T', description: 'Gerenciar tarefas' },
    ]},
    { category: 'Geral', items: [
      { key: '?', description: 'Mostrar esta ajuda' },
      { key: 'Esc', description: 'Fechar modal/voltar' },
      { key: 'Ctrl+N', description: 'Adicionar nota rápida' },
    ]},
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⌨️</span>
            <h2 className="text-2xl font-bold text-white">Atalhos de Teclado</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-hide">
          <div className="space-y-6">
            {shortcuts.map((category) => (
              <div key={category.category}>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  {category.category}
                </h3>
                <div className="grid gap-2">
                  {category.items.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <span className="text-white/80">{shortcut.description}</span>
                      <kbd className="px-3 py-1 bg-white/10 rounded-md text-white font-mono text-sm border border-white/20">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <div className="mt-8 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
            <p className="text-blue-300 text-sm flex items-center gap-2">
              <span>💡</span>
              Dica: Os atalhos funcionam em qualquer tela, exceto quando você está digitando em campos de texto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;