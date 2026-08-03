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
    2: { intro: 'Тип данных определяет, какие операции безопасны. Число можно складывать, строку — соединять, а преобразование нужно делать явно: int("7") превращает текст в число.', sections: [['Читай значение', 'type(value).__name__ помогает быстро проверить предположение. Ошибки часто начинаются с того, что строку принимают за число.'], ['Преобразуй явно', 'Используй int, float и str на границе ввода. После преобразования снова проверь результат маленьким примером.'], ['Работа с ИИ', 'Проси модель показать тип каждого входа и ожидаемый вывод. Если ответ неясен, попроси минимальный воспроизводимый пример.']] },
    3: { intro: 'Условия превращают данные в решение. Python читает выражение после if, а отступ показывает, какие строки входят в ветку.', sections: [['Логика', 'Сравнения возвращают True или False. and требует оба условия, or — хотя бы одно, not меняет значение.'], ['Границы', 'Проверь равенство, нижнюю и верхнюю границу отдельно. Это один из самых частых источников ошибок в заказных скриптах.'], ['Разбор ИИ-кода', 'Попроси ИИ назвать все ветки и привести вход, который попадает в каждую. Так ты проверяешь логику, а не только синтаксис.']] },
    4: { intro: 'Цикл for повторяет действие для каждого элемента. Это удобный способ обрабатывать заявки, строки, файлы и ответы инструментов.', sections: [['range', 'range(start, stop) не включает stop. Поэтому для чисел от 1 до 3 используется range(1, 4).'], ['Контроль', 'break останавливает цикл, continue пропускает текущую итерацию. Используй их только когда правило остановки понятно.'], ['Практика', 'Начинай с печати одного элемента, затем добавляй условие. Маленькие шаги легче объяснить ИИ и проще отладить.']] },
    6: { intro: 'Коллекции позволяют хранить несколько значений и передавать их между функциями и инструментами. Список сохраняет порядок, словарь связывает ключ с данными.', sections: [['Список', 'Индекс начинается с нуля. len показывает размер, append добавляет элемент, а перебор for обрабатывает каждый элемент.'], ['Словарь', 'Получай значение по ключу и используй .get, если ключ может отсутствовать. Это делает ответ агента устойчивее.'], ['Граница', 'Проверь пустую коллекцию и неизвестный ключ. Именно такие случаи нужно включать в промпт и тесты.']] },
    12: { intro: 'JSON — общий язык между Python, API и инструментами. Важно уметь превращать JSON-строку в объект и обратно, не путая текст с данными.', sections: [['Чтение', 'json.loads принимает строку и возвращает словарь или список. После этого обращайся к полям как к обычной коллекции.'], ['Запись', 'json.dumps превращает Python-объект в строку для передачи по HTTP или сохранения.'], ['Проверка', 'Внешний JSON может быть неполным. Проверяй обязательные поля до того, как передать данные модели или клиенту.']] },
    17: { intro: 'Цикл агента — это управляемая программа: модель предлагает шаг, приложение вызывает разрешённый инструмент, результат возвращается в контекст.', sections: [['Состояние', 'Храни историю сообщений, текущий шаг и результаты инструментов в понятной структуре.'], ['Остановка', 'Задай max_steps и критерий финального ответа. Без них даже правильный агент может зациклиться.'], ['Отладка', 'Логируй названия шагов и ошибки без секретов. По журналу должно быть видно, где решение пошло не туда.']] },
    23: { intro: 'Инструмент агента — это обычная функция с понятным контрактом. Агент выбирает её, но приложение проверяет аргументы и права до запуска.', sections: [['Контракт', 'Опиши имя, назначение, обязательные поля и формат результата. Один инструмент должен решать одну задачу.'], ['Ошибки', 'Верни структурированную ошибку вместо падения всего цикла. Модель должна понять, что можно исправить, а что нельзя повторять.'], ['Заказ', 'Для клиента формулируй инструмент через результат: найти заявку, рассчитать сумму, подготовить черновик — не через абстрактное «добавить ИИ».']] },
    42: { intro: 'Перед первым заказом важен не самый длинный код, а доказуемая надёжность. Сделай маленький сценарий, набор примеров, понятный README и покажи, как система ведёт себя при ошибке.', sections: [['Тесты', 'Составь 5–10 типичных запросов и несколько плохих входов. Запиши ожидаемый результат и сравнивай ответы после каждого изменения.'], ['Наблюдаемость', 'Логируй шаг, имя инструмента, длительность и тип ошибки. Не записывай токены, пароли и лишние персональные данные.'], ['Передача клиенту', 'Опиши задачу, ограничения, запуск, переменные окружения и что именно проверено. Клиент покупает понятный результат, а не обещание «ИИ всё сделает».']] },
  };
  const defaultState = () => ({ completed: [], quizzes: {}, attempts: {}, practice: {}, current: 1, screen: 'home', theme: 'classic', themeSelected: false, streak: 0, lastStudyDate: '' });
  let state = loadState();
  let pyodide = null;
  let loadingPyodide = null;
  let practiceFlow = null;

  const $ = (selector) => document.querySelector(selector);
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY));
      const next = { ...defaultState(), ...(saved || {}), completed: Array.isArray(saved?.completed) ? saved.completed : [] };
      if (!next.themeSelected || !['classic', 'lavender', 'pink', 'blue', 'graphite', 'dark'].includes(next.theme)) next.theme = 'classic';
      return next;
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
  function countWord(value, forms) {
    const remainder = Math.abs(value) % 100; const unit = remainder % 10;
    if (remainder > 10 && remainder < 20) return forms[2];
    if (unit === 1) return forms[0];
    if (unit >= 2 && unit <= 4) return forms[1];
    return forms[2];
  }
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
    document.body.classList.remove('dark', 'theme-classic', 'theme-light', 'theme-lavender', 'theme-pink', 'theme-blue', 'theme-graphite');
    document.body.classList.add(`theme-${state.theme}`);
    document.body.classList.toggle('dark', state.theme === 'dark' || state.theme === 'graphite');
    const labels = { classic: 'Классическая тема', light: 'Светлая тема', dark: 'Тёмная тема', lavender: 'Сиреневая тема', pink: 'Розовая тема', blue: 'Синяя тема', graphite: 'Графитовая тема' };
    const themeText = $('#theme-text'); if (themeText) themeText.textContent = labels[state.theme] || labels.classic;
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
    $('#streak-value').textContent = label;
    const inlineValue = $('#streak-inline-value'); if (inlineValue) inlineValue.textContent = label;
    const days = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']; const today = new Date().getDay(); const mondayIndex = today === 0 ? 6 : today - 1;
    $('#streak-days').innerHTML = days.map((day, index) => {
      const active = streak > 0 && index <= mondayIndex && mondayIndex - index < streak;
      return `<div class="streak-day ${active ? 'active' : ''}"><span>${active ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : ''}</span>${day}</div>`;
    }).join('');
  }
  function activateParticleTrail() {
    const screen = $('#home-screen'); const field = $('#particle-field');
    if (!screen || !field || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const symbols = ['fa-code', 'fa-terminal', 'fa-code-branch', 'fa-wand-magic-sparkles', 'fa-bolt', 'fa-database', 'fa-gear', 'fa-cubes', 'fa-brain', 'fa-circle-nodes'];
    let last = 0;
    screen.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch' || Date.now() - last < 26) return;
      last = Date.now();
      const bounds = screen.getBoundingClientRect(); const x = event.clientX - bounds.left; const y = event.clientY - bounds.top;
      for (let index = 0; index < 3; index += 1) {
        const particle = document.createElement('i');
        particle.className = `particle-symbol fa-solid ${symbols[Math.floor(Math.random() * symbols.length)]}`;
        particle.style.left = `${x + (Math.random() - .5) * 16}px`; particle.style.top = `${y + (Math.random() - .5) * 16}px`;
        particle.style.fontSize = `${8 + Math.floor(Math.random() * 7)}px`; field.append(particle);
        const driftX = (Math.random() - .5) * 144; const driftY = -24 - Math.random() * 104;
        particle.animate([{ transform: 'translate(-50%, -50%) scale(.88)', opacity: .42 }, { transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${driftY}px)) scale(1.12) rotate(${(Math.random() - .5) * 64}deg)`, opacity: 0 }], { duration: 820 + Math.random() * 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' }).finished.finally(() => particle.remove());
      }
      while (field.childElementCount > 96) field.firstElementChild?.remove();
    });
  }
  function lessonProgressMarkup(lesson, theoryDone = false, quizDone = 0) {
    const practiceDone = lesson.practice.filter((_, index) => state.practice[`${lesson.id}:${index}`]?.passed).length;
    const items = [{ label: 'Теория', done: theoryDone || Boolean(state.quizzes[lesson.id]?.passed) }]
      .concat(lesson.quiz.map((_, index) => ({ label: `Тест ${index + 1}`, done: index < quizDone || Boolean(state.quizzes[lesson.id]?.passed) })))
      .concat(lesson.practice.map((_, index) => ({ label: `Практика ${index + 1}`, done: index < practiceDone })));
    return `<div class="lesson-progress" id="lesson-progress" aria-label="Прогресс урока">${items.map((item, index) => `<span class="lesson-step ${item.done ? 'done' : index === 0 && !theoryDone ? 'current' : ''}" title="${item.label}">${item.done ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : index + 1}</span>`).join('')}</div>`;
  }
  function updateLessonProgress(lesson, theoryDone = false, quizDone = 0) {
    const progress = $('#lesson-progress'); if (progress) progress.outerHTML = lessonProgressMarkup(lesson, theoryDone, quizDone);
  }
  function renderHome() {
    document.body.classList.remove('focus-mode');
    const current = currentLesson();
    $('#lesson-view').innerHTML = `<div class="home-screen" id="home-screen"><div class="particle-field" id="particle-field" aria-hidden="true"></div><div class="home-content"><p class="lesson-kicker">ПРАКТИЧЕСКИЙ КУРС · 2–3 ДНЯ</p><h1 class="home-title">Python → AI-агенты</h1><p class="home-lead">Пойми Python с нуля, научись работать с ИИ как с напарником и собери основу для первых заказов — без лишнего интерфейсного шума.</p><div class="home-progress"><div><span>Твой прогресс</span><strong>${state.completed.length} из ${SPRINT_LESSON_IDS.length} шагов</strong></div><div class="progress-track"><div class="progress-fill" style="width:${Math.round((state.completed.filter((id) => SPRINT_LESSON_IDS.includes(id)).length / SPRINT_LESSON_IDS.length) * 100)}%"></div></div></div><button class="settings-button" id="open-settings" type="button"><i class="fa-solid fa-gear" aria-hidden="true"></i> Настройки</button><button class="primary-button home-start" id="start-course"><i class="fa-solid fa-arrow-right" aria-hidden="true"></i> ${state.completed.length ? `Продолжить: ${escaped(current.title)}` : 'Начать курс'}</button></div><section class="settings-panel" id="settings-panel" hidden><div class="section-heading"><div><p class="lesson-kicker">НАСТРОЙКИ</p><h2>Оформление</h2><p class="theory-text">По умолчанию — белый фон и чёрный акцент. Выбранная тема сохранится только на этом устройстве.</p></div><button class="settings-close" id="close-settings" type="button" aria-label="Закрыть настройки"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div><div class="theme-grid">${[['classic','Классика'],['lavender','Сиреневая'],['pink','Розовая'],['blue','Синяя'],['graphite','Графитовая'],['dark','Тёмная']].map(([id, label]) => `<button class="theme-card ${state.theme === id ? 'selected' : ''}" type="button" data-theme-choice="${id}"><span class="theme-preview theme-preview-${id}"><i></i><b></b><em></em></span><strong>${label}</strong><small>Предпросмотр интерфейса</small></button>`).join('')}</div></section></div>`;
    $('#open-settings').addEventListener('click', () => { $('#settings-panel').hidden = false; $('#open-settings').setAttribute('aria-expanded', 'true'); });
    $('#close-settings').addEventListener('click', () => { $('#settings-panel').hidden = true; $('#open-settings').setAttribute('aria-expanded', 'false'); });
    $('#lesson-view').querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => { state.theme = button.dataset.themeChoice; state.themeSelected = true; saveState(); applyTheme(); renderHome(); }));
    $('#start-course').addEventListener('click', () => { state.screen = 'lesson'; saveState(); renderLesson(); });
    activateParticleTrail();
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
    $('#theory-next').addEventListener('click', () => { theory.hidden = true; if (ai) ai.hidden = true; quiz.hidden = false; updateLessonProgress(lesson, true, 0); });
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
      return `<div class="task"><p><strong>Задание ${index + 1}.</strong> ${escaped(task.instruction)}</p><div class="task-workspace"><div class="editor-panel"><textarea class="editor" id="editor-${index}" spellcheck="false" aria-label="Код для задания ${index + 1}">${escaped(draft)}</textarea><div class="run-row"><button class="primary-button run-code" type="button" data-task="${index}"><i class="fa-solid fa-play" aria-hidden="true"></i> Запустить</button><span class="attempts">Число попыток: <span id="attempts-${index}">${attempts}</span></span></div></div><div class="output-wrap"><span class="output-label">Вывод Python</span><pre class="output" id="output-${index}">${escaped(record.output || 'Нажми «Запустить», чтобы выполнить код.')}</pre></div></div><p class="feedback ${record.passed ? 'success' : ''}" id="practice-feedback-${index}">${record.passed ? '✓ Задание выполнено.' : ''}</p></div>`;
    }).join('');
    const completion = isComplete(lesson) ? `<section class="card completion"><span class="completion-icon">✓</span><div><h2>Урок пройден</h2><p>Следующий урок уже доступен в маршруте.</p></div></section>` : '';
    $('#lesson-view').innerHTML = `<header class="lesson-header"><div><p class="lesson-kicker">${escaped(lesson.badge)} · шаг интенсива</p><h1 class="lesson-title">${escaped(lesson.title)}</h1></div>${lessonProgressMarkup(lesson, Boolean(previousQuiz?.passed), previousQuiz?.passed ? lesson.quiz.length : 0)}</header><section class="card theory-card"><h2>1. Пойми принцип</h2><div class="theory-grid"><p class="theory-text">${escaped(lesson.theory)}</p><pre class="code-example"><code>${escaped(lesson.example)}</code></pre></div></section><aside class="ai-workflow"><span><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Работай с ИИ как с напарником</span><p>Спроси: «Объясни план решения простыми шагами. Напиши черновик и прокомментируй каждую строку». Затем запусти код, найди ошибку и попроси ИИ объяснить именно её — не переходи дальше, пока можешь пересказать логику своими словами.</p></aside><section class="card quiz-card"><div class="section-heading"><div><h2>2. Проверь себя</h2><p class="theory-text">Три вопроса · проходной балл 70%</p></div></div><form id="quiz-form"><div class="quiz-list">${quiz}</div><button class="primary-button" type="submit"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Проверить тест</button><p class="feedback ${previousQuiz?.passed ? 'success' : ''}" id="quiz-feedback">${previousQuiz ? `Последний результат: ${previousQuiz.percent}%. ${previousQuiz.passed ? '✓ Тест зачтён.' : 'Попробуй ещё раз.'}` : ''}</p></form></section><section class="card practice-card"><div class="section-heading"><div><h2>3. Собери с ИИ и проверь</h2><p class="theory-text">Попроси ИИ дать черновик, затем разберись в нём и запусти код в браузере.</p></div><span class="practice-count">${lesson.practice.length} ${countWord(lesson.practice.length, ['задание', 'задания', 'заданий'])}</span></div>${tasks}</section>${completion}`;
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
    const show = () => { questions.forEach((item, index) => { item.hidden = index !== cursor; item.classList.toggle('is-active', index === cursor); }); button.innerHTML = cursor === questions.length - 1 ? '<i class="fa-solid fa-check" aria-hidden="true"></i> Завершить тест' : '<i class="fa-solid fa-arrow-right" aria-hidden="true"></i> Ответить'; feedback.textContent = `Вопрос ${cursor + 1} из ${questions.length}`; feedback.className = 'feedback'; updateLessonProgress(lesson, true, cursor); };
    form.onsubmit = (event) => { event.preventDefault(); const selected = form.querySelector(`input[name="q${cursor}"]:checked`); if (!selected) { feedback.className = 'feedback error'; feedback.textContent = 'Выбери ответ, чтобы продолжить.'; return; } const answer = Number(selected.value); if (answer !== lesson.quiz[cursor].correct) { feedback.className = 'feedback error'; feedback.textContent = 'Пока нет. Разбери объяснение и попробуй ещё раз.'; return; } answers[cursor] = answer; cursor += 1; if (cursor < questions.length) return show(); const result = evaluateAnswers(lesson.quiz, answers); state.quizzes[lesson.id] = result; const completedNow = checkCompletion(lesson); saveState(); updateLessonProgress(lesson, true, lesson.quiz.length); feedback.className = 'feedback success'; feedback.textContent = `✓ Тест пройден: ${result.percent}%.`; const quizCard = document.querySelector('.quiz-card'); const practiceCard = document.querySelector('.practice-card'); const ai = document.querySelector('.ai-workflow'); if (quizCard) quizCard.hidden = true; if (practiceCard) practiceCard.hidden = false; if (ai) ai.hidden = true; renderRoadmap(); if (completedNow) renderLesson(); };
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
      updateLessonProgress(lesson, true, state.quizzes[lesson.id]?.passed ? lesson.quiz.length : 0);
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
  $('#reset-progress').addEventListener('click', () => { if (window.confirm('Сбросить весь прогресс этого курса на этом устройстве?')) { state = defaultState(); saveState(); render(); } });
  if (window.loadPyodide) setRuntime('Python: подготавливается…'); else setRuntime('Python: CDN недоступен', 'error');
  render();
  if (window.loadPyodide) warmPython();
})();
