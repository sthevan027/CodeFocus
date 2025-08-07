import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IntegrationsPage = () => {
  const navigate = useNavigate();
  const [activeIntegration, setActiveIntegration] = useState(null);

  const integrations = [
    {
      id: 'spotify',
      name: 'Spotify',
      icon: '🎵',
      description: 'Sincronize suas músicas favoritas e controle a reprodução durante os ciclos de foco',
      status: 'coming-soon',
      color: 'from-green-500 to-green-600',
      features: [
        'Controle de reprodução integrado',
        'Playlists personalizadas para foco',
        'Pausar música automaticamente nas pausas',
        'Estatísticas de músicas mais ouvidas'
      ]
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: '🐙',
      description: 'Conecte seus repositórios e acompanhe commits durante as sessões',
      status: 'coming-soon',
      color: 'from-gray-700 to-gray-800',
      features: [
        'Registro automático de commits',
        'Estatísticas de produtividade por projeto',
        'Integração com issues e PRs',
        'Visualização de atividade'
      ]
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      description: 'Sincronize suas tarefas e notas com seu workspace do Notion',
      status: 'coming-soon',
      color: 'from-gray-600 to-gray-700',
      features: [
        'Sincronização de tarefas',
        'Criação automática de páginas de sessão',
        'Templates personalizados',
        'Backup de dados'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Integrações</h1>
            <p className="text-white/60">Conecte suas ferramentas favoritas ao CodeFocus</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Voltar
          </button>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-200 cursor-pointer"
              onClick={() => setActiveIntegration(integration)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${integration.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{integration.name}</h3>
                    {integration.status === 'coming-soon' && (
                      <span className="text-xs text-yellow-400 font-medium">Em breve</span>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-white/60 text-sm mb-4">{integration.description}</p>
              
              <button
                className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${
                  integration.status === 'coming-soon'
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={integration.status === 'coming-soon'}
              >
                {integration.status === 'coming-soon' ? 'Em desenvolvimento' : 'Conectar'}
              </button>
            </div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/20 rounded-full">
            <span className="text-yellow-400">⚡</span>
            <p className="text-yellow-400 font-medium">
              Novas integrações em breve! Estamos trabalhando para trazer as melhores ferramentas para você.
            </p>
          </div>
        </div>
      </div>

      {/* Integration Detail Modal */}
      {activeIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50" onClick={() => setActiveIntegration(null)}>
          <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${activeIntegration.color} rounded-xl flex items-center justify-center text-3xl`}>
                {activeIntegration.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{activeIntegration.name}</h2>
                {activeIntegration.status === 'coming-soon' && (
                  <span className="text-sm text-yellow-400 font-medium">Em desenvolvimento</span>
                )}
              </div>
            </div>

            <p className="text-white/80 mb-6">{activeIntegration.description}</p>

            <div className="mb-6">
              <h3 className="text-white font-semibold mb-3">Recursos planejados:</h3>
              <ul className="space-y-2">
                {activeIntegration.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-white/60 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {activeIntegration.status === 'coming-soon' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  🚧 Esta integração está em desenvolvimento e estará disponível em breve!
                </p>
              </div>
            )}

            <button
              onClick={() => setActiveIntegration(null)}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsPage;