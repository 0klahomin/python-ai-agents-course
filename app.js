(() => {
  const { COURSE, SPRINT_DAYS, SPRINT_LESSON_IDS, evaluateAnswers, isLessonUnlocked, validatePractice } = window.COURSE_DATA;
  const STORAGE_KEY = 'python-ai-agents-online-course-v2';
  const LEGACY_STORAGE_KEY = 'python-ai-agents-offline-course-v1';
  const ROUTE_STEPS = [
    { lessonId: 1, section: '1. Введение', title: 'Что такое Python и AI-агенты' },
    { lessonId: 2, section: '2. Основы Python', title: 'Переменные и типы данных' },
    { lessonId: 3, section: '3. Операторы', title: 'Условия и циклы' },
    { lessonId: 8, section: '4. Функции', title: 'Функции и модули' },
    { lessonId: 6, section: '5. Структуры данных', title: 'Списки, словари, кортежи' },
    { lessonId: 16, section: '6. AI-агенты: основы', title: 'Что такое агент и его цикл' },
    { lessonId: 23, section: '7. Инструменты агентов', title: 'Работа с API и внешними данными' },
    { lessonId: COURSE.length, section: '8. Проект', title: 'Создаём и выпускаем AI-агента' },
  ];
  const DEEP_THEORY = {
    1: { intro: 'Python — это язык, в котором мы описываем компьютеру данные и действия. Тебе не нужно помнить весь синтаксис: важно узнавать основные конструкции, понимать результат и уметь точно попросить ИИ объяснить непонятное место.', sections: [['Переменная', 'Имя связывается со значением: name = "Мира". Позже программа обращается к name, а не к самому тексту. Значение может быть числом, строкой, списком или логическим флагом.'], ['Типы', 'int — целые числа, float — дроби, str — текст, bool — True/False. Тип влияет на доступные операции: строку нельзя бездумно сложить с числом.'], ['Работа с ИИ', 'Проси ИИ сначала назвать входные данные, шаги и ожидаемый вывод. После генерации проверь код маленьким примером и задай вопрос: «Почему здесь именно этот тип?»']] },
    8: { intro: 'Функция — отдельный именованный кусок логики. Она превращает повторяющееся действие в инструмент, который можно вызвать из агента, протестировать отдельно и заменить без переписывания всей программы.', sections: [['Вход', 'Параметры — данные, которые функция получает. Хорошая функция явно говорит, что ей нужно: def greet(name):.'], ['Выход', 'return возвращает значение вызывающему коду. print только показывает текст человеку и обычно не подходит как результат инструмента.'], ['Проверка', 'Попроси ИИ написать три тестовых случая: обычный, пустой или неправильный. Так ты видишь не только красивый пример, но и границы поведения.']] },
    15: { intro: 'LLM API — это обычный запрос к внешнему сервису: приложение отправляет модель, инструкции и сообщения, а получает ответ. Токен не является частью логики урока и никогда не должен попадать в браузерный код или Git.', sections: [['Сообщения', 'system задаёт правила, user содержит задачу, assistant — предыдущий ответ, tool — результат действия. История превращает отдельные запросы в разговор.'], ['Запрос и ответ', 'Нужно обработать таймаут, ошибку сети и неожиданный формат ответа. Не принимай любой текст модели за доказанно верный результат.'], ['Работа с ИИ', 'Попроси ИИ составить контракт: какие поля приходят на вход, какой ответ нужен и что делать при ошибке. Это полезнее, чем просить «сделай весь проект».']] },
    16: { intro: 'Агент — это цикл принятия решений вокруг модели. Модель выбирает следующий шаг, приложение вызывает разрешённый инструмент, возвращает результат в контекст, и цикл повторяется до понятного финального ответа.', sections: [['Цикл', 'Задача → план → вызов инструмента → наблюдение → проверка результата → ответ. У цикла должен быть лимит шагов, иначе ошибка может превратиться в бесконечные повторы.'], ['Инструмент', 'Инструмент делает конкретное действие: поиск, расчёт, чтение заявки. Он не должен обладать лишними правами и должен возвращать предсказуемую структуру.'], ['Граница', 'Модель предлагает действие, но приложение решает, разрешено ли его выполнять. Нельзя позволять модели напрямую удалять данные, отправлять деньги или письма без проверки.']] },
    35: { intro: 'Контекст — это рабочая память текущего запроса. Чем больше лишнего текста, тем труднее модели удерживать правила. Хорошая система передаёт только задачу, нужные факты, историю и результаты инструментов.', sections: [['System', 'Системная инструкция задаёт роль, стиль, ограничения и критерии результата. Она не заменяет проверки в коде: важные правила должны быть продублированы guardrails.'], ['Источники', 'Если агент работает с документами, передай найденные фрагменты и их источники. Не проси модель угадывать то, чего нет в контексте.'], ['Промпт для ИИ', 'Проси сначала объяснить допущения и план, затем написать маленькую функцию. Так проще понять решение и исправить один участок.']] },
    37: { intro: 'Function calling — это не магия, а согласованный контракт между моделью и обычной функцией Python. Модель выбирает имя и аргументы, приложение проверяет их, запускает функцию и отправляет результат обратно.', sections: [['Схема', 'У инструмента есть имя, описание, параметры и типы. Чем точнее описание, тем меньше двусмысленных вызовов.'], ['Валидация', 'Проверяй обязательные поля, диапазоны и права доступа до выполнения. Неверный аргумент должен дать безопасную ошибку, а не случайное действие.'], ['Декомпозиция', 'Один инструмент — одно понятное действие. Попроси ИИ сначала показать JSON-вызов и отдельно объяснить, какая строка Python его обрабатывает.']] },
    42: { intro: 'Перед первым заказом важен не самый длинный код, а доказуемая надёжность. Сделай маленький сценарий, набор примеров, понятный README и покажи, как система ведёт себя при ошибке.', sections: [['Тесты', 'Составь 5–10 типичных запросов и несколько плохих входов. Запиши ожидаемый результат и сравнивай ответы после каждого изменения.'], ['Наблюдаемость', 'Логируй шаг, имя инструмента, длительность и тип ошибки. Не записывай токены, пароли и лишние персональные данные.'], ['Передача клиенту', 'Опиши задачу, ограничения, запуск, переменные окружения и что именно проверено. Клиент покупает понятный результат, а не обещание «ИИ всё сделает».']] },
  };
  const defaultState = () => ({ completed: [], quizzes: {}, attempts: {}, practice: {}, current: 1, screen: 'home', theme: 'light', streak: 0, lastStudyDate: '' });
  let state = loadState();
  let pyodide = null;
  let loadingPyodide = null;
  let practiceFlow = null;

  const $ = (selector) => document.querySelector(selector);
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY));
      return { ...defaultState(), ...(saved || {}), completed: Array.isArray(saved?.completed) ? saved.completed : [] };
    } catch { return defaultState(); }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function studyToday() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastStudyDate === today) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    state.streak = state.lastStudyDate === yesterday ? state.streak + 1 : 1;
    state.lastStudyDate = today; saveState();
  }
  function escaped(value) { return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]); }
  function starterForTask(task) {
    const hint = task.required?.length ? `# Подсказка: используй ${task.required.join(', ')}` : '# Начни с переменных и print()';
    return `# Напиши решение здесь\n${hint}\n`;
  }
  function currentLesson() { return COURSE.find((lesson) => lesson.id === state.current) || COURSE[0]; }
  function isComplete(lesson) { return state.completed.includes(lesson.id); }
  function checkCompletion(lesson) {
    const testDone = state.quizzes[lesson.id]?.passed;
    const tasksDone = lesson.practice.every((_, index) => state.practice[`${lesson.id}:${index}`]?.passed);
    if (testDone && tasksDone && !isComplete(lesson)) {
      state.completed = [...state.completed, lesson.id].sort((a, b) => a - b);
      const sprintIndex = SPRINT_LESSON_IDS.indexOf(lesson.id);
      state.current = sprintIndex >= 0 ? (SPRINT_LESSON_IDS[sprintIndex + 1] || lesson.id) : Math.min(COURSE.length, lesson.id + 1);
      saveState();
      return true;
    }
    return false;
  }
  function applyTheme() {
    document.body.classList.remove('dark', 'theme-light', 'theme-lavender', 'theme-pink', 'theme-blue', 'theme-graphite');
    document.body.classList.add(`theme-${state.theme}`);
    document.body.classList.toggle('dark', state.theme === 'dark' || state.theme === 'graphite');
    const labels = { light: 'Светлая тема', dark: 'Тёмная тема', lavender: 'Сиреневая тема', pink: 'Розовая тема', blue: 'Синяя тема', graphite: 'Графитовая тема' };
    $('#theme-text').textContent = labels[state.theme] || labels.light;
  }
  function renderRoadmap() {
    const roadmap = $('#roadmap');
    const completed = state.completed.length;
    $('#progress-label').textContent = completed ? `Пройдено: ${completed}` : 'Начни с первого шага';
    const progress = Math.round((completed / COURSE.length) * 100);
    $('#progress-fill').style.width = `${progress}%`;
    $('#progress-percent').textContent = `${progress}%`;
    const currentRouteIndex = Math.max(0, ROUTE_STEPS.reduce((active, step, index) => state.current >= step.lessonId ? index : active, 0));
    roadmap.innerHTML = `<div class="route-map">${ROUTE_STEPS.map((step, index) => {
      const done = index < currentRouteIndex;
      const available = index <= currentRouteIndex;
      const selected = index === currentRouteIndex;
      const cls = `${done ? 'completed' : available ? 'available' : 'locked'} ${selected ? 'current' : ''}`;
      return `<button class="route-step ${cls}" type="button" data-lesson="${step.lessonId}" ${available ? '' : 'disabled'}><span class="route-copy"><span>${step.section}</span><strong>${escaped(step.title)}</strong></span><span class="route-node">${done ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : available ? index + 1 : '<i class="fa-solid fa-lock" aria-hidden="true"></i>'}</span></button>`;
    }).join('')}</div><p class="route-note">Маршрут открывается шаг за шагом</p>`;
    roadmap.querySelectorAll('[data-lesson]').forEach((button) => button.addEventListener('click', () => selectLesson(Number(button.dataset.lesson))));
  }
  function renderSprint() {
    const sprint = $('#sprint-plan');
    sprint.innerHTML = SPRINT_DAYS.map((day) => {
      const done = day.lessons.filter((id) => state.completed.includes(id)).length;
      const active = day.lessons.some((id) => id === state.current);
      return `<button class="sprint-day ${active ? 'active' : ''}" type="button" data-sprint-lesson="${day.lessons[0]}"><span>День ${day.day} · ${escaped(day.duration)}</span><strong>${escaped(day.title)}</strong><small>${done}/${day.lessons.length} · ${escaped(day.outcome)}</small></button>`;
    }).join('');
    sprint.querySelectorAll('[data-sprint-lesson]').forEach((button) => button.addEventListener('click', () => selectLesson(Number(button.dataset.sprintLesson))));
  }
  function renderStreak() {
    const streak = state.streak || 0;
    const label = `${streak} ${streak === 1 ? 'день' : streak >= 2 && streak <= 4 ? 'дня' : 'дней'}`;
    $('#streak-value').textContent = label; $('#streak-inline-value').textContent = label;
    const days = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']; const today = new Date().getDay(); const mondayIndex = today === 0 ? 6 : today - 1;
    $('#streak-days').innerHTML = days.map((day, index) => {
      const active = streak > 0 && index <= mondayIndex && mondayIndex - index < streak;
      return `<div class="streak-day ${active ? 'active' : ''}"><span>${active ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ''}</span>${day}</div>`;
    }).join('');
  }
  function renderHome() {
    document.body.classList.remove('focus-mode');
    const current = currentLesson();
    $('#lesson-view').innerHTML = `<div class="home-screen"><p class="lesson-kicker">ОДНОДНЕВНЫЙ ИНТЕНСИВ · 3–5 ЧАСОВ</p><h1 class="home-title">Python → AI-агенты</h1><p class="home-lead">Пойми, как ставить задачи ИИ, читать его код, проверять результат и собирать простых агентов для первых заказов.</p><div class="home-progress"><div><span>Твой прогресс</span><strong>${state.completed.length} из ${SPRINT_LESSON_IDS.length} шагов</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round((state.completed.filter((id) => SPRINT_LESSON_IDS.includes(id)).length / SPRINT_LESSON_IDS.length) * 100)}%"></div></div></div><section class="theme-picker"><div class="section-heading"><div><h2>Выбери спокойную тему</h2><p class="theory-text">Настрой цвет до начала — потом его можно сменить в шапке.</p></div></div><div class="theme-grid">${[['light','Белая'],['lavender','Сиреневая'],['pink','Розовая'],['blue','Синяя'],['graphite','Графитовая'],['dark','Тёмная']].map(([id, label]) => `<button class="theme-card ${state.theme === id ? 'selected' : ''}" type="button" data-theme-choice="${id}"><span class="theme-preview theme-preview-${id}"><i></i><b></b><em></em></span><strong>${label}</strong><small>Пример интерфейса</small></button>`).join('')}</div></section><button class="primary-button home-start" id="start-course"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i> ${state.completed.length ? `Продолжить: ${escaped(current.title)}` : 'Начать курс'}</button></div>`;
    $('#lesson-view').querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => { state.theme = button.dataset.themeChoice; saveState(); applyTheme(); renderHome(); }));
    $('#start-course').addEventListener('click', () => { state.screen = 'lesson'; saveState(); renderLesson(); });
  }
  function renderDeepTheory(lesson) {
    const guide = DEEP_THEORY[lesson.id];
    if (!guide) return `<div class="theory-reading"><p>${escaped(lesson.theory)}</p></div>`;
    return `<div class="theory-reading"><p>${escaped(guide.intro)}</p>${guide.sections.map(([title, text]) => `<div class="theory-block"><strong>${escaped(title)}</strong><p>${escaped(text)}</p></div>`).join('')}</div>`;
  }
  function setLessonStage(lesson) {
    const theory = document.querySelector('.theory-card'); const ai = document.querySelector('.ai-workflow'); const quiz = document.querySelector('.quiz-card'); const practice = document.querySelector('.practice-card');
    if (!theory || !quiz || !practice) return;
    theory.insertAdjacentHTML('beforeend', '<button class="primary-button theory-next" id="theory-next" type="button">К тесту <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>');
    const quizPassed = state.quizzes[lesson.id]?.passed;
    quiz.hidden = !quizPassed; practice.hidden = !quizPassed; if (ai) ai.hidden = Boolean(quizPassed);
    $('#theory-next').addEventListener('click', () => { theory.hidden = true; if (ai) ai.hidden = true; quiz.hidden = false; });
  }
  function renderLesson() {
    if (state.screen === 'home') return renderHome();
    document.body.classList.add('focus-mode');
    const lesson = currentLesson();
    if (!isLessonUnlocked(lesson.id, state.completed)) {
      $('#lesson-view').replaceChildren($('#locked-template').content.cloneNode(true)); return;
    }
    const previousQuiz = state.quizzes[lesson.id];
    const quiz = lesson.quiz.map((item, index) => `<div class="quiz-question"><span class="question-number">${index + 1}</span><p>${escaped(item.question)}</p>${item.options.map((option, optionIndex) => `<label class="option"><input type="radio" name="q${index}" value="${optionIndex}"> ${escaped(option)}</label>`).join('')}</div>`).join('');
    const tasks = lesson.practice.map((task, index) => {
      const key = `${lesson.id}:${index}`; const record = state.practice[key] || {}; const attempts = state.attempts[key] || 0;
      const draft = record.code && record.code !== task.starter ? record.code : starterForTask(task);
      return `<div class="task"><p><strong>Задание ${index + 1}.</strong> ${escaped(task.instruction)}</p><div class="task-workspace"><div class="editor-panel"><textarea class="editor" id="editor-${index}" spellcheck="false" aria-label="Код для задания ${index + 1}">${escaped(draft)}</textarea><div class="run-row"><button class="primary-button run-code" type="button" data-task="${index}"><i class="fa-solid fa-play" aria-hidden="true"></i> Запустить</button><span class="attempts">Попыток: <span id="attempts-${index}">${attempts}</span></span></div></div><div class="output-wrap"><span class="output-label">Вывод Python</span><pre class="output" id="output-${index}">${escaped(record.output || 'Нажми «Запустить», чтобы выполнить код.')}</pre></div></div><p class="feedback ${record.passed ? 'success' : ''}" id="practice-feedback-${index}">${record.passed ? '✓ Задание выполнено.' : ''}</p></div>`;
    }).join('');
    const completion = isComplete(lesson) ? `<section class="card completion"><span class="completion-icon">✓</span><div><h2>Урок пройден</h2><p>Следующий урок уже доступен в маршруте.</p></div></section>` : '';
    $('#lesson-view').innerHTML = `<header class="lesson-header"><div><p class="lesson-kicker">${escaped(lesson.badge)} · шаг интенсива</p><h1 class="lesson-title">${escaped(lesson.title)}</h1></div><span class="lesson-count">${lesson.practice.length} практика</span></header><section class="card theory-card"><h2>1. Пойми принцип</h2><div class="theory-grid"><p class="theory-text">${escaped(lesson.theory)}</p><pre class="code-example"><code>${escaped(lesson.example)}</code></pre></div></section><aside class="ai-workflow"><span><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Работай с ИИ как с напарником</span><p>Спроси: «Объясни план решения простыми шагами. Напиши черновик и прокомментируй каждую строку». Затем запусти код, найди ошибку и попроси ИИ объяснить именно её — не переходи дальше, пока можешь пересказать логику своими словами.</p></aside><section class="card quiz-card"><div class="section-heading"><div><h2>2. Проверь себя</h2><p class="theory-text">Три вопроса · проходной балл 70%</p></div></div><form id="quiz-form"><div class="quiz-list">${quiz}</div><button class="primary-button" type="submit"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Проверить тест</button><p class="feedback ${previousQuiz?.passed ? 'success' : ''}" id="quiz-feedback">${previousQuiz ? `Последний результат: ${previousQuiz.percent}%. ${previousQuiz.passed ? '✓ Тест зачтён.' : 'Попробуй ещё раз.'}` : ''}</p></form></section><section class="card practice-card"><div class="section-heading"><div><h2>3. Собери с ИИ и проверь</h2><p class="theory-text">Попроси ИИ дать черновик, затем разберись в нём и запусти код в браузере.</p></div><span class="practice-count">${lesson.practice.length} задания</span></div>${tasks}</section>${completion}`;
    document.querySelector('.theory-card .theory-text').innerHTML = renderDeepTheory(lesson);
    setLessonStage(lesson);
    $('#lesson-view').querySelectorAll('.run-code').forEach((button) => button.addEventListener('click', () => runPractice(lesson, Number(button.dataset.task), button)));
    $('#lesson-view').querySelector('.lesson-header').insertAdjacentHTML('afterbegin', '<button class="home-button" id="home-button" type="button" aria-label="Вернуться на главную"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></button>');
    $('#home-button').addEventListener('click', goHome);
    activateQuizFlow(lesson);
    activatePracticeFlow(lesson);
  }
  function activateQuizFlow(lesson) {
    const form = $('#quiz-form'); if (!form) return;
    const questions = [...form.querySelectorAll('.quiz-question')]; const button = form.querySelector('button[type="submit"]'); const feedback = $('#quiz-feedback');
    let cursor = 0; const answers = [];
    const show = () => { questions.forEach((item, index) => { item.hidden = index !== cursor; item.classList.toggle('is-active', index === cursor); }); button.innerHTML = cursor === questions.length - 1 ? '<i class="fa-solid fa-check" aria-hidden="true"></i> Завершить тест' : '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i> Ответить'; feedback.textContent = `Вопрос ${cursor + 1} из ${questions.length}`; feedback.className = 'feedback'; };
    form.onsubmit = (event) => { event.preventDefault(); const selected = form.querySelector(`input[name="q${cursor}"]:checked`); if (!selected) { feedback.className = 'feedback error'; feedback.textContent = 'Выбери ответ, чтобы продолжить.'; return; } const answer = Number(selected.value); if (answer !== lesson.quiz[cursor].correct) { feedback.className = 'feedback error'; feedback.textContent = 'Пока нет. Разбери объяснение и попробуй ещё раз.'; return; } answers[cursor] = answer; cursor += 1; if (cursor < questions.length) return show(); const result = evaluateAnswers(lesson.quiz, answers); state.quizzes[lesson.id] = result; const completedNow = checkCompletion(lesson); saveState(); feedback.className = 'feedback success'; feedback.textContent = `✓ Тест пройден: ${result.percent}%.`; const quizCard = document.querySelector('.quiz-card'); const practiceCard = document.querySelector('.practice-card'); const ai = document.querySelector('.ai-workflow'); if (quizCard) quizCard.hidden = true; if (practiceCard) practiceCard.hidden = false; if (ai) ai.hidden = true; renderRoadmap(); if (completedNow) renderLesson(); };
    show();
  }
  function activatePracticeFlow(lesson) {
    const tasks = [...document.querySelectorAll('.practice-card .task')]; if (tasks.length < 2) return;
    let cursor = 0; tasks.forEach((task, index) => { task.hidden = index !== 0; });
    practiceFlow = { reveal(index) { if (index !== cursor || cursor >= tasks.length - 1) return; cursor += 1; tasks[cursor].hidden = false; tasks[cursor].scrollIntoView({ behavior: 'smooth', block: 'center' }); } };
  }
  function selectLesson(id) { if (isLessonUnlocked(id, state.completed)) { state.current = id; state.screen = 'lesson'; saveState(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  function goHome() { state.screen = 'home'; saveState(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function submitQuiz(event, lesson) {
    event.preventDefault();
    const answers = lesson.quiz.map((_, index) => { const selected = document.querySelector(`input[name="q${index}"]:checked`); return selected ? Number(selected.value) : -1; });
    const result = evaluateAnswers(lesson.quiz, answers); state.quizzes[lesson.id] = result; const completedNow = checkCompletion(lesson); saveState();
    const feedback = $('#quiz-feedback'); feedback.className = `feedback ${result.passed ? 'success' : 'error'}`;
    feedback.textContent = result.passed ? `✓ ${result.correct}/${lesson.quiz.length}: ${result.percent}%. Тест зачтён.` : `${result.correct}/${lesson.quiz.length}: ${result.percent}%. Нужно минимум 70% — пересдай тест.`;
    renderRoadmap(); if (completedNow) renderLesson();
  }
  async function ensurePyodide() {
    if (pyodide) return pyodide;
    if (!window.loadPyodide) throw new Error('Не удалось загрузить Pyodide с CDN. Проверь подключение к интернету и обнови страницу.');
    if (!loadingPyodide) {
      setRuntime('Python: загружается…');
      loadingPyodide = window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' }).then((runtime) => { pyodide = runtime; setRuntime('Python: готов', 'ready'); return runtime; }).catch((error) => { setRuntime('Python: не готов', 'error'); loadingPyodide = null; throw error; });
    }
    return loadingPyodide;
  }
  async function runPractice(lesson, taskIndex, button) {
    const task = lesson.practice[taskIndex]; const key = `${lesson.id}:${taskIndex}`; const editor = $(`#editor-${taskIndex}`); const output = $(`#output-${taskIndex}`); const feedback = $(`#practice-feedback-${taskIndex}`); const code = editor.value;
    button.disabled = true; button.textContent = 'Запуск…'; output.textContent = 'Выполняю Python…'; state.attempts[key] = (state.attempts[key] || 0) + 1; $(`#attempts-${taskIndex}`).textContent = state.attempts[key]; studyToday(); renderStreak();
    try {
      const runtime = await ensurePyodide(); const lines = [];
      runtime.setStdout({ batched: (text) => lines.push(text) }); runtime.setStderr({ batched: (text) => lines.push(text) });
      await runtime.runPythonAsync(code); const resultOutput = lines.join('\n'); output.textContent = resultOutput || '(нет вывода)';
      const validation = validatePractice(task, code, resultOutput); state.practice[key] = { code, output: resultOutput, passed: validation.passed };
      feedback.className = `feedback ${validation.passed ? 'success' : 'error'}`; feedback.textContent = validation.passed ? '✓ Задание выполнено.' : `Пока не зачтено: ${validation.reason}`;
      if (validation.passed) practiceFlow?.reveal(taskIndex);
      const completedNow = checkCompletion(lesson); saveState(); renderRoadmap(); if (completedNow) renderLesson();
    } catch (error) {
      const message = error?.message || String(error); output.textContent = message; state.practice[key] = { code, output: message, passed: false }; feedback.className = 'feedback error'; feedback.textContent = 'Python сообщил об ошибке. Исправь код и попробуй снова.'; saveState();
    } finally { button.disabled = false; button.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i> Запустить'; }
  }
  function setRuntime(text, kind = '') { const status = $('#runtime-status'); status.textContent = text; status.className = `runtime-status ${kind}`; }
  function warmPython() {
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, 450));
    schedule(() => ensurePyodide().catch(() => {}));
  }
  function render() { applyTheme(); renderSprint(); renderRoadmap(); renderStreak(); renderLesson(); }
  $('#theme-toggle').addEventListener('click', () => { const themes = ['light', 'lavender', 'pink', 'blue', 'graphite', 'dark']; state.theme = themes[(themes.indexOf(state.theme) + 1) % themes.length]; saveState(); applyTheme(); if (state.screen === 'home') renderHome(); });
  $('#reset-progress').addEventListener('click', () => { if (window.confirm('Сбросить весь прогресс этого курса на этом устройстве?')) { state = defaultState(); saveState(); render(); } });
  if (window.loadPyodide) setRuntime('Python: подготавливается…'); else setRuntime('Python: CDN недоступен', 'error');
  render();
  if (window.loadPyodide) warmPython();
})();
