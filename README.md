# 🎮 Escape do Vício — Jogo Educativo em Pixel Art

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Pixel Art](https://img.shields.io/badge/Pixel_Art-FF6B6B?style=for-the-badge&logo=game&logoColor=white)

##  

Um jogo web educativo desenvolvido com **HTML, CSS e JavaScript** que combina arte pixelada, gamificação e conscientização sobre vícios. O jogador embarca em uma jornada simbólica de libertação através de desafios educativos.

## 🎯 Objetivo do Projeto

Criar uma experiência gamificada que:

- **🎓 Eduque de Forma Interativa:** Conscientize sobre os perigos dos vícios
- **🎮 Engaje com Gameplay:** Mecânicas simples mas envolventes
- **🏆 Recompense o Progresso:** Sistema de conquistas e certificado
- **📱 Seja Acessível:** Funcione em qualquer navegador moderno

## ✨ Funcionalidades Principais

### 🎪 **Jornada Gamificada**
- **5 Desafios Progressivos:** Cadeados que liberam conforme avança
- **Personagem Controlável:** Movimento fluido com sprites em pixel art
- **Cenário Dinâmico:** Fundo rolante com efeito de profundidade
- **HUD Interativo:** Cadeados e sistema de vidas visuais

### 🏆 **Sistema de Recompensas**
- **Certificado Personalizável:** Gerado automaticamente ao completar o jogo
- **Estética 8-bit:** Fonte "Press Start 2P" e design retrô
- **Download Direto:** Baixe seu certificado de "Liberdade"
- **Partículas Comemorativas:** Efeitos visuais na tela de vitória

### 🎨 **Arte e Animação**
- **Sprites em Pixel Art:** Personagem com múltiplas animações
- **Porta Proporcional:** Dimensões ajustáveis sem distorção
- **Efeitos Visuais:** Partículas e transições suaves
- **Interface Temática:** Consistentemente estilo 8-bit

### 📜 **Certificado Gamificado**
- **Layout Dinâmico:** Ajusta automaticamente ao conteúdo
- **Quebra de Linhas Inteligente:** Texto se adapta ao espaço
- **Elementos Decorativos:** Cantos pixelados e moldura temática
- **Personalização:** Inclui nome do jogador (opcional)

## 🛠️ Tecnologias Utilizadas

### **Frontend Clássico**
- **HTML5:** Estrutura semântica das telas
- **CSS3:** Estilos responsivos e animações
- **JavaScript Vanilla:** Lógica do jogo e interações
- **Canvas API:** Renderização de gráficos e partículas

### **Assets e Recursos**
- **Sprites Pixel Art:** Personagem, cenários e UI
- **Google Fonts:** "Press Start 2P" para estética retrô
- **Imagens Otimizadas:** PNG com transparência para sprites

## 🚀 Implementação Rápida

### ⚡ **Pré-requisitos**
- Navegador moderno (Chrome, Firefox, Edge)
- Python 3.x (opcional, para servidor local)

### 🛠️ **Execução em 2 Passos**

**Opção 1 - Servidor Local (Recomendado):**
```bash
# Clone o repositório
git clone https://github.com/cantalusto/escape_do_vicio.git
cd escape_do_vicio

# Execute o servidor
python -m http.server 8000

# Acesse no navegador
# http://localhost:8000
```

**Opção 2 - Arquivo Direto:**
```bash
# Abra diretamente no navegador
open index.html
# Nota: Alguns recursos podem não carregar corretamente
```

## 🎮 Como Jogar

### **Fluxo Principal**
1. **Início:** Clique em "Começar Jogo" na tela inicial
2. **Movimento:** Personagem avança automaticamente pelo cenário
3. **Desafios:** Ao encontrar cadeados, responda perguntas educativas
4. **Progresso:** Cada resposta correta abre um cadeado
5. **Vitória:** Ao abrir todos os cadeados, alcance a porta final
6. **Certificado:** Gere e baixe seu certificado de conquista

### **Controles**
- **Movimento:** Automático (jogo de progressão contínua)
- **Interação:** Clique para responder perguntas
- **Interface:** Botões intuitivos para navegação

## 🏗️ Estrutura do Projeto

```
escape_do_vicio/
├── assets/
│   ├── certificate.png         # Imagem do certificado
│   ├── door.png                # Sprite da porta de saída
│   ├── heart.png               # Ícone de vidas
│   ├── lock.png / openlock.png # Estados do cadeado
│   ├── running0..4.png         # Sprites de animação de corrida
│   ├── standing.png            # Sprite parado
│   ├── talking.png             # Sprite falando
│   ├── walking_place.png       # Textura do chão
│   └── tiles.svg               # Tiles do cenário
├── game.js                     # Lógica principal do jogo
├── index.html                  # Estrutura HTML
└── styles.css                  # Estilos e animações
```

## ⚙️ Personalizações

### **🔧 Ajustes Rápidos**

**Tamanho da Porta:**
```javascript
// Em game.js - linha ~20
const DOOR_SCALE = 1.5; // Aumente ou diminua este valor
```

**Partículas de Vitória:**
```javascript
// Em game.js - função de partículas
particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 5 + 2, // Tamanho
    speedY: Math.random() * 3 + 1, // Velocidade
    color: `hsl(${Math.random() * 360}, 100%, 50%)` // Cores
});
```

**Certificado:**
```javascript
// Em game.js - generateCertificate()
// Ajuste margens, fontes e layout
const style = {
    titleSize: '24px',
    nameSize: '20px',
    margin: '40px'
};
```

## 🎨 Sistema de Certificado

### **Características Técnicas**
- **Fonte Pixelada:** "Press Start 2P" do Google Fonts
- **Layout Responsivo:** Quebra de linhas automática
- **Imagem Integrada:** `certificate.png` posicionada estrategicamente
- **Download Canvas:** Geração de PNG para download

### **Como Usar**
1. Complete o jogo e alcance a tela de vitória
2. Insira seu nome (opcional) no campo fornecido
3. Clique em "Baixar Certificado"
4. Salve o arquivo PNG gerado

## 🔧 Solução de Problemas

### **Problemas Comuns**

**Recursos Não Carregam:**
- Use servidor local (`python -m http.server`)
- Verifique se todos os arquivos estão na pasta assets

**Fontes Não Aplicam:**
- Certifique-se de conexão com internet para Google Fonts
- Verifique console do navegador por erros de carregamento

**Performance:**
- Feche outras abas se animações estiverem lentas
- Atualize para versão recente do navegador

## 🌟 Dicas de Desenvolvimento

### **Para Modificar**
- **Novos Sprites:** Mantenha proporções e estilo pixel art
- **Mais Perguntas:** Adicione no array de desafios em `game.js`
- **Novas Mecânicas:** Estruture em funções modulares

### **Para Expandir**
- Adicione mais fases com diferentes cenários
- Implemente sistema de pontuação
- Adicione efeitos sonoros 8-bit
- Crie diferentes tipos de desafios

## 👨‍💻 Autor

**Lucas Cantarelli Lustosa**

[![GitHub](https://img.shields.io/badge/GitHub-Escape_do_Vício-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/cantalusto/escape_do_vicio)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Lucas_Cantarelli-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/lucas-cantarelli-lustosa-aab5492ba/)
