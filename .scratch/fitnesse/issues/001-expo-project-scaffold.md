# 001 — Expo Project Scaffold

**Blockers:** none

## Objective
Initialize the Expo (React Native + TypeScript) project with development tooling and Git flow set up.

## Acceptance
- [ ] `npx create-expo-app fitnesse --template blank-typescript` runs successfully
- [ ] App builds and runs on iOS Simulator and Android Emulator
- [ ] Folder structure established: `src/screens/`, `src/components/`, `src/stores/`, `src/db/`, `src/supabase/`, `src/utils/`
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] ESLint + Prettier configured
- [ ] `.env.example` created with `SUPABASE_URL` and `SUPABASE_ANON_KEY` placeholders
- [ ] `.gitignore` covers node_modules, .env, expo, build artifacts
- [ ] Initial commit to main branch

## Notes
- Use Expo managed workflow (not bare)
- EAS Build not needed yet — just Expo Go for dev
- Keep it lean: no extra packages beyond what create-expo adds
