/* Escape do Vício - jogo educativo web em pixel art */
(function () {
  const screens = {
    home: document.getElementById('screen-home'),
    game: document.getElementById('screen-game'),
    instructions: document.getElementById('screen-instructions'),
    credits: document.getElementById('screen-credits'),
    end: document.getElementById('screen-end')
  };

  const homeBg = document.getElementById('home-bg');
  homeBg.src = 'assets/escape_do_vicio_maior.png';
  homeBg.onerror = () => (homeBg.src = 'assets/start_placeholder.svg');

  const locksHud = document.getElementById('locks');
  for (let i = 0; i < 5; i++) {
    const l = document.createElement('div');
    l.className = 'lock';
    l.setAttribute('aria-label', 'Cadeado');
    locksHud.appendChild(l);
  }

  // Hearts (vidas)
  const heartsHud = document.getElementById('hearts');
  const MAX_LIVES = 3;
  let livesLeft = MAX_LIVES;
  function initHeartsHud(){
    if (!heartsHud) return;
    if (heartsHud.children.length === 0) {
      for (let i = 0; i < MAX_LIVES; i++) {
        const h = document.createElement('div');
        h.className = 'heart';
        h.setAttribute('aria-label', 'Vida');
        heartsHud.appendChild(h);
      }
    }
    updateHeartsHud();
  }
  function updateHeartsHud(){
    if (!heartsHud) return;
    Array.from(heartsHud.children).forEach((el, i) => {
      el.classList.toggle('used', i >= livesLeft);
    });
  }

  // Controle de penalidade por pergunta e consumo de vida com feedback
  let questionPenaltyApplied = false;
  function consumeLife(){
    const prev = livesLeft;
    if (prev <= 0) return;
    const idx = prev - 1; // índice do coração a ser consumido
    const target = heartsHud && heartsHud.children[idx];
    // animação de flash antes de escurecer
    if (target) {
      target.classList.remove('used');
      target.classList.add('flash');
      setTimeout(() => {
        target.classList.remove('flash');
        livesLeft = Math.max(0, livesLeft - 1);
        updateHeartsHud();
        if (livesLeft <= 0) {
          // fechar modal e encerrar
          stopTalkingAnimation();
          qModal.classList.add('hidden');
          try { cancelAnimationFrame(rafId); } catch(_) {}
          running = false;
          endGame({
            win: false,
            title: 'Sem mais vidas',
            message: 'Você errou 3 perguntas. Volte ao início e tente novamente.'
          });
        }
      }, 180);
    } else {
      livesLeft = Math.max(0, livesLeft - 1);
      updateHeartsHud();
      if (livesLeft <= 0) {
        stopTalkingAnimation();
        qModal.classList.add('hidden');
        try { cancelAnimationFrame(rafId); } catch(_) {}
        running = false;
        endGame({ win: false, title: 'Sem mais vidas', message: 'Você errou 3 perguntas. Volte ao início e tente novamente.' });
      }
    }
    playLoseLife();
  }

  function showScreen(key) {
    Object.values(screens).forEach(s => s.classList.remove('visible'));
    screens[key].classList.add('visible');
    // Oculta partículas se sair da tela de prêmio
    if (key !== 'end') { stopEndParticles(); }
  }

  // Navegação básica
  document.getElementById('btn-play').addEventListener('click', () => {
    startGame();
    showScreen('game');
  });
  document.getElementById('btn-instructions').addEventListener('click', () => showScreen('instructions'));
  document.getElementById('btn-credits').addEventListener('click', () => showScreen('credits'));
  document.getElementById('btn-exit').addEventListener('click', () => endGame({
    win: false,
    title: 'Encerrado',
    message: 'Obrigado por jogar! Volte quando quiser.'
  }));
  Array.from(document.querySelectorAll('[data-nav="home"]')).forEach(b => b.addEventListener('click', () => showScreen('home')));
  // Som de clique para todos os botões (inclui dinâmicos com classe .btn)
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('button, .btn, [role="button"]');
    if (!el) return; if (el.disabled || el.getAttribute('disabled') !== null) return;
    playUiClick();
  });
  // Botão Voltar da tela de jogo: para o loop e retorna à Home
  const backBtn = document.getElementById('btn-back-game');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      try { cancelAnimationFrame(rafId); } catch(_) {}
      running = false;
      showScreen('home');
      try { stopMusic(); } catch(_) {}
    });
  }
  // Botão Voltar dentro do modal de pergunta
  const modalBackBtn = document.getElementById('btn-modal-back');
  if (modalBackBtn) {
    modalBackBtn.addEventListener('click', () => {
      try { cancelAnimationFrame(rafId); } catch(_) {}
      running = false;
      const modal = document.getElementById('questionModal');
      if (modal) modal.classList.add('hidden');
      showScreen('home');
      try { stopMusic(); } catch(_) {}
    });
  }

  // Timer
  const timerEl = document.getElementById('timer');
  let timeLeftMs = 20 * 60 * 1000; // 20 min

  // Perguntas
  const QUESTIONS = [
    {
      title: 'Enigma 1 – O Início da Dependência',
      text: 'O que geralmente contém um cigarro eletrônico que pode causar dependência?',
      options: [
        'Apenas água e saborizantes naturais.',
        'Nicotina, que é uma substância viciante.',
        'Vitaminas que melhoram a saúde.',
        'Antibióticos para prevenir doenças.'
      ],
      correct: 1,
      success: 'Você descobriu o verdadeiro inimigo: a nicotina. Continue procurando o resto dos enigmas.'
    },
    {
      title: 'Enigma 2 – O Custo Oculto',
      text: 'Qual é uma consequência possível do uso frequente de cigarro eletrônico em adolescentes?',
      options: [
        'Desenvolvimento mais rápido do cérebro.',
        'Redução do risco de doenças cardíacas.',
        'Aumento do risco de problemas respiratórios e cardiovasculares.',
        'Melhoria imediata do desempenho esportivo.'
      ],
      correct: 2,
      success: 'Isso mesmo! O uso de cigarro eletrônico está associado a riscos para a saúde respiratória e cardiovascular.'
    },
    {
      title: 'Enigma 3 – Impacto no Corpo',
      text: 'Sou formado por milhões de alvéolos. É em mim que o vapor deixa suas marcas. Quem sou eu?',
      options: ['Coração', 'Pulmão', 'Cérebro', 'Fígado'],
      correct: 1,
      success: 'Os pulmões são os primeiros a sofrer. Respire informação para escolher melhor.'
    },
    {
      title: 'Enigma 4 – Pressão Social',
      text: 'Complete: “Muitos adolescentes começam a usar cigarro eletrônico porque ___________.”',
      options: [
        'Porque médicos recomendam para aliviar o estresse.',
        'Porque os médicos recomendam para aliviar o estresse.',
        'Porque ajuda a melhorar o desempenho esportivo.',
        'Porque sofrem influência de amigos ou querem se encaixar no grupo.'
      ],
      correct: 3,
      success: 'Reconhecer a pressão social é parte da fuga. Escolha por você!'
    },
    {
      title: 'Enigma 5 – A Saída (Estratégias de Superação)',
      text: 'O que acontece com o cérebro de um adolescente que usa cigarro eletrônico com nicotina?',
      options: [
        'O cérebro se desenvolve mais rápido e melhor.',
        'A nicotina não tem efeito no cérebro adolescente.',
        'O cérebro pode se tornar mais sensível à dependência e afetar o aprendizado.',
        'O cérebro fica imune a substâncias viciantes.'
      ],
      correct: 2,
      success: 'A nicotina impacta funções como aprendizado e memória. Continue escolhendo saúde!'
    }
  ];

  // Modal de perguntas
  const qModal = document.getElementById('questionModal');
  const qTitle = document.getElementById('qTitle');
  const qText = document.getElementById('qText');
  const qOptions = document.getElementById('qOptions');
  const qFeedback = document.getElementById('qFeedback');
  const qContent = qModal.querySelector('.modal-content');

  // Modal draggable (arrastável pelo título)
  let dragInit = false;
  function initDraggableModal() {
    if (dragInit) return; dragInit = true;
    try { qContent.style.position = 'absolute'; } catch(_) {}
    const setInitialPosition = () => {
      const w = qContent.offsetWidth, h = qContent.offsetHeight;
      const left = Math.max(0, Math.floor((qModal.clientWidth - w) / 2));
      const top = Math.max(8, Math.floor(qModal.clientHeight * 0.02));
      qContent.style.left = left + 'px';
      qContent.style.top = top + 'px';
    };
    setInitialPosition();

    let dragging = false, startX = 0, startY = 0, baseL = 0, baseT = 0;
    function onDown(ev){
      const pt = ev.touches ? ev.touches[0] : ev;
      dragging = true;
      startX = pt.clientX; startY = pt.clientY;
      baseL = parseInt(qContent.style.left || '0', 10);
      baseT = parseInt(qContent.style.top || '0', 10);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
      if (ev.cancelable) ev.preventDefault();
    }
    function onMove(ev){
      if (!dragging) return;
      const pt = ev.touches ? ev.touches[0] : ev;
      let nl = baseL + (pt.clientX - startX);
      let nt = baseT + (pt.clientY - startY);
      const maxL = Math.max(0, qModal.clientWidth - qContent.offsetWidth);
      const maxT = Math.max(0, qModal.clientHeight - qContent.offsetHeight);
      qContent.style.left = Math.min(Math.max(0, Math.floor(nl)), maxL) + 'px';
      qContent.style.top = Math.min(Math.max(0, Math.floor(nt)), maxT) + 'px';
      if (ev.cancelable) ev.preventDefault();
    }
    function onUp(){
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }
    qTitle.addEventListener('mousedown', onDown);
    qTitle.addEventListener('touchstart', onDown, { passive: false });
    // Reposiciona ao redimensionar
    window.addEventListener('resize', setInitialPosition);
  }

  function askQuestion(index, onCorrect) {
    const q = QUESTIONS[index];
    qTitle.textContent = q.title;
    qText.textContent = q.text;
    qOptions.innerHTML = '';
    qFeedback.textContent = '';
    qModal.classList.remove('hidden');
    initDraggableModal();
    questionPenaltyApplied = false;
    initHeartsHud();
    // iniciar animação de fala enquanto a pergunta estiver ativa
    startTalkingAnimation();
    q.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'btn';
      b.textContent = String.fromCharCode(65 + i) + ') ' + opt;
      b.addEventListener('click', () => {
        if (i === q.correct) {
          qFeedback.style.color = '#8cffb2';
          qFeedback.textContent = q.success;
          // desabilita opções após acerto
          Array.from(qOptions.querySelectorAll('button')).forEach(btn => btn.disabled = true);
          // adiciona botão Continuar para retomar o jogo somente ao clicar
          let actions = qContent.querySelector('#qActions');
          if (!actions) {
            actions = document.createElement('div');
            actions.id = 'qActions';
            actions.className = 'q-actions';
            qContent.appendChild(actions);
          }
          actions.innerHTML = '';
          const cont = document.createElement('button');
          cont.className = 'btn';
          cont.id = 'btn-continue';
          cont.textContent = 'Continuar';
          cont.addEventListener('click', () => {
            // parar animação de fala ao fechar
            stopTalkingAnimation();
            qModal.classList.add('hidden');
            // bônus de tempo para leitura da explicação da resposta
            timeLeftMs = Math.min(timeLeftMs + 15000, 20 * 60 * 1000);
            playUnlock();
            onCorrect();
          });
          actions.appendChild(cont);
          cont.focus();
        } else {
          qFeedback.style.color = '#ffd166';
          qFeedback.textContent = 'Quase! Pense nos riscos reais e tente novamente.';
          // penalidade suave: apenas uma vida por pergunta aberta
          if (!questionPenaltyApplied) {
            questionPenaltyApplied = true;
            consumeLife();
          }
        }
      });
      qOptions.appendChild(b);
    });
  }

  // Motor do jogo (canvas)
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let rafId = null;

  // Sprites externos (pixel art)
  const tile = new Image(); tile.src = 'assets/tiles.svg';
  let tileReady = false; tile.onload = () => { tileReady = true; };
  // Fundo rolante do chão
  const walkingBG = new Image(); walkingBG.src = 'assets/walking_place.png';
  let walkingReady = false; walkingBG.onload = () => { walkingReady = true; };
  // Sprite de cadeado
  const lockSprite = new Image(); lockSprite.src = 'assets/lock.png';
  let lockReady = false; lockSprite.onload = () => { lockReady = true; };
  // Sprite de cadeado aberto
  const openLockSprite = new Image(); openLockSprite.src = 'assets/openlock.png';
  let openLockReady = false; openLockSprite.onload = () => { openLockReady = true; };
  // Sprite da porta de saída
  const doorSprite = new Image(); doorSprite.src = 'assets/door.png';
  let doorReady = false; doorSprite.onload = () => { doorReady = true; };

  // Novo conjunto de sprites do personagem
  const spritesReady = { stand: false, talk: false, r0: false, r1: false, r2: false, r3: false, r4: false };
  const runSprites = Array.from({ length: 5 }, (_, i) => {
    const img = new Image(); img.src = `assets/running${i}.png`;
    img.onload = () => { spritesReady[`r${i}`] = true; };
    return img;
  });
  const standingSprite = new Image(); standingSprite.src = 'assets/standing.png';
  standingSprite.onload = () => { spritesReady.stand = true; };
  const talkingSprite = new Image(); talkingSprite.src = 'assets/talking.png';
  talkingSprite.onload = () => { spritesReady.talk = true; };

  // Sons via WebAudio
  let audioCtx = null; let lastStepAt = 0;
  // Trilha sonora retro
  let musicGain = null, musicOn = false, musicIntervals = [];
  function ensureAudio() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
  }
  function playTone({freq=440, dur=0.15, type='square', vol=0.06}) {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t);
    const gain = audioCtx.createGain(); gain.gain.setValueAtTime(vol, t); gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t); osc.stop(t + dur);
  }
  function playStep() {
    const now = performance.now(); if (now - lastStepAt < 160) return; lastStepAt = now;
    playTone({ freq: 180 + Math.random()*80, dur: 0.08, type: 'square', vol: 0.05 });
  }
  function playUnlock() {
    playTone({ freq: 500, dur: 0.10, type: 'triangle', vol: 0.08 });
    setTimeout(() => playTone({ freq: 800, dur: 0.12, type: 'triangle', vol: 0.08 }), 100);
  }
  function playLoseLife() {
    // tons descendentes sutis para indicar perda de vida
    playTone({ freq: 280, dur: 0.10, type: 'square', vol: 0.06 });
    setTimeout(() => playTone({ freq: 180, dur: 0.12, type: 'triangle', vol: 0.06 }), 120);
  }
  function playWin() {
    [440, 660, 880, 990].forEach((f, i) => setTimeout(() => playTone({ freq: f, dur: 0.18, type: 'sawtooth', vol: 0.06 }), i*140));
  }
  // Fanfarras curtas na tela de vitória
  function playVictoryFanfare() {
    ensureAudio();
    const seq = [
      { freq: 523.25, dur: 0.16, type: 'triangle', vol: 0.08 }, // C5
      { freq: 659.25, dur: 0.18, type: 'triangle', vol: 0.08 }, // E5
      { freq: 783.99, dur: 0.20, type: 'triangle', vol: 0.08 }, // G5
      { freq: 1046.50, dur: 0.26, type: 'sawtooth', vol: 0.07 } // C6
    ];
    seq.forEach((s, i) => setTimeout(() => playTone(s), i * 160));
  }
  // Efeito sonoro de clique de UI
  function playUiClick() {
    ensureAudio();
    playTone({ freq: 700, dur: 0.06, type: 'square', vol: 0.06 });
    setTimeout(() => playTone({ freq: 1000, dur: 0.04, type: 'triangle', vol: 0.05 }), 40);
  }
  // Música retro de fundo (loop simples com melodia e baixo)
  function startMusic() {
    ensureAudio();
    if (musicOn) return; musicOn = true;
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.30;
    musicGain.connect(audioCtx.destination);

    const tempo = 120; // BPM
    const q = 60 / tempo; // duração de uma semínima em segundos

    function playMusicNote(freq, dur, type = 'square', vol = 0.08) {
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); osc.type = type; osc.frequency.setValueAtTime(freq, t);
      const g = audioCtx.createGain(); g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(musicGain);
      osc.start(t); osc.stop(t + dur);
    }
    const semitone = (base, n) => base * Math.pow(2, n / 12);
    // Progressão clássica de chiptune: C, Am, F, G (4 compassos)
    const prog = [
      { lead: 261.63, bass: 130.81 }, // C4 / C3
      { lead: 220.00, bass: 110.00 }, // A3 / A2
      { lead: 349.23, bass: 174.61 }, // F4 / F3
      { lead: 392.00, bass: 196.00 }  // G4 / G3
    ];
    const arp = [0, 4, 7, 12]; // arpejo: tônica, terça, quinta, oitava
    let step = 0;
    musicIntervals.push(setInterval(() => {
      step++;
      const chord = prog[Math.floor((step - 1) / 4) % prog.length];
      // Lead: nota do arpejo por batida
      const leadFreq = semitone(chord.lead, arp[(step - 1) % arp.length]);
      playMusicNote(leadFreq, q * 0.85, 'square', 0.07);
      // Bass: a cada duas batidas, reforça a tônica
      if ((step % 2) === 1) {
        playMusicNote(chord.bass, q * 0.45, 'triangle', 0.06);
      }
      // Hi-hat: clique curto por batida para ritmo
      playMusicNote(2000, q * 0.03, 'square', 0.03);
    }, q * 1000));
  }
  function stopMusic() {
    musicOn = false;
    musicIntervals.forEach(id => clearInterval(id));
    musicIntervals = [];
    if (musicGain) { try { musicGain.disconnect(); } catch(_) {} musicGain = null; }
  }

  const WORLD = {
    width: 1800,
    height: canvas.height,
    groundY: canvas.height - 80,
    locks: [320, 700, 1020, 1340, 1660],
    unlocked: [false, false, false, false, false]
  };

  // Porta de saída (aparece após todos os cadeados serem abertos)
  const DOOR = {
    x: 1700,
    active: false,
    angle: 0,    // ângulo de abertura (radianos)
    opened: false,
    triggerDistance: 38 // distância para disparar vitória ao cruzar
  };
  // Confetes de celebração
  let confetti = [];
  function spawnConfetti(cx, cy) {
    const COLORS = ['#ff6b6b', '#ffd166', '#4cc9f0', '#8cffb2', '#c9a9ff'];
    confetti = Array.from({ length: 140 }, () => {
      const ang = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.2;
      return {
        x: cx + Math.cos(ang) * (10 + Math.random()*14),
        y: cy + Math.sin(ang) * (10 + Math.random()*14),
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed - (1.2 + Math.random()*0.8),
        g: 0.06 + Math.random()*0.06,
        size: 2 + Math.floor(Math.random()*3),
        color: COLORS[Math.floor(Math.random()*COLORS.length)],
        life: 120 + Math.floor(Math.random()*60)
      };
    });
  }

  function resetLocks() {
    const start = 320; const gap = Math.max(300, Math.floor(canvas.width * 0.35));
    WORLD.locks = [start, start + gap, start + 2*gap, start + 3*gap, start + 4*gap];
    // define posição da porta um pouco à frente do último cadeado
    DOOR.x = WORLD.locks[WORLD.locks.length-1] + Math.max(220, Math.floor(canvas.width * 0.25));
    WORLD.width = DOOR.x + Math.max(280, Math.floor(canvas.width * 0.35));
    DOOR.active = false; DOOR.opened = false; DOOR.angle = 0;
  }

  const player = {
    x: 40,
    y: WORLD.groundY - 32,
    w: 26,
    h: 32,
    speed: 1.6,
    walkingFrame: 0,
    state: 'running',
    runFrame: 0
  };

  // Animação de fala enquanto o modal está aberto
  let talkInterval = null;
  function startTalkingAnimation(){
    player.state = 'talking';
    if (talkInterval) clearInterval(talkInterval);
    talkInterval = setInterval(() => {
      player.state = (player.state === 'talking') ? 'standing' : 'talking';
      draw();
    }, 240);
  }
  function stopTalkingAnimation(){
    if (talkInterval) { clearInterval(talkInterval); talkInterval = null; }
    player.state = 'running';
  }

  let cameraX = 0;
  let running = false;
  let startTimestamp = 0;

  function startGame() {
    ensureAudio();
    WORLD.unlocked = [false, false, false, false, false];
    updateLocksHud();
    // resetar vidas
    livesLeft = MAX_LIVES;
    initHeartsHud();
    player.x = 40; player.walkingFrame = 0;
    cameraX = 0;
    running = true;
    startTimestamp = Date.now();
    timeLeftMs = 20 * 60 * 1000; // reset timer
    resetLocks();
    startMusic();
    loop();
  }

  function endGame({ win, title, message }) {
    cancelAnimationFrame(rafId);
    running = false;
    stopMusic();
    document.getElementById('endTitle').textContent = title || (win ? 'Parabéns!' : 'Tempo Esgotado');
    document.getElementById('endMessage').textContent = message || (win ?
      'Muito bem! Vocês encontraram as ferramentas para escapar do vício. Estão livres!' :
      'Assim como no jogo, a informação e o apoio ajudam a sair do ciclo. Tente novamente!');
    const cert = document.getElementById('certificateArea');
    cert.classList.toggle('hidden', !win);
    const endPanel = document.querySelector('#screen-end .panel');
    if (endPanel) { endPanel.classList.toggle('victory', !!win); }
    showScreen('end');
    if (win) { playVictoryFanfare(); startEndParticles(); }
  }

  // Efeito: fanfarra já existente; confetes removidos

  function updateLocksHud() {
    Array.from(locksHud.children).forEach((el, i) => {
      el.classList.toggle('open', WORLD.unlocked[i]);
    });
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    const now = Date.now();
    const elapsed = now - startTimestamp;
    timeLeftMs = Math.max(0, 20 * 60 * 1000 - elapsed);
    const mm = String(Math.floor(timeLeftMs / 60000)).padStart(2, '0');
    const ss = String(Math.floor((timeLeftMs % 60000) / 1000)).padStart(2, '0');
    timerEl.textContent = `${mm}:${ss}`;
    if (timeLeftMs <= 0) { endGame({ win: false }); return; }

    // Movimento
    const nextX = player.x + player.speed;
    // Verificar lock à frente
    const nextLockIndex = WORLD.locks.findIndex((lx, i) => !WORLD.unlocked[i] && lx - player.x <= 40);
    if (nextLockIndex !== -1) {
      // Pausar e perguntar
      running = false;
      cancelAnimationFrame(rafId);
      player.state = 'standing';
      askQuestion(nextLockIndex, () => {
        WORLD.unlocked[nextLockIndex] = true;
        updateLocksHud();
        if (WORLD.unlocked.every(Boolean)) {
          // habilita porta; jogador deve andar até a saída
          DOOR.active = true;
          playWin();
          // segue o jogo até alcançar a porta
          running = true;
          startTimestamp = Date.now() - (20 * 60 * 1000 - timeLeftMs);
          player.state = 'running';
          loop();
        } else {
          // retomar
          running = true;
          startTimestamp = Date.now() - (20 * 60 * 1000 - timeLeftMs);
          player.state = 'running';
          loop();
        }
      });
      return;
    }

    player.x = Math.min(nextX, WORLD.width - 40);
    player.walkingFrame = (player.walkingFrame + 1) % 20;
    player.state = 'running';
    playStep();
    // Checar porta: vitória automática ao cruzar (ajustada para o layout)
    if (DOOR.active && DOOR.x - player.x <= DOOR.triggerDistance) {
      try { cancelAnimationFrame(rafId); } catch(_) {}
      running = false;
      endGame({ win: true, title: 'Liberdade Conquistada!', message: 'Você encontrou a saída!' });
      return;
    }
    cameraX = Math.max(0, Math.min(player.x - canvas.width / 2 + 100, WORLD.width - canvas.width));
    draw();
  }

  function draw() {
    // Fundo: sala fechada com cidade distante
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Define a linha do solo baseada na imagem de fundo
    WORLD.groundY = Math.floor(canvas.height * 0.77);
    // camadas de fundo
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#2a2268');
    grad.addColorStop(1, '#472a8f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // parede/decoração
    ctx.fillStyle = '#1c154a';
    for (let i = 0; i < 20; i++) {
      const x = ((i * 120) - cameraX * 0.5) % (canvas.width + 200) - 100;
      ctx.fillRect(x, 40, 80, 40);
    }

    // chão/fundo: quando walking_place.png estiver disponível, usar como fundo infinito
    const groundH = 80;
    if (walkingReady) {
      const natW = walkingBG.naturalWidth || walkingBG.width;
      const natH = walkingBG.naturalHeight || walkingBG.height;
      const scale = canvas.height / Math.max(1, natH);
      const tileW = Math.max(32, Math.floor(natW * scale));
      const startX = -((cameraX % tileW));
      const blendW = Math.max(8, Math.floor(tileW * 0.05)); // ~5% da largura do tile
      const positions = [];
      // 1ª passada: desenha todos os tiles
      for (let x = startX; x < canvas.width; x += tileW) {
        positions.push(x);
        ctx.drawImage(walkingBG, 0, 0, natW, natH, x, 0, tileW, canvas.height);
      }
      // 2ª passada: aplica feather nas junções (desenha faixa da borda direita do tile atual por cima)
      for (let k = 0; k < positions.length; k++) {
        const x = positions[k];
        const seamStart = Math.floor(x + tileW - blendW);
        const seamEnd = seamStart + blendW;
        if (seamEnd <= 0 || seamStart >= canvas.width) continue;
        ctx.save();
        for (let s = 0; s < blendW; s++) {
          const destX = seamStart + s;
          if (destX < 0 || destX >= canvas.width) continue;
          const alpha = (blendW - s) / blendW * 0.6; // decrescente: some ao chegar na junção
          ctx.globalAlpha = alpha;
          const srcX = Math.floor((tileW - blendW + s) * natW / tileW); // coluna correspondente ao fim do tile
          ctx.drawImage(walkingBG, srcX, 0, 1, natH, destX, 0, 1, canvas.height);
        }
        ctx.restore();
      }
      // 3ª passada: adicionar blur suave nas bordas laterais para parallax mais natural
      // cria faixas nas laterais e redesenha o fundo com filtro de blur apenas nessas áreas
      const edgeW = Math.max(12, Math.floor(canvas.width * 0.02));
      ctx.save();
      ctx.filter = 'blur(3px)';
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.rect(0, 0, edgeW, canvas.height);
      ctx.rect(canvas.width - edgeW, 0, edgeW, canvas.height);
      ctx.clip();
      for (let x of positions) {
        ctx.drawImage(walkingBG, 0, 0, natW, natH, x, 0, tileW, canvas.height);
      }
      ctx.restore();
    } else if (tileReady) {
      const tileW = 64;
      const startX = -((cameraX % tileW));
      for (let x = startX; x < canvas.width; x += tileW) {
        ctx.drawImage(tile, x, WORLD.groundY, tileW, groundH);
      }
    } else {
      ctx.fillStyle = '#3b2366';
      ctx.fillRect(0, WORLD.groundY, canvas.width, groundH);
      ctx.fillStyle = '#4a2c7f';
      for (let i = -10; i < canvas.width / 20 + 20; i++) {
        ctx.fillRect(i * 20 - (cameraX % 20), WORLD.groundY + 40, 18, 18);
      }
    }

    // locks com sprite e levitação
    const t = Date.now() * 0.002;
    WORLD.locks.forEach((lx, i) => {
      const screenX = lx - cameraX;
      if (screenX < -24 || screenX > canvas.width + 24) return;
      const bob = Math.sin(t + i * 0.8) * 6;
      const size = 34;
      const drawY = WORLD.groundY - 46 - bob;
      if (lockReady || openLockReady) {
        ctx.save();
        ctx.shadowColor = WORLD.unlocked[i] ? '#77ff77' : 'rgba(27,14,61,0.9)';
        ctx.shadowBlur = WORLD.unlocked[i] ? 8 : 6;
        const img = (WORLD.unlocked[i] && openLockReady) ? openLockSprite : lockSprite;
        ctx.drawImage(img, Math.floor(screenX - size/2), Math.floor(drawY - size/2), size, size);
        ctx.restore();
      } else {
        ctx.fillStyle = WORLD.unlocked[i] ? '#4caf50' : '#ffcc00';
        ctx.fillRect(screenX - 10, drawY - 14, 20, 28);
        ctx.fillStyle = '#222';
        ctx.fillRect(screenX - 6, drawY - 6, 12, 10);
      }
    });

    // Porta de saída
    if (DOOR.active && doorReady) {
      const dx = DOOR.x - cameraX;
      if (dx > -40 && dx < canvas.width + 40) {
        const natW = doorSprite.naturalWidth || 48;
        const natH = doorSprite.naturalHeight || 72;
        // Ajuste: porta maior que o personagem, mantendo proporção
        const playerScale = Math.max(1.5, Math.min(3.0, (canvas.clientHeight || 540) / 540 * 1.3));
        const playerH = Math.floor(32 * playerScale);
        const DOOR_SCALE = 1.5; // fator para aumentar a altura da porta
        const doorH = Math.floor(playerH * DOOR_SCALE);
        const doorW = Math.floor(doorH * (natW / Math.max(1, natH)));
        const baseY = WORLD.groundY - 8; // base da porta próxima ao chão
        ctx.save();
        // brilho pulsante da porta quando ativa (antes de abrir)
        const pulse = DOOR.opened ? 0 : (10 + Math.floor(Math.sin(Date.now() * 0.006) * 6));
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = pulse;
        // pivô na lateral esquerda para simular abertura
        ctx.translate(Math.floor(dx - doorW/2), Math.floor(baseY - doorH));
        ctx.translate(0, doorH/2);
        ctx.rotate(DOOR.opened ? DOOR.angle : 0);
        ctx.translate(0, -doorH/2);
        ctx.drawImage(doorSprite, 0, 0, doorW, doorH);
        ctx.restore();
      }
    }

    // Confetes
    if (confetti.length) {
      for (let p of confetti) {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
      }
      confetti = confetti.filter(p => p.life > 0 && p.y < canvas.height + 20);
      ctx.save();
      confetti.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });
      ctx.restore();
    }

    // player (sprite simples pixel art)
    const px = player.x - cameraX;
    const py = WORLD.groundY - 32;
    drawPlayer(px, py, player.walkingFrame);
  }

  function drawPlayer(x, y, frame) {
    const runningBounce = (frame % 10 < 5) ? 0 : 2;
    // Aumenta o tamanho base do personagem (escala maior e responsiva)
    const scale = Math.max(1.5, Math.min(3.0, (canvas.clientHeight || 540) / 540 * 1.3));
    const w = Math.floor(32 * scale), h = Math.floor(32 * scale);
    let img = null, loaded = false, offsetY = 0;

    if (player.state === 'running') {
      const idx = Math.floor((frame % 20) / 4); // 0..4
      img = runSprites[idx];
      loaded = spritesReady[`r${idx}`];
      offsetY = runningBounce;
    } else if (player.state === 'talking') {
      img = talkingSprite; loaded = spritesReady.talk; offsetY = 0;
    } else { // standing
      img = standingSprite; loaded = spritesReady.stand; offsetY = 0;
    }

    if (loaded) {
      ctx.drawImage(img, x - w/2, y - h - offsetY, w, h + offsetY);
    } else {
      // fallback em pixel primitives
      ctx.fillStyle = '#3dd6ed';
      ctx.fillRect(x - 10, y - 24, 20, 24);
      ctx.fillStyle = '#ffd29d';
      ctx.fillRect(x - 10, y - 34, 20, 10);
      ctx.fillStyle = '#1b4a7a';
      ctx.fillRect(x - 12, y - 36, 24, 6);
      ctx.fillStyle = '#1b4a7a';
      ctx.fillRect(x - 8, y, 6, 12);
      ctx.fillRect(x + 2, y - runningBounce, 6, 12 + runningBounce);
      ctx.fillStyle = '#ff7b00';
      ctx.fillRect(x + 8, y - 22, 12, 12);
    }
  }

  // Certificado
  document.getElementById('btn-replay').addEventListener('click', () => { showScreen('home'); });

  async function generateCertificate(nameInput) {
    try { await (document.fonts?.ready || Promise.resolve()); } catch(_) {}
    const name = (nameInput || '').trim();
    const w = 1000, h = 700;
    const cnv = document.createElement('canvas'); cnv.width = w; cnv.height = h; const c = cnv.getContext('2d');
    // fundo e moldura
    const g = c.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0d1b2a'); g.addColorStop(1,'#1b263b'); c.fillStyle = g; c.fillRect(0,0,w,h);
    c.strokeStyle = '#98c1d9'; c.lineWidth = 6; c.strokeRect(40,40,w-80,h-80);
    // margens e helpers
    const MARGIN_X = 60, MARGIN_TOP = 70, MARGIN_BOTTOM = 40;
    const MAX_W = w - MARGIN_X * 2;
    c.textBaseline = 'top';
    function drawWrapped(text, x, y, maxWidth, lineHeight){
      const words = String(text).split(/\s+/);
      let line = '';
      for (const word of words){
        const test = line ? line + ' ' + word : word;
        if (c.measureText(test).width <= maxWidth){
          line = test;
        } else {
          if (line) c.fillText(line, x, y);
          y += lineHeight; line = word;
        }
      }
      if (line) c.fillText(line, x, y);
      return y + lineHeight;
    }

    // título centralizado com fonte pixel e contorno (ajuste dinâmico para caber nas margens)
    c.fillStyle = '#e0fbfc'; c.textAlign = 'center';
    const titleText = 'Certificado de Liberdade';
    const fontFamily = '"Press Start 2P", Arial, sans-serif';
    let titleSize = 40;
    function setTitleFont(sz){ c.font = `bold ${sz}px ${fontFamily}`; }
    setTitleFont(titleSize);
    const maxTitleWidth = MAX_W - 8; // leve folga das laterais
    while (c.measureText(titleText).width > maxTitleWidth && titleSize > 20) {
      titleSize -= 2; setTitleFont(titleSize);
    }
    const titleX = Math.floor(w/2); const titleY = MARGIN_TOP + 20;
    c.lineWidth = 1.8; c.strokeStyle = '#2a2a67'; c.strokeText(titleText, titleX, titleY);
    c.fillText(titleText, titleX, titleY);
    let cursorY = titleY + (titleSize + 22);

    // corpo com estilo game e quebra de linha segura dentro da moldura
    c.textAlign = 'left'; c.font = '18px "Press Start 2P", Arial, sans-serif';
    cursorY = drawWrapped('Parabéns! Você abriu os 5 cadeados e escapou do vício.', MARGIN_X, cursorY, MAX_W, 24);
    const displayName = name.length > 36 ? name.slice(0, 36) + '…' : name;
    if (displayName) {
      cursorY = drawWrapped('Participante: ' + displayName, MARGIN_X, cursorY, MAX_W, 24);
    }
    cursorY = drawWrapped('Informação, apoio e escolhas saudáveis levam à liberdade.', MARGIN_X, cursorY, MAX_W, 24);
    cursorY += 6;

    // cantos em pixel para dar aparência 8-bit (decorativo, não interfere no layout)
    c.fillStyle = '#3a0ca3';
    const px = 40, py = 40, ps = 10; // tamanho do pixel
    // canto superior esquerdo
    c.fillRect(px, py, ps*3, ps);
    c.fillRect(px, py, ps, ps*3);
    // canto superior direito
    c.fillRect(w-px-ps*3, py, ps*3, ps);
    c.fillRect(w-px-ps, py, ps, ps*3);
    // canto inferior esquerdo
    c.fillRect(px, h-py-ps, ps*3, ps);
    c.fillRect(px, h-py-ps*3, ps, ps*3);
    // canto inferior direito
    c.fillRect(w-px-ps*3, h-py-ps, ps*3, ps);
    c.fillRect(w-px-ps, h-py-ps*3, ps, ps*3);

    // fila de ícones (corações e cadeados) para gamificação — tamanhos menores
    async function loadImg(src){
      const img = new Image(); img.src = src;
      if (img.decode) { await img.decode(); } else { await new Promise((res, rej) => { img.onload = res; img.onerror = rej; }); }
      return img;
    }
    try {
      const heart = await loadImg('assets/heart.png');
      const openLock = await loadImg('assets/openlock.png');
      const baseY = cursorY + 6;
      // desenhar 3 corações
      for (let i = 0; i < 3; i++) {
        const x = MARGIN_X + i * 36; c.drawImage(heart, x, baseY, 26, 26);
      }
      // desenhar 5 cadeados abertos
      for (let i = 0; i < 5; i++) {
        const x = MARGIN_X + 160 + i * 30; c.drawImage(openLock, x, baseY+1, 24, 24);
      }
      cursorY = baseY + 26 + 14;
    } catch(_){ /* ignora se não carregar */ }

    // Adicionar imagem abaixo do texto (assets/certificate.png)
    try {
      const img = new Image();
      img.src = 'assets/certificate.png';
      if (img.decode) { await img.decode(); } else {
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      }
      let dy = cursorY;
      let availableH = h - MARGIN_BOTTOM - dy;
      if (availableH < 80) { dy = h - MARGIN_BOTTOM - 80; availableH = 80; }
      const targetW = MAX_W; // respeita margens da moldura
      const scale = Math.min(targetW / img.width, availableH / img.height);
      const dw = Math.floor(img.width * scale);
      const dh = Math.floor(img.height * scale);
      const dx = Math.floor((w - dw) / 2); // centralizado
      c.drawImage(img, dx, dy, dw, dh);
    } catch (_) {
      // Se a imagem falhar, apenas segue com o download do texto
    }

    // download robusto
    const url = cnv.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'certificado-liberdade.png';
    document.body.appendChild(a); a.click(); a.remove();
  }

  // Botão de certificado na tela final
  const btnCert = document.getElementById('btn-cert');
  if (btnCert) {
    btnCert.addEventListener('click', () => {
      const name = (document.getElementById('studentName').value || '').trim();
      generateCertificate(name);
    });
  }
  // Botão de certificado na Home (para testar sem jogar)
  const btnCertHome = document.getElementById('btn-cert-home');
  if (btnCertHome) {
    btnCertHome.addEventListener('click', () => {
      generateCertificate('');
    });
  }
})();

 

