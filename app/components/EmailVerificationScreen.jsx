import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';

const EmailVerificationScreen = ({ onBack }) => {
  const { pendingVerification, resendVerificationCode, loading } = useAuth();
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minuto
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendCode = async () => {
    const result = await resendVerificationCode(pendingVerification.email);
    if (result.success) {
      setTimeLeft(60);
      setCanResend(false);
      setError('');
    } else {
      setError(result.error || 'Erro ao reenviar código');
    }
  };

  if (!pendingVerification) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center relative overflow-hidden">
      {/* Logo Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <Image src="/logo-main.png" alt="Logo Background" width={384} height={384} className="object-contain opacity-20" />
      </div>
      
      {/* Logo Principal */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
          <Image src="/logo-main.png" alt="CodeFocus Logo" width={48} height={48} className="object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">CodeFocus</h1>
          <p className="text-gray-300 text-sm">Produtividade Dev no Ritmo do Código</p>
        </div>
      </div>
      
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/10">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Verificar E-mail</h2>
        
        <div className="text-center mb-6">
          <p className="text-gray-300 mb-2">
            Enviamos um <strong>link de confirmação</strong> para:
          </p>
          <p className="text-blue-400 font-medium">{pendingVerification.email}</p>
          <p className="text-gray-400 text-sm mt-3">
            Abra sua caixa de entrada, clique no link e depois volte aqui e faça login.
          </p>
        </div>

        {error && (
          <div className="text-red-400 text-sm mb-4 text-center">{error}</div>
        )}

        <div className="text-center space-y-4">
          {timeLeft > 0 ? (
            <p className="text-gray-400 text-sm">
              Reenviar email em: <span className="text-blue-400 font-mono">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
              disabled={loading}
            >
              Reenviar email de confirmação
            </button>
          )}

          <div className="border-t border-gray-600 pt-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white text-sm"
              disabled={loading}
            >
              ← Voltar para o registro
            </button>
          </div>
        </div>

        {/* Dica para desenvolvimento */}
        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <p className="text-yellow-400 text-xs text-center">
            💡 <strong>Dica:</strong> verifique também a caixa de spam/lixo eletrônico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationScreen; 