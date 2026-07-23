@echo off
echo ========================================
echo   BUILD SCRIPT - KKPHIM Deploy (Hardened)
echo ========================================

echo.
echo [1/6] Minifying app.js with Terser ...
call npx -y terser app.js -o app.min.js --compress drop_debugger=true,passes=2 --mangle --toplevel --comments false
if errorlevel 1 (echo ERROR: JS minification failed! & exit /b 1)
echo      Done!

echo.
echo [2/6] Minifying the local icon subset ...
call npx -y terser assets/icons.js -o assets/icons.min.js --compress passes=2 --mangle --comments /^!/
if errorlevel 1 (echo ERROR: Icon minification failed! & exit /b 1)
echo      Done!

echo.
echo [3/6] Minifying style.css ...
call npx -y csso-cli style.css -o style.min.css
if errorlevel 1 (echo ERROR: CSS minification failed! & exit /b 1)
echo      Done!

echo.
echo [4/6] Building versioned service worker ...
call node build-service-worker.js
if errorlevel 1 (echo ERROR: Service worker build failed! & exit /b 1)
echo      Done!

echo.
echo [5/6] Minifying HTML pages ...
call npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --minify-css true --minify-js true -o index.min.html index.html
if errorlevel 1 (echo ERROR: index.html minification failed! & exit /b 1)
call npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --minify-css true --minify-js true -o danh-sach.min.html danh-sach.html
if errorlevel 1 (echo ERROR: danh-sach.html minification failed! & exit /b 1)
call npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --minify-css true --minify-js true -o phim.min.html phim.html
if errorlevel 1 (echo ERROR: phim.html minification failed! & exit /b 1)
call npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --minify-css true --minify-js true -o xem-phim.min.html xem-phim.html
if errorlevel 1 (echo ERROR: xem-phim.html minification failed! & exit /b 1)
call npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --minify-css true --minify-js true -o tu-phim.min.html tu-phim.html
if errorlevel 1 (echo ERROR: tu-phim.html minification failed! & exit /b 1)
call npx -y html-minifier-terser --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --minify-css true --minify-js true -o security-locked.min.html security-locked.html
if errorlevel 1 (echo ERROR: security-locked.html minification failed! & exit /b 1)
echo      Done!

echo.
echo [6/6] Fixing file references ...
call node fix-refs.js
if errorlevel 1 (echo ERROR: Reference fix failed! & exit /b 1)
echo      Done!

echo.
echo ========================================
echo   BUILD COMPLETE! Website updated.
echo ========================================
