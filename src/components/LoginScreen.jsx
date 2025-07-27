import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ onGoToRegister }) => {
  const { loginWithEmail, loginWithGoogle, loginWithGitHub, loginAnonymously, loading } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/icon.png" alt="Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-bold text-white mb-1">CodeFocus</h1>
          <p className="text-gray-400 text-sm">Foque. Produza. Cresça.</p>
        </div>
        <h2 className="text-xl text-white text-center mb-4">Bem-vindo ao CodeFocus</h2>
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
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center bg-white text-gray-800 font-bold py-2 rounded mb-2 hover:bg-gray-100 transition disabled:opacity-50"
          disabled={loading}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 mr-2" />
          Continuar com Google
        </button>
        <button
          onClick={loginWithGitHub}
          className="w-full flex items-center justify-center bg-gray-900 text-white font-bold py-2 rounded mb-2 hover:bg-gray-700 transition disabled:opacity-50"
          disabled={loading}
        >
          <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5 mr-2" />
          Continuar com GitHub
        </button>
        <button
          onClick={loginAnonymously}
          className="w-full flex items-center justify-center bg-gray-600 text-white font-bold py-2 rounded mb-2 hover:bg-gray-500 transition disabled:opacity-50"
          disabled={loading}
        >
          <span className="mr-2">?</span>
          Continuar Anonimamente
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