@echo off
cd /d "%~dp0"
echo Open http://localhost:4000 in your browser. Stop with Ctrl+C.
python -m http.server 4000 --bind 127.0.0.1
