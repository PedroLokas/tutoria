// Configurações das planilhas Google Sheets
const CONFIG = {
    // URLs das planilhas - SUBSTITUA pelos IDs reais das suas planilhas
    DISCIPLINES_SHEET_ID: '1k8N2o0UeuL07deKEUkSZPFF9gi9PgbEsxAnWFnvWn1Y',
    ACTIVITIES_SHEET_ID: '1qYOAc_WwuX88rZ5faQpSAM3vdZNMZqOWITwGNuiEvgg',
    
    // URLs completas (serão construídas automaticamente)
    get DISCIPLINES_URL() {
        return `https://docs.google.com/spreadsheets/d/${this.DISCIPLINES_SHEET_ID}/gviz/tq?tqx=out:json`;
    },
    get ACTIVITIES_URL() {
        return `https://docs.google.com/spreadsheets/d/${this.ACTIVITIES_SHEET_ID}/gviz/tq?tqx=out:json`;
    }
};

// Estado da aplicação
const AppState = {
    currentPage: '',
    theme: 'light',
    disciplinesData: [],
    activitiesData: [],
    currentContent: null,
    contentId: null
};

// Utilitários
const Utils = {
    // Parser para dados do Google Sheets
    parseGoogleSheetsData(response) {
        try {
            // Remove o prefixo do JSONP
            const jsonString = response.substring(47).slice(0, -2);
            const data = JSON.parse(jsonString);
            
            if (!data.table || !data.table.rows) {
                return [];
            }
            
            const rows = data.table.rows;
            const headers = data.table.cols.map(col => col.label || '');
            
            return rows.map(row => {
                const rowData = {};
                row.c.forEach((cell, index) => {
                    const header = headers[index];
                    rowData[header] = cell ? cell.v : '';
                });
                return rowData;
            });
        } catch (error) {
            console.error('Erro ao fazer parse dos dados:', error);
            return [];
        }
    },

    // Agrupar dados por disciplina
    groupByDiscipline(data, disciplineKey = 'Disciplina') {
        const grouped = {};
        data.forEach(item => {
            const discipline = item[disciplineKey] || 'Sem Disciplina';
            if (!grouped[discipline]) {
                grouped[discipline] = [];
            }
            grouped[discipline].push(item);
        });
        return grouped;
    },

    // Formatar data
    formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch {
            return dateString;
        }
    },

    // Debounce para otimizar performance
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Gerar ID único para conteúdo
    generateContentId(discipline, title) {
        const cleanStr = (str) => str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        return `${cleanStr(discipline)}-${cleanStr(title)}`;
    },

    // Obter parâmetros da URL
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        return {
            id: params.get('id'),
            discipline: params.get('discipline'),
            title: params.get('title')
        };
    },

    // Criar URL para conteúdo
    createContentUrl(discipline, title) {
        const id = this.generateContentId(discipline, title);
        return `conteudo.html?id=${encodeURIComponent(id)}&discipline=${encodeURIComponent(discipline)}&title=${encodeURIComponent(title)}`;
    }
};

// Gerenciador de temas
const ThemeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },

    setTheme(theme) {
        AppState.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
    },

    toggleTheme() {
        const newTheme = AppState.theme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    updateThemeIcon() {
        const themeIcons = document.querySelectorAll('.theme-icon');
        const icon = AppState.theme === 'light' ? '🌙' : '☀️';
        themeIcons.forEach(iconEl => {
            iconEl.textContent = icon;
        });
    },

    setupThemeToggle() {
        const toggleButtons = document.querySelectorAll('#themeToggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
        });
    }
};

// Gerenciador de dados
const DataManager = {
    async fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            return Utils.parseGoogleSheetsData(text);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            throw error;
        }
    },

    async loadDisciplines() {
        try {
            const data = await this.fetchData(CONFIG.DISCIPLINES_URL);
            AppState.disciplinesData = data;
            return data;
        } catch (error) {
            console.error('Erro ao carregar disciplinas:', error);
            return [];
        }
    },

    async loadActivities() {
        try {
            const data = await this.fetchData(CONFIG.ACTIVITIES_URL);
            AppState.activitiesData = data;
            return data;
        } catch (error) {
            console.error('Erro ao carregar atividades:', error);
            return [];
        }
    }
};

