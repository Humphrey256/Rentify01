@echo off
echo Setting up frontend build directories...

rem Create build directory if it doesn't exist
if not exist build mkdir build

rem Create build\static directory if it doesn't exist  
if not exist build\static mkdir build\static

rem Create build\dist directory if it doesn't exist
if not exist build\dist mkdir build\dist

echo Directory structure created:
dir build /s

echo.
echo Now run: npm run build:win
