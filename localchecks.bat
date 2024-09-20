@echo off
echo Running Linter...
call npm run lint

echo Running Formatter...
call npm run format

echo Running Unit Tests...
call npm run test

echo All tasks completed! Please check if there are any errors above.
pause
