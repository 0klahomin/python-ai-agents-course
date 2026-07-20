@echo off
setlocal
set "PROJECT_DIR=%~dp0"
set "PYODIDE_VERSION=0.27.7"
set "TARGET_DIR=%PROJECT_DIR%vendor\pyodide"
set "ARCHIVE=%TEMP%\pyodide-%PYODIDE_VERSION%.tar.bz2"

if exist "%TARGET_DIR%\pyodide.js" (
  echo Pyodide is already installed in vendor\pyodide.
  exit /b 0
)

if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"
echo Downloading Pyodide %PYODIDE_VERSION% one time. This is about 370 MB.
curl.exe --fail --location --progress-bar "https://github.com/pyodide/pyodide/releases/download/%PYODIDE_VERSION%/pyodide-%PYODIDE_VERSION%.tar.bz2" --output "%ARCHIVE%"
if errorlevel 1 exit /b 1
tar -xjf "%ARCHIVE%" -C "%TARGET_DIR%"
if errorlevel 1 exit /b 1
if exist "%TARGET_DIR%\pyodide\pyodide.js" (
  move "%TARGET_DIR%\pyodide\*" "%TARGET_DIR%\" >nul
  rmdir "%TARGET_DIR%\pyodide"
)
if not exist "%TARGET_DIR%\pyodide.js" (
  echo Pyodide archive did not extract as expected.
  exit /b 1
)
del "%ARCHIVE%"
echo Done. Pyodide is local in vendor\pyodide and no CDN is used at runtime.
