# Site de Tutoria - Pedro Lucas (Versão Atualizada)

Site estático minimalista e responsivo para tutoria educacional, com dados automatizados via Google Sheets públicos e **páginas de conteúdo detalhadas**.

## 🆕 Novas Funcionalidades

### Páginas de Conteúdo Detalhadas
- Cada conteúdo agora pode ter sua própria página com texto explicativo completo
- Suporte para textos longos e explicativos além dos arquivos
- Navegação entre conteúdos da mesma disciplina
- Breadcrumb para facilitar a navegação
- Links para recursos adicionais

### Estrutura Expandida das Planilhas
As planilhas agora suportam colunas adicionais para conteúdo mais rico:

#### Planilha de Disciplinas (Colunas Suportadas):
- **Disciplina** (obrigatório): Nome da disciplina
- **Título do conteúdo** (obrigatório): Título do material
- **Descrição** (obrigatório): Descrição breve
- **Link do arquivo** (opcional): URL do arquivo no Google Drive
- **Texto Explicativo** (opcional): Texto longo e detalhado para a página
- **Link Adicional 1** (opcional): URL de recurso adicional
- **Título Link 1** (opcional): Nome do primeiro link adicional
- **Link Adicional 2** (opcional): URL de segundo recurso adicional
- **Título Link 2** (opcional): Nome do segundo link adicional

## 🌐 Site Implantado

**URL Permanente:** https://fuixqehn.manus.space

O site já está implantado e funcionando com os IDs das planilhas fornecidos:
- Planilha Disciplinas: `1k8N2o0UeuL07deKEUkSZPFF9gi9PgbEsxAnWFnvWn1Y`
- Planilha Atividades: `1qYOAc_WwuX88rZ5faQpSAM3vdZNMZqOWITwGNuiEvgg`

## 📁 Estrutura Atualizada do Projeto

```
website_tutoria/
├── index.html          # Página principal (Disciplinas)
├── atividades.html     # Página de Atividades
├── sobre.html          # Página Sobre
├── conteudo.html       # 🆕 Página para conteúdo detalhado
├── styles.css          # Estilos CSS (expandidos)
├── scripts.js          # Funcionalidades JavaScript (atualizadas)
└── README_ATUALIZADO.md # Este arquivo
```

## 🚀 Como Usar as Novas Funcionalidades

### 1. Adicionando Conteúdo Detalhado

Na planilha de disciplinas, adicione uma coluna chamada **"Texto Explicativo"** e insira o texto completo que deseja exibir na página do conteúdo. Exemplo:

| Disciplina | Título do conteúdo | Descrição | Link do arquivo | Texto Explicativo |
|------------|-------------------|-----------|-----------------|-------------------|
| Matemática | Álgebra Linear | Conceitos básicos | https://drive.google.com/... | Este módulo aborda os conceitos fundamentais da álgebra linear, incluindo vetores, matrizes e transformações lineares. Você aprenderá sobre espaços vetoriais, dependência linear, bases e dimensão... |

### 2. Adicionando Links Adicionais

Para incluir recursos extras, use as colunas:
- **Link Adicional 1** e **Título Link 1**
- **Link Adicional 2** e **Título Link 2**

### 3. Navegação

- Na página principal, clique em **"📖 Ver conteúdo detalhado"** para acessar a página completa
- Use **"📄 Abrir arquivo"** para acessar diretamente o arquivo no Google Drive
- Na página de conteúdo, use os botões de navegação para ir para o próximo/anterior conteúdo
- Use o breadcrumb para voltar às disciplinas

## 🎨 Funcionalidades Mantidas

### Modo Claro/Escuro
- Botão no canto superior direito para alternar temas
- Preferência salva automaticamente no navegador

### Responsividade
- Layout adaptável para desktop, tablet e mobile
- Menu responsivo
- Cards e elementos otimizados para touch

### Carregamento Dinâmico
- Dados carregados automaticamente das planilhas
- Indicadores de carregamento
- Tratamento de erros

## 🔧 Configuração das Planilhas

### Permissões (Importante!)
1. Abra cada planilha no Google Sheets
2. Clique em "Compartilhar" (botão azul no canto superior direito)
3. Em "Acesso geral", selecione **"Qualquer pessoa com o link"**
4. Defina a permissão como **"Visualizador"**
5. Clique em "Copiar link" e salve o ID da planilha

### Estrutura Recomendada da Planilha de Disciplinas

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Disciplina | Título do conteúdo | Descrição | Link do arquivo | Texto Explicativo | Link Adicional 1 | Título Link 1 | Link Adicional 2 | Título Link 2 |
| Matemática | Álgebra Linear | Conceitos básicos de álgebra | https://drive.google.com/... | Texto longo explicativo aqui... | https://youtube.com/... | Vídeo Explicativo | https://site.com/... | Exercícios Online |

## 🌟 Exemplos de Uso

### Conteúdo Simples
- Apenas título, descrição e link do arquivo
- Página de conteúdo mostrará informações básicas

### Conteúdo Completo
- Título, descrição, arquivo principal
- Texto explicativo detalhado (pode ter vários parágrafos)
- Links adicionais para vídeos, exercícios, sites relacionados

### Texto Explicativo com Formatação
O texto explicativo suporta quebras de linha. Cada linha será convertida em um parágrafo separado:

```
Linha 1 do texto explicativo.

Linha 2 após uma linha em branco.
Linha 3 continuação do parágrafo anterior.
```

## 📱 Compatibilidade

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers

## 🔗 Links Importantes

- **Site Implantado:** https://fuixqehn.manus.space
- **Planilha Disciplinas:** [Editar no Google Sheets](https://docs.google.com/spreadsheets/d/1k8N2o0UeuL07deKEUkSZPFF9gi9PgbEsxAnWFnvWn1Y/edit)
- **Planilha Atividades:** [Editar no Google Sheets](https://docs.google.com/spreadsheets/d/1qYOAc_WwuX88rZ5faQpSAM3vdZNMZqOWITwGNuiEvgg/edit)

## 📄 Licença

Este projeto é de uso livre para fins educacionais.

---

**Desenvolvido para Pedro Lucas - Tutoria Educacional**
**Versão 2.0 com Páginas de Conteúdo Detalhadas**

