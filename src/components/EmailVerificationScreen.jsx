import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EmailVerificationScreen = ({ onBack }) => {
  const { pendingVerification, verifyEmail, resendVerificationCode, loading } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
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

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Digite o código de verificação');
      return;
    }

    setError('');
    const result = await verifyEmail(pendingVerification.email, verificationCode);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleResendCode = async () => {
    const result = await resendVerificationCode(pendingVerification.email);
    if (result.success) {
      setTimeLeft(300);
      setCanResend(false);
      setVerificationCode('');
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
        <img src="/logo-main.png" alt="Logo Background" className="w-96 h-96 object-contain opacity-20" />
      </div>
      
      {/* Logo Principal */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
          <img src="/logo-main.png" alt="CodeFocus Logo" className="w-12 h-12 object-contain" />
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
            Enviamos um código de verificação para:
          </p>
          <p className="text-blue-400 font-medium">{pendingVerification.email}</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm mb-2">
              Código de Verificação:
            </label>
            <input
              type="text"
              placeholder="Digite o código de 6 dígitos"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm mb-4 text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mb-4"
            disabled={loading || !verificationCode.trim()}
          >
            {loading ? 'Verificando...' : 'Verificar E-mail'}
          </button>
        </form>

        <div className="text-center space-y-4">
          {timeLeft > 0 ? (
            <p className="text-gray-400 text-sm">
              Reenviar código em: <span className="text-blue-400 font-mono">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
              disabled={loading}
            >
              Reenviar código de verificação
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
            💡 <strong>Dica:</strong> Abra o console do navegador (F12) para ver o código de verificação
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationScreen; 