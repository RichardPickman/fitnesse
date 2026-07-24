# Fitnesse — Tickets

## Dependency Graph

```
001 ── Setup Expo project
 │
 ├── 002 ── Supabase exercise library        003 ── Local SQLite
 │        (server schema + seed)                   │
 │          │                                      │
 │          └── 009 ── Exercise sync/cache         │
 │                     │                           │
 └── 004 ── Navigation shell + theme              │
                │                                  │
          ┌─────┼──────────────────────────────────┘
          │     │                                  │
     005 Home   006 Plans list             012 History tab
          │        │
          │        └── 007 Plan create/edit
          │                    │
          │                    └── 008 Body map SVG
          │
          └── 010 Workout Player
                     │
                     └── 011 End of workout
                                       
013 Settings (independent, depends only on 004)
```

## Build Order (recommended)

| Order | Ticket | Blockers | Est. |
|-------|--------|----------|------|
| 1 | 001 – Expo Scaffold | none | small |
| 2 | 002 – Supabase | 001 | small |
| 3 | 003 – Local DB | 001 | medium |
| 4 | 004 – Nav Shell + Theme | 001 | small |
| 5 | 009 – Exercise Sync | 002, 003 | medium |
| 6 | 005 – Home Tab | 003, 004 | medium |
| 7 | 008 – Body Map SVG | 007 | medium |
| 8 | 006 – Plans List + Detail | 003, 004 | medium |
| 9 | 007 – Plan Create/Edit | 002, 003, 004 | large |
| 10 | 010 – Workout Player | 003, 005, 009 | large |
| 11 | 011 – End of Workout | 010 | small |
| 12 | 012 – History Tab | 003, 004 | medium |
| 13 | 013 – Settings | 004 | small |

**Total: 13 tickets**
