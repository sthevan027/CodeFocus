// Utilitário para integração Git
class GitManager {
  constructor() {
    this.git = null;
    this.isGitRepo = false;
    this.repoPath = null;
    this.isAvailable = false;
    this.init();
  }

  async init() {
    try {
      // Verificar se estamos no Electron (ambiente desktop)
      if (typeof window !== 'undefined' && window.require) {
        // Ambiente Electron - Git disponível
        this.isAvailable = true;
        await this.initializeGit();
      } else {
        // Ambiente web - Git simulado para desenvolvimento
        this.isAvailable = true;
        this.isGitRepo = true;
        this.repoPath = '/codefocus-project';
        console.log('Git simulado ativo para desenvolvimento web');
      }
    } catch (error) {
      console.error('Erro ao inicializar Git:', error);
      this.isAvailable = false;
    }
  }

  async initializeGit() {
    try {
      // Carregar simple-git apenas no Electron
      if (window.require) {
        const simpleGit = window.require('simple-git');
        this.git = simpleGit();
        const isRepo = await this.git.checkIsRepo();
        
        if (isRepo) {
          this.isGitRepo = true;
          this.repoPath = await this.git.cwd();
          console.log('Repositório Git detectado:', this.repoPath);
        } else {
          console.log('Não é um repositório Git');
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar Git:', error);
      this.isAvailable = false;
    }
  }

  // Verificar se é um repositório Git válido
  async checkGitStatus() {
    if (!this.isAvailable || !this.isGitRepo) {
      return { 
        isValid: false, 
        reason: this.isAvailable ? 'Não é um repositório Git' : 'Git não disponível neste ambiente'
      };
    }

    try {
      // Se estamos no ambiente web, simular mudanças
      if (!this.git) {
        // Simular mudanças para desenvolvimento
        return {
          isValid: true,
          hasChanges: true,
          stagedFiles: 2,
          unstagedFiles: 3,
          untrackedFiles: 1,
          currentBranch: 'main'
        };
      }

      // Verificar se há mudanças (ambiente Electron)
      const status = await this.git.status();
      
      return {
        isValid: true,
        hasChanges: !status.isClean(),
        stagedFiles: status.staged.length,
        unstagedFiles: status.modified.length + status.created.length + status.deleted.length,
        untrackedFiles: status.not_added.length,
        currentBranch: status.current
      };
    } catch (error) {
      console.error('Erro ao verificar status Git:', error);
      return { isValid: false, reason: error.message };
    }
  }

  // Obter mudanças recentes
  async getRecentChanges() {
    if (!this.isAvailable || !this.isGitRepo) {
      return [];
    }

    try {
      // Se estamos no ambiente web, simular mudanças
      if (!this.git) {
        // Simular mudanças para desenvolvimento
        return [
          { file: 'src/components/Timer.jsx', type: 'modified' },
          { file: 'src/components/Dashboard.jsx', type: 'modified' },
          { file: 'src/App.jsx', type: 'modified' },
          { file: 'package.json', type: 'modified' },
          { file: 'README.md', type: 'modified' },
          { file: 'new-feature.js', type: 'created' }
        ];
      }

      // Obter mudanças reais (ambiente Electron)
      const status = await this.git.status();
      const changes = [];

      // Arquivos modificados
      status.modified.forEach(file => {
        changes.push({ file, type: 'modified' });
      });

      // Arquivos criados
      status.created.forEach(file => {
        changes.push({ file, type: 'created' });
      });

      // Arquivos deletados
      status.deleted.forEach(file => {
        changes.push({ file, type: 'deleted' });
      });

      return changes;
    } catch (error) {
      console.error('Erro ao obter mudanças recentes:', error);
      return [];
    }
  }

  // Gerar mensagem de commit inteligente
  generateCommitMessage(changes, cycleName = '') {
    if (!changes || changes.length === 0) {
      return cycleName ? `feat: ${cycleName}` : 'feat: atualizações gerais';
    }

    const fileTypes = {
      modified: [],
      created: [],
      deleted: []
    };

    changes.forEach(change => {
      fileTypes[change.type].push(change.file);
    });

    let message = cycleName ? `${cycleName}: ` : '';

    if (fileTypes.created.length > 0) {
      message += `add ${fileTypes.created.length} arquivo(s)`;
    } else if (fileTypes.modified.length > 0) {
      message += `update ${fileTypes.modified.length} arquivo(s)`;
    } else if (fileTypes.deleted.length > 0) {
      message += `remove ${fileTypes.deleted.length} arquivo(s)`;
    }

    return message;
  }

  // Fazer commit das mudanças
  async commitChanges(cycleName = '') {
    if (!this.isAvailable || !this.isGitRepo) {
      return { 
        success: false, 
        reason: this.isAvailable ? 'Não é um repositório Git' : 'Git não disponível neste ambiente'
      };
    }

    try {
      // Se estamos no ambiente web, simular commit
      if (!this.git) {
        // Simular commit para desenvolvimento
        const changes = await this.getRecentChanges();
        const commitMessage = this.generateCommitMessage(changes, cycleName);
        
        console.log('Commit simulado:', commitMessage);
        
        return {
          success: true,
          commitHash: 'simulated-' + Date.now(),
          message: commitMessage,
          filesChanged: changes.length
        };
      }

      // Fazer commit real (ambiente Electron)
      const status = await this.git.status();
      
      // Verificar se há mudanças para commitar
      if (status.isClean()) {
        return { success: false, reason: 'Não há mudanças para commitar' };
      }

      // Adicionar todos os arquivos
      await this.git.add('.');

      // Gerar mensagem de commit
      const changes = await this.getRecentChanges();
      const commitMessage = this.generateCommitMessage(changes, cycleName);

      // Fazer commit
      const result = await this.git.commit(commitMessage);

      return {
        success: true,
        commitHash: result.commit,
        message: commitMessage,
        filesChanged: changes.length
      };
    } catch (error) {
      console.error('Erro ao fazer commit:', error);
      return { success: false, reason: error.message };
    }
  }

  // Fazer push das mudanças
  async pushChanges() {
    if (!this.isAvailable || !this.isGitRepo) {
      return { 
        success: false, 
        reason: this.isAvailable ? 'Não é um repositório Git' : 'Git não disponível neste ambiente'
      };
    }

    try {
      // Se estamos no ambiente web, simular push
      if (!this.git) {
        console.log('Push simulado para desenvolvimento');
        return { success: true, result: 'simulated-push' };
      }

      // Fazer push real (ambiente Electron)
      const result = await this.git.push();
      return { success: true, result };
    } catch (error) {
      console.error('Erro ao fazer push:', error);
      return { success: false, reason: error.message };
    }
  }

  // Verificar se há conflitos
  async checkConflicts() {
    if (!this.isAvailable || !this.isGitRepo || !this.git) {
      return false;
    }

    try {
      const status = await this.git.status();
      return status.conflicted.length > 0;
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      return false;
    }
  }

  // Obter informações do repositório
  async getRepoInfo() {
    if (!this.isAvailable || !this.isGitRepo || !this.git) {
      return null;
    }

    try {
      const status = await this.git.status();
      const log = await this.git.log({ maxCount: 1 });
      
      return {
        currentBranch: status.current,
        lastCommit: log.latest ? log.latest.hash : null,
        lastCommitMessage: log.latest ? log.latest.message : null,
        lastCommitDate: log.latest ? log.latest.date : null
      };
    } catch (error) {
      console.error('Erro ao obter informações do repositório:', error);
      return null;
    }
  }
}

// Instância global
const gitManager = new GitManager();

export default gitManager; 