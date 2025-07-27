import React, { useState, useEffect } from 'react';
import gitManager from '../utils/gitUtils';
import notificationManager from '../utils/notificationUtils';

const GitCommitModal = ({ isOpen, onClose, cycleName, onCommit }) => {
  const [gitStatus, setGitStatus] = useState(null);
  const [changes, setChanges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGitInfo();
    }
  }, [isOpen]);

  const loadGitInfo = async () => {
    setIsLoading(true);
    try {
      const status = await gitManager.checkGitStatus();
      setGitStatus(status);

      if (status.isValid && status.hasChanges) {
        const recentChanges = await gitManager.getRecentChanges();
        setChanges(recentChanges);
        
        // Gerar mensagem de commit padrão
        const defaultMessage = gitManager.generateCommitMessage(recentChanges, cycleName);
        setCommitMessage(defaultMessage);
      }
    } catch (error) {
      console.error('Erro ao carregar informações Git:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    setIsCommitting(true);
    try {
      const result = await gitManager.commitChanges(commitMessage);
      
      if (result.success) {
        notificationManager.showNotification('✅ Commit realizado!', {
          body: `Commit: ${result.message}`,
          tag: 'git-commit-success'
        });
        onCommit && onCommit(result);
        onClose();
      } else {
        alert(`Erro ao fazer commit: ${result.reason}`);
      }
    } catch (error) {
      console.error('Erro ao fazer commit:', error);
      alert('Erro ao fazer commit. Verifique o console para mais detalhes.');
    } finally {
      setIsCommitting(false);
    }
  };

  const handlePush = async () => {
    try {
      const result = await gitManager.pushChanges();
      
      if (result.success) {
        notificationManager.showNotification('🚀 Push realizado!', {
          body: 'Mudanças enviadas para o repositório remoto',
          tag: 'git-push-success'
        });
      } else {
        alert(`Erro ao fazer push: ${result.reason}`);
      }
    } catch (error) {
      console.error('Erro ao fazer push:', error);
      alert('Erro ao fazer push. Verifique o console para mais detalhes.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            🚀 Commit Git
          </h3>
          <p className="text-white/70 text-sm">
            {cycleName ? `Ciclo: ${cycleName}` : 'Ciclo de foco finalizado'}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            <p className="text-white/70 mt-2">Verificando repositório...</p>
          </div>
        ) : !gitStatus?.isValid ? (
          <div className="text-center py-6">
            <p className="text-white/70 mb-4">
              {gitStatus?.reason || 'Não é um repositório Git válido'}
            </p>
            <button
              onClick={onClose}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20"
            >
              Fechar
            </button>
          </div>
        ) : !gitStatus?.hasChanges ? (
          <div className="text-center py-6">
            <p className="text-white/70 mb-4">
              Não há mudanças para commitar
            </p>
            <button
              onClick={onClose}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {/* Status do Git */}
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between text-sm text-white/80">
                <span>Branch:</span>
                <span className="font-mono">{gitStatus.currentBranch}</span>
              </div>
              <div className="flex justify-between text-sm text-white/80">
                <span>Mudanças:</span>
                <span>{changes.length} arquivo(s)</span>
              </div>
            </div>

            {/* Lista de mudanças */}
            {changes.length > 0 && (
              <div className="mb-4 max-h-32 overflow-y-auto">
                <p className="text-white/70 text-sm mb-2">Arquivos modificados:</p>
                {changes.slice(0, 5).map((change, index) => (
                  <div key={index} className="flex justify-between text-xs text-white/60 mb-1">
                    <span className="truncate">{change.file}</span>
                    <span className="ml-2 px-1 py-0.5 bg-white/10 rounded text-xs">
                      {change.type}
                    </span>
                  </div>
                ))}
                {changes.length > 5 && (
                  <p className="text-white/50 text-xs">... e mais {changes.length - 5} arquivo(s)</p>
                )}
              </div>
            )}

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
                placeholder="Descreva suas mudanças..."
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
                {isCommitting ? 'Commitando...' : 'Fazer Commit'}
              </button>
            </div>

            {/* Botão Push (opcional) */}
            <button
              onClick={handlePush}
              className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg"
            >
              🚀 Fazer Push
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GitCommitModal; 