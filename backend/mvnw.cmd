@echo off
setlocal
set "MAVEN_VERSION=3.9.16"
set "MAVEN_CMD="
for /f "delims=" %%F in ('dir /b /s "%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%*\mvn.cmd" 2^>nul') do set "MAVEN_CMD=%%F"
if not defined MAVEN_CMD goto :no_maven
set "JAVA_HOME="
for /d %%D in ("%USERPROFILE%\.jdks\ms-21*") do if exist "%%~fD\bin\java.exe" set "JAVA_HOME=%%~fD"
if not defined JAVA_HOME goto :no_java
set "PATH=%JAVA_HOME%\bin;%PATH%"
call "%MAVEN_CMD%" %*
exit /b %ERRORLEVEL%

:no_maven
echo [mvnw] Maven %MAVEN_VERSION% nao encontrado em %USERPROFILE%\.m2\wrapper\dists
exit /b 1

:no_java
echo [mvnw] JDK 21 nao encontrado em %USERPROFILE%\.jdks
exit /b 1
