@echo off
:loop
"C:\Users\user\AppData\Local\Programs\Python\Python312\python.exe" "C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01\tmi_supervisor.py" >> "C:\Users\user\ClaudeWork\thinking-game-response-dynamics-v01\research\training-method-interaction-v01\AUTORUN_SUPERVISOR_WRAPPER.log" 2>&1
timeout /t 15 /nobreak >nul
goto loop
