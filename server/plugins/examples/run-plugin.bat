@echo off
setlocal

REM Check if OpenAI API key is provided
if "%~1"=="" (
    echo Error: OpenAI API key not provided
    echo Usage: run-plugin.bat YOUR_OPENAI_API_KEY
    echo Example: run-plugin.bat sk-...
    exit /b 1
)

REM Export the API key
set OPENAI_API_KEY=%1

REM Run the plugin
echo Running plugin with provided API key...
call npx ts-node run-plugin.ts

REM Clear the API key from environment
set OPENAI_API_KEY=

endlocal
