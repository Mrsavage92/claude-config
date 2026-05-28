# OpenClaw Knowledge Bridge

Shared local memory at `C:\Users\Adam\Documents\OpenClaw-Knowledge`.

## Usage

Before project/status/task/handover work, read scoped context:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Adam\Documents\OpenClaw-Knowledge\tools\get-context.ps1" -Project "<project>"
```

For broad lookup:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Adam\Documents\OpenClaw-Knowledge\tools\get-context.ps1" -Query "<topic>"
```

To propose durable memory (do not dump raw chat):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\Users\Adam\Documents\OpenClaw-Knowledge\tools\propose-memory.ps1" -Project "<project>" -Type decision -Title "<title>" -Body "<sourced summary>"
```

Full contract: `C:\Users\Adam\Documents\OpenClaw-Knowledge\AGENTS.md`.
