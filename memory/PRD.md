# MealRandom — Product Requirements

## Goal
A mobile app that randomly suggests meals while tracking the user's daily calorie budget. Supports two purposes: **Random** (just give me ideas) and **Diet** (subtract 400 kcal and only suggest low-fat, high-nutrition meals).

## Personas
1. **End user** — wants quick meal ideas with calorie accountability.
2. **Owner (single seeded admin)** — curates the meal catalog.

## Core flows
- Email/password auth (JWT, 7d TTL). Admin seeded as `natitasinsuwan@gmail.com / 097987696` idempotently.
- Onboarding collects: sex, birthday (→ age), weight (kg), height (cm), exercise per week (0–7), dietary preferences, allergies, purpose (random/diet).
- Daily calorie target = **Mifflin–St Jeor BMR × activity factor**; Diet mode subtracts 400 kcal.
- **Today log** auto-resets at midnight (queries by `date.today().isoformat()`).
- Random meal endpoint filters by: dietary preferences (vegetarian/vegan/halal/kosher must match tags; gluten-free/dairy-free/nut-free exclude matching allergens), explicit allergies, low_fat (diet mode), and selected keyword chips.
- Owner-only meal CRUD + Spoonacular import (live key configured).

## Keyword groups (4)
- **Countries** (16): thai, japanese, chinese, korean, indian, vietnamese, laos, lebanon, mexican, italian, french, spanish, american, nordic, german, british
- **Cooking Methods** (8): fry, boil, grill, bake, steam, stir-fry, stew, smoke
- **Carbs** (5): noodles, rice, bread, pasta, low-carbs
- **Protein** (7): chicken, egg, pork, beef, fish, seafood, tofu

## Seed catalog
38 meals, including 15 Thai dishes (Pad Thai, Tom Yum Goong, Green Curry, Som Tum, Massaman, Khao Pad, Pad Krapow, Tom Kha Gai, Pad See Ew, Khao Soi, Larb Gai, Steamed Thai Fish, Mango Sticky Rice, Gai Yang, Pad Pak Ruam) plus Japanese / Chinese / Korean / Indian / Vietnamese / Lao / Lebanese / Mexican / Italian / French / Spanish / American / Nordic / German / British dishes. Real Unsplash food photos.

## Architecture
- **Backend**: FastAPI + Motor + MongoDB. JWT (PyJWT) + bcrypt. All routes under `/api`. UUID `id` field (no `_id` returned).
- **Frontend**: Expo SDK 54 + expo-router, react-native-keyboard-controller, react-native-safe-area-context. Token in expo-secure-store via `@/src/utils/storage`.
- **External**: Spoonacular `/recipes/complexSearch` (admin import only).

## Screens
- `/(auth)/login`, `/(auth)/register`
- `/onboarding` (5 steps: purpose → body → exercise → diet → allergies)
- `/(tabs)/index` — Today: target, consumed, remaining, today's meals, big Randomize CTA
- `/(tabs)/random` — keyword chip rows (horizontal-scrollable) + result card with image, macros, "Add to Today"
- `/(tabs)/profile` — body stats, prefs, allergies, purpose toggle, sign out
- `/(tabs)/admin` — visible to owner only; search + CRUD + Import Thai
- `/meal-editor` — create/edit one meal

## Status
- ✅ MVP complete, end-to-end tested (20/20 backend pytest cases; UI flows verified)
- ✅ Spoonacular live integration verified (HTTP 200)
- ✅ Admin idempotent seed, 38 meals seeded on startup
