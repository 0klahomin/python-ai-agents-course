# Python → AI-агенты

Онлайн-тренажёр для двух самостоятельных учеников: расширяемая программа Python и AI-агентов, светлая и тёмная темы, тесты с проходным баллом 70% и реальный Python прямо в браузере через Pyodide.

Актуальные первоисточники и добавленные темы зафиксированы в [sources.md](sources.md).

Первый блок — Python для новичка: 14 тем с короткой теорией, тестом и минимум тремя небольшими упражнениями на тему. Второй блок знакомит с LLM API, циклом агента, ReAct, Reflection, function calling, памятью, инструментами, MCP и упаковкой проекта.

## Локальный запуск

Сайт статический — достаточно любого HTTP-сервера:

```sh
python3 -m http.server 4000 --bind 127.0.0.1
```

Откройте `http://127.0.0.1:4000`. Для запуска кода нужен интернет: Pyodide загружается с `cdn.jsdelivr.net` при первом использовании тренажёра.

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub и отправьте в него содержимое этой папки.
2. В репозитории откройте **Settings → Pages**.
3. В разделе **Build and deployment** выберите **Deploy from a branch**, ветку `main` и папку `/(root)`.
4. Сохраните настройки. Через несколько минут сайт будет доступен по ссылке из этого раздела.

Никакой сборки не требуется: GitHub Pages отдаёт `index.html`, `styles.css`, `app.js` и `assets/course-data.js` как обычные статические файлы.

## Деплой на Vercel

### Через интерфейс

Импортируйте GitHub-репозиторий в [Vercel](https://vercel.com/new). Framework Preset оставьте `Other`, Build Command и Output Directory оставьте пустыми, затем нажмите **Deploy**.

### Через CLI

```sh
npx vercel --prod
```

Выберите текущую папку и оставьте настройки по умолчанию. Сборка не нужна.

## Прогресс и два пользователя

Прогресс хранится только в `localStorage` браузера под ключом `python-ai-agents-online-course-v2`. Поэтому у вас и друга будут независимые результаты на своих устройствах и в своих профилях браузера. Регистрация и сервер не нужны.

Чтобы перенести прогресс на другое устройство:

1. На исходном устройстве откройте DevTools → Console и выполните:

   ```js
   copy(localStorage.getItem('python-ai-agents-online-course-v2'))
   ```

2. На новом устройстве откройте курс, затем в Console вставьте сохранённый JSON:

   ```js
   localStorage.setItem('python-ai-agents-online-course-v2', 'PASTE_JSON'); location.reload()
   ```

Не публикуйте этот текст: он содержит историю вашего прогресса. Кнопка «Сбросить прогресс» очищает данные только в текущем браузере.

## Проверка

```sh
npm test
node --check app.js
node --check assets/course-data.js
```

## Источники контента

Материал адаптирован для коротких уроков с опорой на официальные и профильные источники:

- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [A practical guide to building agents — OpenAI](https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/)
- [Gemini API: function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [Model Context Protocol: introduction](https://modelcontextprotocol.io/docs/getting-started/intro)
- [LangGraph Quickstart](https://langchain-ai.github.io/langgraph/tutorials/introduction/)
- [CrewAI Introduction](https://docs.crewai.com/en/introduction/)
- [Pydantic AI overview](https://ai.pydantic.dev/)

API-ключи в тренажёр не добавляются: уроки показывают безопасные локальные примеры и не выполняют настоящих запросов к LLM-провайдерам.
