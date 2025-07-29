#!/usr/bin/env python3
"""
Script de setup do banco de dados CodeFocus
Executa as migrações e configura o ambiente inicial
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, cwd=None):
    """Executa um comando e retorna o resultado"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd, 
            capture_output=True, 
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def setup_database():
    """Configura o banco de dados"""
    print("🗄️ Configurando banco de dados CodeFocus...")
    
    # Verificar se estamos no diretório correto
    if not Path("migrations").exists():
        print("❌ Diretório 'migrations' não encontrado!")
        print("💡 Execute este script da raiz do projeto CodeFocus")
        return False
    
    # Executar o script de migrações
    migrations_script = Path("migrations") / "apply_migrations.py"
    if migrations_script.exists():
        success, stdout, stderr = run_command(f"python {migrations_script}")
        if success:
            print("✅ Banco de dados configurado com sucesso!")
            return True
        else:
            print(f"❌ Erro ao configurar banco: {stderr}")
            return False
    else:
        print("❌ Script de migrações não encontrado!")
        return False

def setup_backend():
    """Configura o backend"""
    print("\n🐍 Configurando backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Diretório 'backend' não encontrado!")
        return False
    
    # Verificar se requirements.txt existe
    requirements_file = backend_dir / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txt não encontrado!")
        return False
    
    # Instalar dependências Python
    print("📦 Instalando dependências Python...")
    success, stdout, stderr = run_command("pip install -r requirements.txt", cwd=backend_dir)
    if success:
        print("✅ Dependências Python instaladas!")
    else:
        print(f"⚠️ Erro ao instalar dependências: {stderr}")
        print("💡 Tente executar manualmente: pip install -r backend/requirements.txt")
    
    return True

def setup_frontend():
    """Configura o frontend"""
    print("\n⚛️ Configurando frontend...")
    
    # Verificar se package.json existe
    package_file = Path("package.json")
    if not package_file.exists():
        print("❌ package.json não encontrado!")
        return False
    
    # Instalar dependências Node.js
    print("📦 Instalando dependências Node.js...")
    success, stdout, stderr = run_command("npm install")
    if success:
        print("✅ Dependências Node.js instaladas!")
    else:
        print(f"⚠️ Erro ao instalar dependências: {stderr}")
        print("💡 Tente executar manualmente: npm install")
    
    return True

def check_environment():
    """Verifica o ambiente de desenvolvimento"""
    print("🔍 Verificando ambiente de desenvolvimento...")
    
    # Verificar Python
    success, stdout, stderr = run_command("python --version")
    if success:
        print(f"✅ Python: {stdout.strip()}")
    else:
        print("❌ Python não encontrado!")
        return False
    
    # Verificar Node.js
    success, stdout, stderr = run_command("node --version")
    if success:
        print(f"✅ Node.js: {stdout.strip()}")
    else:
        print("❌ Node.js não encontrado!")
        return False
    
    # Verificar npm
    success, stdout, stderr = run_command("npm --version")
    if success:
        print(f"✅ npm: {stdout.strip()}")
    else:
        print("❌ npm não encontrado!")
        return False
    
    return True

def main():
    """Função principal"""
    print("🚀 CodeFocus - Setup do Ambiente de Desenvolvimento")
    print("=" * 60)
    
    # Verificar ambiente
    if not check_environment():
        print("\n❌ Ambiente não configurado corretamente!")
        print("💡 Instale Python 3.8+ e Node.js 16+")
        sys.exit(1)
    
    # Setup do banco de dados
    if not setup_database():
        print("\n❌ Falha ao configurar banco de dados!")
        sys.exit(1)
    
    # Setup do backend
    setup_backend()
    
    # Setup do frontend
    setup_frontend()
    
    print("\n🎉 Setup concluído com sucesso!")
    print("\n📝 Próximos passos:")
    print("1. Configure as variáveis de ambiente:")
    print("   cp env.example .env")
    print("   # Edite o arquivo .env com suas configurações")
    print("\n2. Inicie o backend:")
    print("   cd backend")
    print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print("\n3. Inicie o frontend (em outro terminal):")
    print("   npm start")
    print("\n4. Acesse a aplicação:")
    print("   http://localhost:3000")
    print("\n📚 Documentação:")
    print("   - docs/README.md")
    print("   - docs/DOCUMENTACAO_TECNICA.md")

if __name__ == "__main__":
    main() 