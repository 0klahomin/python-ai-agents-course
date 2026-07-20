@echo off
cd /d "%~dp0"
echo Open http://localhost:8000 in your browser. Stop with Ctrl+C.
python -m http.server 8000
