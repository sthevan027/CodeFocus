import React, { useState, useEffect } from 'react';

const ProductivityTips = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tips = [
    {
      icon: "☕",
      title: "Dica de Produtividade",
      content: "A técnica Pomodoro clássica usa 25 minutos de foco e 5 minutos de pausa. Ajuste os tempos conforme sua necessidade, mas mantenha a consistência!"
    },
    {
      icon: "🎯",
      title: "Foco Profundo",
      content: "Desative notificações durante os ciclos de foco. Cada interrupção pode levar até 15 minutos para retomar a concentração."
    },
    {
      icon: "📊",
      title: "Acompanhe seu Progresso",
      content: "Use o dashboard para visualizar seus padrões de produtividade. Identifique seus horários mais produtivos e otimize sua rotina."
    },
    {
      icon: "🏷️",
      title: "Organize com Tags",
      content: "Crie tags específicas para diferentes tipos de trabalho (ex: #frontend, #backend, #bugfix). Isso ajuda a analisar onde você gasta mais tempo."
    },
    {
      icon: "🎵",
      title: "Música para Foco",
      content: "Conecte seu Spotify e use música ambiente ou playlists específicas para programação. Sons naturais ou instrumentais podem melhorar a concentração."
    },
    {
      icon: "💡",
      title: "Pausas Inteligentes",
      content: "Use as pausas para se alongar, beber água ou fazer exercícios rápidos. Movimento físico ajuda a manter a energia mental."
    },
    {
      icon: "📝",
      title: "Anote suas Conquistas",
      content: "Após cada ciclo, anote o que você conseguiu fazer. Isso cria um senso de progresso e motivação para continuar."
    },
    {
      icon: "🔄",
      title: "Consistência é Chave",
      content: "É melhor fazer 4 ciclos de 25 minutos por dia do que tentar maratonas de 4 horas. Construa o hábito gradualmente."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000); // Troca a cada 8 segundos

    return () => clearInterval(interval);
  }, [tips.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gray-800/90 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{tips[currentTip].icon}</div>
        <div className="flex-1">
          <h3 className="text-white font-semibold text-sm mb-1">
            {tips[currentTip].title}
          </h3>
          <p className="text-gray-300 text-xs leading-relaxed">
            {tips[currentTip].content}
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors text-sm"
        >
          ✕
        </button>
      </div>
      
      {/* Indicadores de progresso */}
      <div className="flex justify-center space-x-1 mt-3">
        {tips.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              index === currentTip ? 'bg-blue-400' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductivityTips; 