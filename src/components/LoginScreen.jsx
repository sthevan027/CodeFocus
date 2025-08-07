import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ onGoToRegister }) => {
  const { loginWithEmail, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setError('');
    try {
      const result = await loginWithEmail(email, password);
      if (!result.success) {
        setError(result.error || 'Erro no login');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <img src="/logo-main.png" alt="Logo Background" className="w-96 h-96 object-contain opacity-20" />
      </div>

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
        <h2 className="text-xl text-white text-center mb-4">Entrar</h2>
        <form onSubmit={handleEmailLogin} className="mb-4">
          <input
            type="email"
            placeholder="E-mail"
            className="w-full mb-2 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full mb-2 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition mb-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={async () => {
            setError('');
            try {
              const result = await loginWithGoogle();
              if (!result.success) {
                setError(result.error || 'Erro no login com Google');
              }
            } catch (error) {
              setError('Erro ao conectar com o Google');
            }
          }}
          className="w-full flex items-center justify-center bg-white text-gray-800 font-bold py-2 rounded mb-2 hover:bg-gray-100 transition disabled:opacity-50"
          disabled={loading}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
          Continuar com Google
        </button>

        <button
          onClick={() => setError('Autenticação com GitHub: em breve')}
          className="w-full flex items-center justify-center bg-gray-900 text-white font-bold py-2 rounded mb-2 hover:bg-gray-800 transition disabled:opacity-50"
          disabled={loading}
        >
          <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5 mr-2 invert" />
          Continuar com GitHub
        </button>

        <div className="text-center mt-4">
          <button
            className="text-blue-400 hover:underline text-sm"
            onClick={onGoToRegister}
            type="button"
            disabled={loading}
          >
            Não tem conta? Criar agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; 