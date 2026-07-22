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
  const defaultState = () => ({ completed: [], quizzes: {}, attempts: {}, practice: {}, current: 1, theme: 'light', streak: 0, lastStudyDate: '' });
  let state = loadState();
  let pyodide = null;
  let loadingPyodide = null;

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
    document.body.classList.toggle('dark', state.theme === 'dark');
    $('#theme-text').textContent = state.theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
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
      return `<button class="sprint-day ${active ? 'active' : ''}" type="button" data-sprint-lesson="${day.lessons[0]}"><span>День ${day.day}</span><strong>${escaped(day.title)}</strong><small>${done}/${day.lessons.length} · ${escaped(day.outcome)}</small></button>`;
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
  function renderLesson() {
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
    $('#lesson-view').innerHTML = `<header class="lesson-header"><div><p class="lesson-kicker">${escaped(lesson.badge)} · урок ${lesson.id}</p><h1 class="lesson-title">${escaped(lesson.title)}</h1></div><span class="lesson-count">${lesson.practice.length} практики</span></header><section class="card theory-card"><h2>1. Теория</h2><div class="theory-grid"><p class="theory-text">${escaped(lesson.theory)}</p><pre class="code-example"><code>${escaped(lesson.example)}</code></pre></div></section><section class="card quiz-card"><div class="section-heading"><div><h2>2. Проверь себя</h2><p class="theory-text">Три вопроса · проходной балл 70%</p></div></div><form id="quiz-form"><div class="quiz-list">${quiz}</div><button class="primary-button" type="submit"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Проверить тест</button><p class="feedback ${previousQuiz?.passed ? 'success' : ''}" id="quiz-feedback">${previousQuiz ? `Последний результат: ${previousQuiz.percent}%. ${previousQuiz.passed ? '✓ Тест зачтён.' : 'Попробуй ещё раз.'}` : ''}</p></form></section><section class="card practice-card"><div class="section-heading"><div><h2>3. Практика в Python</h2><p class="theory-text">Код запускается в браузере через Pyodide.</p></div><span class="practice-count">${lesson.practice.length} задания</span></div>${tasks}</section>${completion}`;
    $('#quiz-form').addEventListener('submit', (event) => submitQuiz(event, lesson));
    $('#lesson-view').querySelectorAll('.run-code').forEach((button) => button.addEventListener('click', () => runPractice(lesson, Number(button.dataset.task), button)));
  }
  function selectLesson(id) { if (isLessonUnlocked(id, state.completed)) { state.current = id; saveState(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
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
  $('#theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; saveState(); applyTheme(); });
  $('#reset-progress').addEventListener('click', () => { if (window.confirm('Сбросить весь прогресс этого курса на этом устройстве?')) { state = defaultState(); saveState(); render(); } });
  if (window.loadPyodide) setRuntime('Python: подготавливается…'); else setRuntime('Python: CDN недоступен', 'error');
  render();
  if (window.loadPyodide) warmPython();
})();
