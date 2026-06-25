# MealRandom 🍽️

A premium, mobile-first meal planner and randomizer application built to simplify healthy eating. MealRandom suggests meals based on personalized cravings and filters while tracking the user's daily calorie budget. 

The application supports two main modes:
- **Random Mode**: Suggests customized meal ideas based on keyword tags and general profiles.
- **Diet Mode**: Restricts recommendations to low-fat, high-nutrition options, and automatically subtracts **400 kcal** from the user's daily energy expenditure to aid weight management.

MealRandom is structured as a monorepo consisting of a **FastAPI + MongoDB** backend and an **Expo SDK 54 (React Native)** frontend.

---

## 🚀 Key Features

* **Secure Authentication**: Email & password authentication using JSON Web Tokens (JWT) with a 7-day Time-To-Live (TTL). Features an idempotently seeded administrator account for catalog curation.
* **Tactile 5-Step Onboarding**: A low-friction onboarding flow collecting core user stats:
  1. Purpose (Random vs. Diet)
  2. Body Metrics (Sex, Weight, Height, Birthday for Age tracking)
  3. Weekly Exercise Frequency
  4. Dietary Preferences (Vegetarian, Vegan, Gluten-Free, Halal, etc.)
  5. Allergies (Nuts, Dairy, Gluten, Shellfish, Soy, etc.)
* **Dynamic Calorie Budgeting**: Calculations are powered by the **Mifflin–St Jeor Equation** multiplied by activity factors derived from exercise frequency.
* **Today's Log**: Shows a visual calorie tracker (Bento style) representing **Energy Need**, **Consumed Today**, and **Remaining**. Auto-resets at midnight.
* **Craving Builder (Keyword Filtering)**: Restricts random suggestions using horizontal-scrolling chip groups categorized by:
  * **Countries** (e.g., Thai, Japanese, Italian, Mexican)
  * **Cooking Methods** (e.g., Grill, Bake, Steam, Stir-fry)
  * **Carbohydrates** (e.g., Noodles, Rice, Pasta, Low-carbs)
  * **Proteins** (e.g., Chicken, Pork, Seafood, Tofu)
* **Admin Dashboard**: Exclusive access for the administrator to create, read, update, and delete (CRUD) catalog meals, or dynamically import recipes using the **Spoonacular API** integration.

---

## 🛠️ Tech Stack & Architecture

### Backend
* **FastAPI**: High-performance Python web framework for building APIs.
* **MongoDB & Motor**: Non-blocking asynchronous MongoDB driver.
* **PyJWT & Bcrypt**: Secure password hashing and token-based state authorization.
* **Pytest**: Integration and unit tests.

### Frontend
* **Expo SDK 54 & React Native**: High-fidelity native mobile apps (iOS & Android) with responsive Web support.
* **Expo Router**: File-based navigation.
* **Expo Secure Store**: Secure encrypted token storage.
* **Expo Haptics**: Native tactile feedback for key button interactions.

---

## 📂 Project Structure

```text
├── backend/                  # FastAPI Application
│   ├── tests/                # Pytest api integration tests
│   ├── seed_meals.py         # Catalog database seeder (38 starter meals)
│   ├── server.py             # Main API Router & endpoints
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Expo React Native client
│   ├── app/                  # File-based routes (Expo Router)
│   │   ├── (auth)/           # Login and Registration pages
│   │   ├── (tabs)/           # Dashboard, Randomizer, Profile, Admin
│   │   └── onboarding.tsx    # Onboarding questionnaires
│   ├── src/                  # Core application source
│   │   ├── components/       # Custom Buttons, Chips, Toasts
│   │   ├── context/          # Authentication states
│   │   ├── lib/              # Theme configuration and API wrappers
│   │   └── utils/            # Storage abstractions
│   ├── package.json          # Node dependencies & expo scripts
│   └── tsconfig.json         # TypeScript configuration
├── memory/                   # Internal documents (Product Requirements - PRD.md)
├── design_guidelines.json    # UX specifications, fonts, and design tokens
└── test_result.md            # Testing logs and protocols
