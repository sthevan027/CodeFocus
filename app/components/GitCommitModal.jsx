import { useState } from 'react';

const GitCommitModal = ({ isOpen, onClose, cycleName, onCommit }) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    setIsCommitting(true);
    try {
      // Simular commit manual
      const result = {
        success: true,
        message: commitMessage,
        timestamp: new Date().toISOString()
      };
      
      // Salvar no localStorage para histórico
      const commits = JSON.parse(localStorage.getItem('codefocus-commits') || '[]');
      commits.push({
        id: Date.now(),
        message: commitMessage,
        cycleName: cycleName,
        timestamp: result.timestamp
      });
      localStorage.setItem('codefocus-commits', JSON.stringify(commits));
      
      onCommit && onCommit(result);
      onClose();
      
      // Limpar mensagem
      setCommitMessage('');
    } catch (error) {
      console.error('Erro ao salvar commit:', error);
      alert('Erro ao salvar commit. Verifique o console para mais detalhes.');
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            📝 Commit Manual
          </h3>
          <p className="text-white/70 text-sm">
            {cycleName ? `Ciclo: ${cycleName}` : 'Ciclo de foco finalizado'}
          </p>
        </div>

        {/* Mensagem de commit */}
        <div className="mb-4">
          <label className="block text-white/70 text-sm mb-2">
            Mensagem do commit:
          </label>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            placeholder="Descreva o que você fez neste ciclo de foco..."
          />
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20"
            disabled={isCommitting}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || isCommitting}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCommitting ? 'Salvando...' : 'Salvar Commit'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/50 text-xs">
            💡 Dica: Descreva brevemente o que você conseguiu fazer neste ciclo
          </p>
        </div>
      </div>
    </div>
  );
};

export default GitCommitModal; 