// Renderizadores de página
const PageRenderers = {
    // Renderizar página de disciplinas
    async renderDisciplines() {
        const container = document.getElementById('disciplinesContainer');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');

        if (!container) return;

        try {
            loading.style.display = 'block';
            errorMessage.style.display = 'none';

            const data = await DataManager.loadDisciplines();
            
            if (data.length === 0) {
                this.showEmptyState(container, 'Nenhuma disciplina encontrada.');
                return;
            }

            const groupedData = Utils.groupByDiscipline(data);
            container.innerHTML = this.buildDisciplinesHTML(groupedData);
            this.setupDisciplineToggles();

        } catch (error) {
            console.error('Erro ao renderizar disciplinas:', error);
            errorMessage.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    },

    buildDisciplinesHTML(groupedData) {
        return Object.entries(groupedData).map(([discipline, contents]) => `
            <div class="discipline-folder" data-discipline="${discipline}">
                <div class="discipline-header">
                    <h3 class="discipline-title">${discipline}</h3>
                    <span class="discipline-toggle">▼</span>
                </div>
                <div class="discipline-content">
                    <div class="content-list">
                        ${contents.map(content => `
                            <div class="content-item">
                                <h4 class="content-title">${content['Título do conteúdo'] || 'Sem título'}</h4>
                                <p class="content-description">${content['Descrição'] || 'Sem descrição'}</p>
                                <div class="content-actions">
                                    <a href="${Utils.createContentUrl(discipline, content['Título do conteúdo'] || 'Sem título')}" class="content-link content-link-detail">
                                        📖 Ver conteúdo detalhado
                                    </a>
                                    ${content['Link do arquivo'] ? `
                                        <a href="${content['Link do arquivo']}" target="_blank" rel="noopener noreferrer" class="content-link content-link-file">
                                            📄 Abrir arquivo
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Renderizar página de atividades
    async renderActivities() {
        const container = document.getElementById('activitiesContainer');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');

        if (!container) return;

        try {
            loading.style.display = 'block';
            errorMessage.style.display = 'none';

            const data = await DataManager.loadActivities();
            
            if (data.length === 0) {
                this.showEmptyState(container, 'Nenhuma atividade encontrada.');
                return;
            }

            const groupedData = Utils.groupByDiscipline(data);
            container.innerHTML = this.buildActivitiesHTML(groupedData);

        } catch (error) {
            console.error('Erro ao renderizar atividades:', error);
            errorMessage.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    },

    buildActivitiesHTML(groupedData) {
        return Object.entries(groupedData).map(([discipline, activities]) => `
            <div class="activity-group">
                <div class="activity-group-header">
                    <h3 class="activity-group-title">${discipline}</h3>
                </div>
                <div class="activity-list">
                    ${activities.map(activity => `
                        <div class="activity-item">
                            <div class="activity-header">
                                <h4 class="activity-title">${activity['Título da atividade'] || 'Sem título'}</h4>
                                ${activity['Data'] ? `
                                    <span class="activity-date">${Utils.formatDate(activity['Data'])}</span>
                                ` : ''}
                            </div>
                            ${activity['Link do Formulário'] ? `
                                <a href="${activity['Link do Formulário']}" target="_blank" rel="noopener noreferrer" class="activity-link">
                                    📝 Acessar formulário
                                </a>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    showEmptyState(container, message) {
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem 0; color: var(--text-secondary);">
                <p>${message}</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">
                    Verifique se as planilhas estão configuradas corretamente.
                </p>
            </div>
        `;
    },

    setupDisciplineToggles() {
        const headers = document.querySelectorAll('.discipline-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const folder = header.parentElement;
                folder.classList.toggle('expanded');
            });
        });
    },

    // Renderizar página de conteúdo detalhado
    async renderContentDetail() {
        const params = Utils.getUrlParams();
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');
        const contentDetail = document.getElementById('contentDetail');

        if (!params.discipline || !params.title) {
            this.showContentError();
            return;
        }

        try {
            loading.style.display = 'block';
            errorMessage.style.display = 'none';
            contentDetail.style.display = 'none';

            // Carregar dados das disciplinas se ainda não foram carregados
            if (AppState.disciplinesData.length === 0) {
                await DataManager.loadDisciplines();
            }

            // Encontrar o conteúdo específico
            const content = this.findContentByParams(params);
            
            if (!content) {
                this.showContentError();
                return;
            }

            AppState.currentContent = content;
            AppState.contentId = params.id;

            // Renderizar o conteúdo
            this.populateContentDetail(content, params.discipline);
            this.setupContentNavigation(params.discipline);

            contentDetail.style.display = 'block';

        } catch (error) {
            console.error('Erro ao carregar conteúdo:', error);
            this.showContentError();
        } finally {
            loading.style.display = 'none';
        }
    },

    findContentByParams(params) {
        return AppState.disciplinesData.find(item => 
            item['Disciplina'] === params.discipline && 
            item['Título do conteúdo'] === params.title
        );
    },

    populateContentDetail(content, discipline) {
        // Atualizar título da página
        document.getElementById('pageTitle').textContent = `${content['Título do conteúdo']} - Tutoria Pedro Lucas`;
        
        // Atualizar breadcrumb
        document.getElementById('breadcrumbDiscipline').textContent = discipline;
        document.getElementById('breadcrumbContent').textContent = content['Título do conteúdo'];
        
        // Atualizar cabeçalho do conteúdo
        document.getElementById('contentDiscipline').textContent = discipline;
        document.getElementById('contentTitle').textContent = content['Título do conteúdo'];
        document.getElementById('contentDescription').textContent = content['Descrição'] || '';
        
        // Renderizar texto explicativo
        this.renderContentText(content);
        
        // Renderizar recursos/links
        this.renderContentResources(content);
    },

    renderContentText(content) {
        const textContainer = document.getElementById('contentText');
        
        // Verificar se existe texto explicativo na planilha
        const explanatoryText = content['Texto Explicativo'] || content['Conteúdo'] || content['Explicação'];
        
        if (explanatoryText) {
            // Converter quebras de linha em parágrafos
            const paragraphs = explanatoryText.split('\n').filter(p => p.trim());
            textContainer.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
        } else {
            // Texto padrão se não houver conteúdo específico
            textContainer.innerHTML = `
                <p>Este conteúdo faz parte da disciplina <strong>${content['Disciplina']}</strong>.</p>
                <p>${content['Descrição'] || 'Conteúdo educacional disponível para estudo.'}</p>
                <p>Utilize os recursos abaixo para acessar os materiais relacionados a este tópico.</p>
            `;
        }
    },

    renderContentResources(content) {
        const resourcesContainer = document.getElementById('contentResources');
        const resources = [];
        
        // Adicionar link do arquivo principal se existir
        if (content['Link do arquivo']) {
            resources.push({
                title: 'Material Principal',
                url: content['Link do arquivo'],
                type: 'file',
                icon: '📄'
            });
        }
        
        // Adicionar links adicionais se existirem
        if (content['Link Adicional 1']) {
            resources.push({
                title: content['Título Link 1'] || 'Recurso Adicional 1',
                url: content['Link Adicional 1'],
                type: 'link',
                icon: '🔗'
            });
        }
        
        if (content['Link Adicional 2']) {
            resources.push({
                title: content['Título Link 2'] || 'Recurso Adicional 2',
                url: content['Link Adicional 2'],
                type: 'link',
                icon: '🔗'
            });
        }
        
        if (resources.length > 0) {
            resourcesContainer.innerHTML = `
                <h3>Recursos e Materiais</h3>
                <div class="resources-list">
                    ${resources.map(resource => `
                        <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-item">
                            <span class="resource-icon">${resource.icon}</span>
                            <span class="resource-title">${resource.title}</span>
                            <span class="resource-external">↗</span>
                        </a>
                    `).join('')}
                </div>
            `;
        } else {
            resourcesContainer.innerHTML = '';
        }
    },

    setupContentNavigation(currentDiscipline) {
        const navigationContainer = document.getElementById('contentNavigation');
        
        // Obter outros conteúdos da mesma disciplina
        const disciplineContents = AppState.disciplinesData.filter(item => 
            item['Disciplina'] === currentDiscipline
        );
        
        if (disciplineContents.length > 1) {
            const currentIndex = disciplineContents.findIndex(item => 
                item['Título do conteúdo'] === AppState.currentContent['Título do conteúdo']
            );
            
            const prevContent = currentIndex > 0 ? disciplineContents[currentIndex - 1] : null;
            const nextContent = currentIndex < disciplineContents.length - 1 ? disciplineContents[currentIndex + 1] : null;
            
            navigationContainer.innerHTML = `
                <div class="content-nav-buttons">
                    ${prevContent ? `
                        <a href="${Utils.createContentUrl(currentDiscipline, prevContent['Título do conteúdo'])}" class="nav-button nav-prev">
                            ← ${prevContent['Título do conteúdo']}
                        </a>
                    ` : ''}
                    ${nextContent ? `
                        <a href="${Utils.createContentUrl(currentDiscipline, nextContent['Título do conteúdo'])}" class="nav-button nav-next">
                            ${nextContent['Título do conteúdo']} →
                        </a>
                    ` : ''}
                </div>
                <a href="index.html" class="back-to-disciplines">← Voltar às Disciplinas</a>
            `;
        } else {
            navigationContainer.innerHTML = `
                <a href="index.html" class="back-to-disciplines">← Voltar às Disciplinas</a>
            `;
        }
    },

    showContentError() {
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('errorMessage');
        const contentDetail = document.getElementById('contentDetail');
        
        loading.style.display = 'none';
        contentDetail.style.display = 'none';
        errorMessage.style.display = 'block';
    }
};

// Gerenciador de navegação
const NavigationManager = {
    init() {
        this.detectCurrentPage();
        this.setupNavigation();
    },

    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('atividades.html')) {
            AppState.currentPage = 'activities';
        } else if (path.includes('sobre.html')) {
            AppState.currentPage = 'about';
        } else if (path.includes('conteudo.html')) {
            AppState.currentPage = 'content';
        } else {
            AppState.currentPage = 'disciplines';
        }
    },

    setupNavigation() {
        // Adicionar indicador de página ativa
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (
                (AppState.currentPage === 'disciplines' && href === 'index.html') ||
                (AppState.currentPage === 'activities' && href === 'atividades.html') ||
                (AppState.currentPage === 'about' && href === 'sobre.html')
            ) {
                link.classList.add('active');
            }
        });
    }
};

// Inicialização da aplicação
const App = {
    async init() {
        try {
            // Inicializar gerenciadores
            ThemeManager.init();
            NavigationManager.init();

            // Renderizar conteúdo baseado na página atual
            await this.renderCurrentPage();

            // Configurar listeners globais
            this.setupGlobalListeners();

        } catch (error) {
            console.error('Erro na inicialização da aplicação:', error);
        }
    },

    async renderCurrentPage() {
        switch (AppState.currentPage) {
            case 'disciplines':
                await PageRenderers.renderDisciplines();
                break;
            case 'activities':
                await PageRenderers.renderActivities();
                break;
            case 'content':
                await PageRenderers.renderContentDetail();
                break;
            case 'about':
                // Página sobre não precisa de renderização dinâmica
                break;
        }
    },

    setupGlobalListeners() {
        // Listener para redimensionamento da janela
        window.addEventListener('resize', Utils.debounce(() => {
            // Reajustar layout se necessário
        }, 250));

        // Listener para mudanças de tema do sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    ThemeManager.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Exportar para uso global (se necessário)
window.TutoriaApp = {
    CONFIG,
    AppState,
    Utils,
    ThemeManager,
    DataManager,
    PageRenderers,
    NavigationManager,
    App
};

