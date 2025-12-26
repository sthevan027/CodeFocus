import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyPress = useCallback((event) => {
    // Ignorar se o usuário estiver digitando em um input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Criar string de combinação
    let combo = '';
    if (ctrl) combo += 'ctrl+';
    if (shift) combo += 'shift+';
    if (alt) combo += 'alt+';
    combo += key;

    // Verificar se existe um atalho para esta combinação
    if (shortcuts[combo]) {
      event.preventDefault();
      shortcuts[combo]();
    }

    // Atalhos simples (sem modificadores)
    if (!ctrl && !shift && !alt && shortcuts[key]) {
      event.preventDefault();
      shortcuts[key]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Retornar função para mostrar ajuda de atalhos
  const getShortcutsList = () => {
    const shortcutsList = [
      { key: 'Space', description: 'Iniciar/Pausar timer', combo: 'space' },
      { key: 'R', description: 'Reiniciar timer', combo: 'r' },
      { key: 'F', description: 'Iniciar sessão de foco', combo: 'f' },
      { key: 'B', description: 'Iniciar pausa curta', combo: 'b' },
      { key: 'L', description: 'Iniciar pausa longa', combo: 'l' },
      { key: 'Ctrl+D', description: 'Abrir Dashboard', combo: 'ctrl+d' },
      { key: 'Ctrl+S', description: 'Abrir Configurações', combo: 'ctrl+s' },
      { key: 'Ctrl+M', description: 'Controles de música', combo: 'ctrl+m' },
      { key: '?', description: 'Mostrar atalhos', combo: '?' },
      { key: 'Esc', description: 'Fechar modal/voltar', combo: 'escape' },
    ];
    return shortcutsList;
  };

  return { getShortcutsList };
};

export default useKeyboardShortcuts;