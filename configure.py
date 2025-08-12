#!/usr/bin/env python3
"""
CodeFocus - Script de Configuração Completa
Configura tanto o backend quanto o frontend automaticamente
"""

import os
import shutil
import secrets
import json

def print_header():
    """Imprime cabeçalho"""
    print("🚀 CodeFocus - Configuração Completa")
    print("=" * 50)
    print("Este script irá configurar:")
    print("• Backend (FastAPI + Resend)")
    print("• Frontend (React)")
    print("• Variáveis de ambiente")
    print("=" * 50)

def generate_secret_key():
    """Gera uma chave secreta segura"""
    return secrets.token_urlsafe(32)

def configure_backend():
    """Configura o backend"""
    print("\n📧 Configuração do Backend")
    print("-" * 30)
    
    backend_dir = "backend"
    env_file = os.path.join(backend_dir, ".env")
    
    # Verificar se .env já existe
    if os.path.exists(env_file):
        response = input(f"⚠️  Backend .env já existe. Sobrescrever? (s/N): ")
        if response.lower() not in ['s', 'sim', 'y', 'yes']:
            print("⏭️  Pulando configuração do backend...")
            return
    
    # Gerar chave secreta
    secret_key = generate_secret_key()
    print(f"🔐 Chave secreta gerada: {secret_key[:10]}...")
    
    # Configurações do Resend
    print("\n📨 Configuração do Resend:")
    print("• Site: https://resend.com")
    print("• Crie uma conta gratuita (3.000 emails/mês)")
    print("• Obtenha sua API Key no dashboard")
    
    resend_key = input("\n🔑 API Key do Resend (ou Enter para usar placeholder): ").strip()
    if not resend_key:
        resend_key = "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        print("⚠️  Usando placeholder - configure depois no .env!")
    
    mail_from = input("📧 Email de envio (ou Enter para usar teste): ").strip()
    if not mail_from:
        mail_from = "onboarding@resend.dev"
        print("📧 Usando domínio de teste do Resend")
    
    # URLs
    backend_url = input("🖥️  URL do Backend (Enter para padrão): ").strip() or "http://localhost:8000"
    frontend_url = input("🌐 URL do Frontend (Enter para padrão): ").strip() or "http://localhost:3000"
    
    # Criar conteúdo do .env do backend
    backend_env = f"""# CodeFocus Backend - Configuração Automática
# Gerado por configure.py

# Banco de Dados
DATABASE_URL=sqlite:///./codefocus.db

# Segurança
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs
BACKEND_URL={backend_url}
FRONTEND_URL={frontend_url}

# Email (Resend)
RESEND_API_KEY={resend_key}
MAIL_FROM={mail_from}
"""
    
    # Escrever arquivo
    os.makedirs(backend_dir, exist_ok=True)
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(backend_env)
    
    print(f"✅ Backend configurado: {env_file}")
    return backend_url

def configure_frontend(backend_url):
    """Configura o frontend"""
    print("\n🌐 Configuração do Frontend")
    print("-" * 30)
    
    env_file = ".env"
    
    # Verificar se .env já existe
    if os.path.exists(env_file):
        response = input(f"⚠️  Frontend .env já existe. Sobrescrever? (s/N): ")
        if response.lower() not in ['s', 'sim', 'y', 'yes']:
            print("⏭️  Pulando configuração do frontend...")
            return
    
    # Configuração do frontend
    frontend_env = f"""# CodeFocus Frontend - Configuração Automática
# Gerado por configure.py

# URL da API
REACT_APP_API_URL={backend_url}

# Configurações de desenvolvimento
REACT_APP_ENV=development
GENERATE_SOURCEMAP=false
"""
    
    # Escrever arquivo
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(frontend_env)
    
    print(f"✅ Frontend configurado: {env_file}")

def show_next_steps():
    """Mostra próximos passos"""
    print("\n🎉 Configuração Concluída!")
    print("=" * 30)
    
    print("\n📋 Próximos passos:")
    print("\n🔧 Backend:")
    print("  cd backend")
    print("  pip install -r requirements.txt")
    print("  python -m uvicorn app.main:app --reload")
    
    print("\n🌐 Frontend:")
    print("  pnpm install")
    print("  pnpm start")
    
    print("\n🌍 Acessar:")
    print("  • Frontend: http://localhost:3000")
    print("  • Backend API: http://localhost:8000/docs")
    
    print("\n⚠️  Importante:")
    print("  • Configure sua API Key do Resend se usou placeholder")
    print("  • Edite backend/.env conforme necessário")
    print("  • Para produção, configure domínio próprio")

def check_requirements():
    """Verifica se os diretórios existem"""
    print("\n🔍 Verificando estrutura do projeto...")
    
    if not os.path.exists("backend"):
        print("❌ Diretório 'backend' não encontrado!")
        return False
    
    if not os.path.exists("src"):
        print("❌ Diretório 'src' não encontrado!")
        return False
        
    if not os.path.exists("package.json"):
        print("❌ Arquivo 'package.json' não encontrado!")
        return False
    
    print("✅ Estrutura do projeto OK")
    return True

def main():
    """Função principal"""
    print_header()
    
    # Verificar requisitos
    if not check_requirements():
        print("\n❌ Execute este script na raiz do projeto CodeFocus")
        return
    
    try:
        # Configurar backend
        backend_url = configure_backend()
        
        # Configurar frontend
        configure_frontend(backend_url or "http://localhost:8000")
        
        # Mostrar próximos passos
        show_next_steps()
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Configuração cancelada pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro na configuração: {e}")

if __name__ == "__main__":
    main()
