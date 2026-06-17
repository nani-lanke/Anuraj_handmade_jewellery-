@echo off
REM ============================================================
REM  AnuRaj Jewellery - Gallery Updater
REM  Double-click this file whenever you add, remove or change
REM  product images. It refreshes the website gallery for you.
REM ============================================================
echo.
echo   Updating AnuRaj Jewellery gallery...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-gallery.ps1"
echo.
pause
