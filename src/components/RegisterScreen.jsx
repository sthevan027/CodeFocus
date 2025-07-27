import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RegisterScreen = ({ onRegister, onGoToLogin }) => {
  const { registerUser, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setError('');
    try {
      const result = await registerUser({ name, email, password });
      if (!result.success) {
        setError(result.error || 'Erro no registro');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center relative overflow-hidden">
      {/* Logo de fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <img src="/logo.svg" alt="Logo Background" className="w-96 h-96 object-contain" />
      </div>
      
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/10">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.svg" alt="Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-bold text-white mb-1">CodeFocus</h1>
          <p className="text-gray-400 text-sm">Foque. Produza. Cresça.</p>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-6">Criar Conta</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nome"
            className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={loading}
          />
          <input
            type="email"
            placeholder="E-mail"
            className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirmar Senha"
            className="w-full mb-3 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>
        <div className="text-center mt-4">
          <button
            className="text-blue-400 hover:underline text-sm"
            onClick={onGoToLogin}
            disabled={loading}
          >
            Já tem conta? Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen; 