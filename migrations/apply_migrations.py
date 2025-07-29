#!/usr/bin/env python3
"""
Script para aplicar migrações do banco de dados CodeFocus
"""

import sqlite3
import os
import sys
from pathlib import Path

def apply_migrations(db_path="codefocus.db"):
    """Aplica todas as migrações no banco de dados"""
    
    # Verificar se o arquivo de migração existe
    setup_file = Path(__file__).parent / "setup_database.sql"
    if not setup_file.exists():
        print("❌ Arquivo setup_database.sql não encontrado!")
        return False
    
    try:
        # Conectar ao banco de dados
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"🗄️ Aplicando migrações no banco: {db_path}")
        
        # Ler e executar o script SQL
        with open(setup_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()
        
        # Executar o script
        cursor.executescript(sql_script)
        
        # Verificar se as tabelas foram criadas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
        tables = cursor.fetchall()
        
        print("✅ Migrações aplicadas com sucesso!")
        print(f"📊 Tabelas criadas: {len(tables)}")
        
        for table in tables:
            print(f"  - {table[0]}")
        
        # Verificar estrutura das principais tabelas
        print("\n🔍 Verificando estrutura das tabelas principais:")
        
        main_tables = ['users', 'cycles', 'user_settings', 'reports', 'spotify_tokens']
        for table in main_tables:
            try:
                cursor.execute(f"PRAGMA table_info({table})")
                columns = cursor.fetchall()
                print(f"\n📋 {table.upper()}:")
                for col in columns:
                    print(f"  - {col[1]} ({col[2]})")
            except sqlite3.OperationalError:
                print(f"⚠️ Tabela {table} não encontrada")
        
        conn.commit()
        conn.close()
        
        print(f"\n🎉 Banco de dados configurado com sucesso em: {os.path.abspath(db_path)}")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Erro ao aplicar migrações: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def create_test_user(db_path="codefocus.db"):
    """Cria um usuário de teste"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar se já existe um usuário de teste
        cursor.execute("SELECT id FROM users WHERE email = 'test@codefocus.dev'")
        if cursor.fetchone():
            print("ℹ️ Usuário de teste já existe")
            return True
        
        # Inserir usuário de teste
        cursor.execute("""
            INSERT INTO users (email, username, full_name, provider, is_verified, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """, ('test@codefocus.dev', 'testuser', 'Usuário Teste', 'email', 1, 1))
        
        user_id = cursor.lastrowid
        
        # Criar configurações padrão para o usuário
        cursor.execute("""
            INSERT INTO user_settings (user_id)
            VALUES (?)
        """, (user_id,))
        
        conn.commit()
        conn.close()
        
        print("✅ Usuário de teste criado com sucesso!")
        print("📧 Email: test@codefocus.dev")
        print("👤 Username: testuser")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Erro ao criar usuário de teste: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 CodeFocus - Aplicador de Migrações")
    print("=" * 50)
    
    # Verificar argumentos
    db_path = "codefocus.db"
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    
    # Aplicar migrações
    if apply_migrations(db_path):
        # Perguntar se quer criar usuário de teste
        response = input("\n🤔 Criar usuário de teste? (s/n): ").lower()
        if response in ['s', 'sim', 'y', 'yes']:
            create_test_user(db_path)
        
        print("\n📝 Próximos passos:")
        print("1. Inicie o backend: cd backend && uvicorn app.main:app --reload")
        print("2. Inicie o frontend: npm start")
        print("3. Acesse: http://localhost:3000")
    else:
        print("\n❌ Falha ao aplicar migrações!")
        sys.exit(1)

if __name__ == "__main__":
    main() 