// Acessibilidade: navegação nas opções do modal por setas e Enter
(function(){
  const modal = document.getElementById('questionModal');
  const opts = document.getElementById('qOptions');
  function keyHandler(e){
    if (modal.classList.contains('hidden')) return;
    const buttons = Array.from(opts.querySelectorAll('button'));
    if (!buttons.length) return;
    const idx = buttons.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); buttons[(idx+1) % buttons.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); buttons[(idx-1+buttons.length) % buttons.length].focus(); }
    else if (e.key === 'Enter' && idx >= 0) { e.preventDefault(); buttons[idx].click(); }
  }
  document.addEventListener('keydown', keyHandler);
  const obs = new MutationObserver(()=>{
    if (!modal.classList.contains('hidden')) { const b = opts.querySelector('button'); if (b) b.focus(); }
  });
  obs.observe(modal, { attributes: true, attributeFilter: ['class'] });
})();

// Responsividade: escala dinâmica do canvas conforme tamanho da janela
(function(){
  const canvas = document.getElementById('gameCanvas');
  function resize(){
    const ratio = window.devicePixelRatio || 1;
    const isPortrait = window.innerHeight > window.innerWidth;
    let targetW, targetH;
    if (isPortrait) {
      // Mobile retrato: privilegiar altura para melhorar jogabilidade
      targetW = Math.min(1000, Math.floor(window.innerWidth * 0.98));
      targetH = Math.floor(window.innerHeight * 0.82);
    } else {
      // Paisagem/desktop: manter proporção mais larga (16:9)
      targetW = Math.min(1000, Math.floor(window.innerWidth * 0.95));
      targetH = Math.min(Math.floor(window.innerHeight * 0.75), Math.floor(targetW * 9/16));
    }
    canvas.style.width = targetW + 'px';
    canvas.style.height = targetH + 'px';
    canvas.width = Math.floor(targetW * ratio);
    canvas.height = Math.floor(targetH * ratio);
  }
  window.addEventListener('resize', resize);
  resize();
})();
  // Partículas na tela de prêmio
  let endParticlesRAF = null;
  function startEndParticles(){
    const cv = document.getElementById('endParticles'); if (!cv) return;
    const ctx = cv.getContext('2d');
    function resize(){ cv.width = window.innerWidth; cv.height = window.innerHeight; }
    resize();
    cv.classList.remove('hidden');
    const particles = [];
    const colors = ['#ffd166','#ff6b6b','#4cc9f0','#8cffb2','#c9a9ff'];
    for (let i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * cv.width,
        y: -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1 + Math.random() * 2.2,
        g: 0.03 + Math.random() * 0.03,
        size: 2 + Math.floor(Math.random() * 3),
        life: 220 + Math.floor(Math.random() * 100),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    function tick(){
      endParticlesRAF = requestAnimationFrame(tick);
      ctx.clearRect(0,0,cv.width,cv.height);
      particles.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life -= 1;
        ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size);
      });
    }
    tick();
    // encerra automaticamente após alguns segundos
    setTimeout(() => stopEndParticles(), 4500);
    window.addEventListener('resize', resize);
  }
  function stopEndParticles(){
    const cv = document.getElementById('endParticles'); if (!cv) return;
    try { cancelAnimationFrame(endParticlesRAF); } catch(_) {}
    endParticlesRAF = null;
    cv.classList.add('hidden');
    const ctx = cv.getContext('2d'); ctx.clearRect(0,0,cv.width,cv.height);
  }