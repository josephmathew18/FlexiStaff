@echo off
set "MAVEN_BIN=%~dp0maven\apache-maven-3.9.6\bin\mvn.cmd"
if exist "%MAVEN_BIN%" (
    call "%MAVEN_BIN%" %*
) else (
    echo Maven binary not found in %~dp0maven.
    exit /b 1
)
