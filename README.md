## Timesheet Auto Timer Agent

This project is a lightweight browser automation agent built with **Playwright + TypeScript**.

The agent connects to an active Chrome browser session and continuously monitors a timesheet application. When the timer stops, it automatically:

1. Detects the stopped state via DOM inspection
2. Selects the required task checkbox
3. Restarts the timer

The automation runs as a background agent and reacts instantly to timer state changes.