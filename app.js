(() => {
  const { COURSE, evaluateAnswers, isLessonUnlocked, validatePractice } = window.COURSE_DATA;
  const STORAGE_KEY = 'python-ai-agents-offline-course-v1';
  const defaultState = () => ({ completed: [], quizzes: {}, attempts: {}, practice: {}, current: 1, theme: 'light' });
  let state = loadState();
  let pyodide = null;
  let loadingPyodide = null;

  const $ = (selector) => document.querySelector(selector);
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultState(), ...(saved || {}), completed: Array.isArray(saved?.completed) ? saved.completed : [] };
    } catch { return defaultState(); }
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function escaped(value) { return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]); }
  function currentLesson() { return COURSE.find((lesson) => lesson.id === state.current) || COURSE[0]; }
  function isComplete(lesson) { return state.completed.includes(lesson.id); }
  function checkCompletion(lesson) {
    const testDone = state.quizzes[lesson.id]?.passed;
    const tasksDone = lesson.practice.every((_, index) => state.practice[`${lesson.id}:${index}`]?.passed);
    if (testDone && tasksDone && !isComplete(lesson)) {
      state.completed = [...state.completed, lesson.id].sort((a, b) => a - b);
      state.current = Math.min(30, lesson.id + 1);
      saveState();
      return true;
    }
    return false;
  }
  function applyTheme() {
    document.body.classList.toggle('dark', state.theme === 'dark');
    $('#theme-toggle').textContent = state.theme === 'dark' ? '☀' : '☾';
  }
  function renderRoadmap() {
    const roadmap = $('#roadmap');
    const completed = state.completed.length;
    $('#progress-label').textContent = `${completed} из ${COURSE.length} уроков`;
    $('#progress-fill').style.width = `${(completed / COURSE.length) * 100}%`;
    roadmap.innerHTML = [1, 2].map((block) => {
      const lessons = COURSE.filter((lesson) => lesson.block === block);
      const name = block === 1 ? 'БЛОК 1 · PYTHON С НУЛЯ' : 'БЛОК 2 · AI-АГЕНТЫ';
      return `<section class="roadmap-block"><span class="roadmap-title">${name}</span>${lessons.map((lesson) => {
        const done = isComplete(lesson); const available = isLessonUnlocked(lesson.id, state.completed); const selected = lesson.id === state.current;
        const cls = `${done ? 'completed' : available ? 'available' : 'locked'} ${selected ? 'current' : ''}`;
        return `<button class="lesson-node ${cls}" type="button" data-lesson="${lesson.id}" ${available ? '' : 'disabled'}><span class="node-number">${done ? '✓' : lesson.id}</span><span class="node-name">${escaped(lesson.title)}</span></button>`;
      }).join('')}</section>`;
    }).join('');
    roadmap.querySelectorAll('[data-lesson]').forEach((button) => button.addEventListener('click', () => selectLesson(Number(button.dataset.lesson))));
  }
  function renderLesson() {
    const lesson = currentLesson();
    if (!isLessonUnlocked(lesson.id, state.completed)) {
      $('#lesson-view').replaceChildren($('#locked-template').content.cloneNode(true)); return;
    }
    const previousQuiz = state.quizzes[lesson.id];
    const quiz = lesson.quiz.map((item, index) => `<div class="quiz-question"><p>${index + 1}. ${escaped(item.question)}</p>${item.options.map((option, optionIndex) => `<label class="option"><input type="radio" name="q${index}" value="${optionIndex}"> ${escaped(option)}</label>`).join('')}</div>`).join('');
    const tasks = lesson.practice.map((task, index) => {
      const key = `${lesson.id}:${index}`; const record = state.practice[key] || {}; const attempts = state.attempts[key] || 0;
      return `<div class="task"><p><strong>Задание ${index + 1}.</strong> ${escaped(task.instruction)}</p><textarea class="editor" id="editor-${index}" spellcheck="false" aria-label="Код для задания ${index + 1}">${escaped(record.code || task.starter)}</textarea><div class="run-row"><button class="primary-button run-code" type="button" data-task="${index}">▶ Запустить</button><span class="attempts">Попыток: <span id="attempts-${index}">${attempts}</span></span></div><div class="output-wrap"><span class="output-label">Вывод Python</span><pre class="output" id="output-${index}">${escaped(record.output || 'Нажми «Запустить», чтобы выполнить код.')}</pre></div><p class="feedback ${record.passed ? 'success' : ''}" id="practice-feedback-${index}">${record.passed ? '✓ Задание выполнено.' : ''}</p></div>`;
    }).join('');
    const completion = isComplete(lesson) ? `<section class="card completion"><span class="completion-icon">✓</span><div><h2>Урок пройден</h2><p>Следующий урок уже доступен в маршруте.</p></div></section>` : '';
    $('#lesson-view').innerHTML = `<header class="lesson-header"><div><p class="lesson-kicker">${escaped(lesson.badge)}</p><h1 class="lesson-title">${lesson.id}. ${escaped(lesson.title)}</h1></div><span class="lesson-count">Урок ${lesson.id} / 30</span></header><section class="card"><h2>1. Теория</h2><p class="theory-text">${escaped(lesson.theory)}</p><pre class="code-example"><code>${escaped(lesson.example)}</code></pre></section><section class="card"><h2>2. Быстрый тест</h2><p class="theory-text">Ответь правильно хотя бы на 70% вопросов.</p><form id="quiz-form">${quiz}<button class="primary-button" type="submit">Проверить тест</button><p class="feedback ${previousQuiz?.passed ? 'success' : ''}" id="quiz-feedback">${previousQuiz ? `Последний результат: ${previousQuiz.percent}%. ${previousQuiz.passed ? '✓ Тест зачтён.' : 'Попробуй ещё раз.'}` : ''}</p></form></section><section class="card"><h2>3. Тренажёр кода</h2><p class="theory-text">Код запускается настоящим Python прямо в браузере. Для работы нужен локальный Pyodide.</p>${tasks}</section>${completion}`;
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
    if (!window.loadPyodide) throw new Error('Не найден vendor/pyodide/pyodide.js. Запусти setup.sh (или setup.bat), затем открой сайт через локальный сервер.');
    if (!loadingPyodide) {
      setRuntime('Python: загружается…');
      loadingPyodide = window.loadPyodide({ indexURL: new URL('vendor/pyodide/', window.location.href).href }).then((runtime) => { pyodide = runtime; setRuntime('Python: готов', 'ready'); return runtime; }).catch((error) => { setRuntime('Python: не готов', 'error'); loadingPyodide = null; throw error; });
    }
    return loadingPyodide;
  }
  async function runPractice(lesson, taskIndex, button) {
    const task = lesson.practice[taskIndex]; const key = `${lesson.id}:${taskIndex}`; const editor = $(`#editor-${taskIndex}`); const output = $(`#output-${taskIndex}`); const feedback = $(`#practice-feedback-${taskIndex}`); const code = editor.value;
    button.disabled = true; button.textContent = 'Запуск…'; output.textContent = 'Выполняю Python…'; state.attempts[key] = (state.attempts[key] || 0) + 1; $(`#attempts-${taskIndex}`).textContent = state.attempts[key];
    try {
      const runtime = await ensurePyodide(); const lines = [];
      runtime.setStdout({ batched: (text) => lines.push(text) }); runtime.setStderr({ batched: (text) => lines.push(text) });
      await runtime.runPythonAsync(code); const resultOutput = lines.join('\n'); output.textContent = resultOutput || '(нет вывода)';
      const validation = validatePractice(task, code, resultOutput); state.practice[key] = { code, output: resultOutput, passed: validation.passed };
      feedback.className = `feedback ${validation.passed ? 'success' : 'error'}`; feedback.textContent = validation.passed ? '✓ Задание выполнено.' : `Пока не зачтено: ${validation.reason}`;
      const completedNow = checkCompletion(lesson); saveState(); renderRoadmap(); if (completedNow) renderLesson();
    } catch (error) {
      const message = error?.message || String(error); output.textContent = message; state.practice[key] = { code, output: message, passed: false }; feedback.className = 'feedback error'; feedback.textContent = 'Python сообщил об ошибке. Исправь код и попробуй снова.'; saveState();
    } finally { button.disabled = false; button.textContent = '▶ Запустить'; }
  }
  function setRuntime(text, kind = '') { const status = $('#runtime-status'); status.textContent = text; status.className = `runtime-status ${kind}`; }
  function render() { applyTheme(); renderRoadmap(); renderLesson(); }
  $('#theme-toggle').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; saveState(); applyTheme(); });
  $('#reset-progress').addEventListener('click', () => { if (window.confirm('Сбросить весь прогресс этого курса на этом устройстве?')) { state = defaultState(); saveState(); render(); } });
  if (window.loadPyodide) setRuntime('Python: готов к запуску'); else setRuntime('Python: нужен setup.sh', 'error');
  render();
})();
