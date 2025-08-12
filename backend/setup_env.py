#!/usr/bin/env python3
"""
Script para configurar o ambiente do CodeFocus Backend
Ajuda na criação do arquivo .env com as configurações necessárias
"""

import os
import secrets
import shutil

def generate_secret_key():
    """Gera uma chave secreta segura"""
    return secrets.token_urlsafe(32)

def setup_environment():
    """Configura o arquivo .env"""
    print("🚀 Configuração do CodeFocus Backend")
    print("=" * 50)
    
    # Verificar se .env já existe
    env_file = ".env"
    if os.path.exists(env_file):
        response = input(f"⚠️  Arquivo {env_file} já existe. Sobrescrever? (s/N): ")
        if response.lower() not in ['s', 'sim', 'y', 'yes']:
            print("❌ Configuração cancelada.")
            return
    
    # Gerar chave secreta
    secret_key = generate_secret_key()
    print(f"🔐 Chave secreta gerada: {secret_key[:10]}...")
    
    # Solicitar configurações do Resend
    print("\n📧 Configuração do Resend:")
    print("1. Acesse https://resend.com e crie uma conta")
    print("2. Obtenha sua API Key no dashboard")
    print("3. Para desenvolvimento, você pode usar: onboarding@resend.dev")
    
    resend_key = input("\n🔑 API Key do Resend (re_...): ").strip()
    if not resend_key:
        resend_key = "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        print("⚠️  Usando placeholder - configure depois!")
    
    mail_from = input("📨 Email de envio (ex: noreply@seudominio.com): ").strip()
    if not mail_from:
        mail_from = "onboarding@resend.dev"
        print("📧 Usando domínio de teste do Resend")
    
    # URLs da aplicação
    backend_url = input("🖥️  URL do Backend (padrão: http://localhost:8000): ").strip()
    if not backend_url:
        backend_url = "http://localhost:8000"
    
    frontend_url = input("🌐 URL do Frontend (padrão: http://localhost:3000): ").strip()
    if not frontend_url:
        frontend_url = "http://localhost:3000"
    
    # Criar conteúdo do .env
    env_content = f"""# CodeFocus Backend - Variáveis de Ambiente
# Gerado automaticamente em {os.path.basename(__file__)}

# Configurações do Banco de Dados
DATABASE_URL=sqlite:///./codefocus.db

# Configurações de Segurança
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs da Aplicação
BACKEND_URL={backend_url}
FRONTEND_URL={frontend_url}

# Configurações do Resend (Email)
RESEND_API_KEY={resend_key}
MAIL_FROM={mail_from}
"""
    
    # Escrever arquivo .env
    try:
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(env_content)
        
        print(f"\n✅ Arquivo {env_file} criado com sucesso!")
        print("\n📋 Próximos passos:")
        print("1. Execute: pip install -r requirements.txt")
        print("2. Execute: python -m uvicorn app.main:app --reload")
        print("3. Acesse: http://localhost:8000/docs")
        
        if resend_key.startswith("re_xxxxxxxx"):
            print("\n⚠️  IMPORTANTE: Configure sua API Key do Resend no arquivo .env")
        
    except Exception as e:
        print(f"❌ Erro ao criar arquivo .env: {e}")

def show_help():
    """Mostra ajuda sobre configuração"""
    print("📖 Ajuda - Configuração do CodeFocus")
    print("=" * 40)
    print("\n🔧 Resend (Email):")
    print("• Site: https://resend.com")
    print("• Plano gratuito: 3.000 emails/mês")
    print("• Domínio de teste: onboarding@resend.dev")
    print("• API Key: Dashboard > API Keys > Create API Key")
    
    print("\n🗄️  Banco de Dados:")
    print("• SQLite para desenvolvimento (local)")
    print("• PostgreSQL recomendado para produção")
    
    print("\n🔐 Segurança:")
    print("• SECRET_KEY: Gerada automaticamente")
    print("• JWT: Tokens de 30 minutos")
    print("• Senhas: Hash bcrypt")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        show_help()
    else:
        setup_environment()
