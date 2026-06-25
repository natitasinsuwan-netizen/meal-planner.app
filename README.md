MealRandom 🍽️
A premium, mobile-first meal planner and randomizer application built to simplify healthy eating. MealRandom suggests meals based on personalized cravings and filters while tracking the user's daily calorie budget.

The application supports two main modes:

Random Mode: Suggests customized meal ideas based on keyword tags and general profiles.
Diet Mode: Restricts recommendations to low-fat, high-nutrition options, and automatically subtracts 400 kcal from the user's daily energy expenditure to aid weight management.
MealRandom is structured as a monorepo consisting of a FastAPI + MongoDB backend and an Expo SDK 54 (React Native) frontend.

🚀 Key Features
Secure Authentication: Email & password authentication using JSON Web Tokens (JWT) with a 7-day Time-To-Live (TTL). Features an idempotently seeded administrator account for catalog curation.
Tactile 5-Step Onboarding: A low-friction onboarding flow collecting core user stats:
Purpose (Random vs. Diet)
Body Metrics (Sex, Weight, Height, Birthday for Age tracking)
Weekly Exercise Frequency
Dietary Preferences (Vegetarian, Vegan, Gluten-Free, Halal, etc.)
Allergies (Nuts, Dairy, Gluten, Shellfish, Soy, etc.)
Dynamic Calorie Budgeting: Calculations are powered by the Mifflin–St Jeor Equation multiplied by activity factors derived from exercise frequency.
Today's Log: Shows a visual calorie tracker (Bento style) representing Energy Need, Consumed Today, and Remaining. Auto-resets at midnight.
Craving Builder (Keyword Filtering): Restricts random suggestions using horizontal-scrolling chip groups categorized by:
Countries (e.g., Thai, Japanese, Italian, Mexican)
Cooking Methods (e.g., Grill, Bake, Steam, Stir-fry)
Carbohydrates (e.g., Noodles, Rice, Pasta, Low-carbs)
Proteins (e.g., Chicken, Pork, Seafood, Tofu)
Admin Dashboard: Exclusive access for the administrator to create, read, update, and delete (CRUD) catalog meals, or dynamically import recipes using the Spoonacular API integration.
🛠️ Tech Stack & Architecture
Backend
FastAPI: High-performance Python web framework for building APIs.
MongoDB & Motor: Non-blocking asynchronous MongoDB driver.
PyJWT & Bcrypt: Secure password hashing and token-based state authorization.
Pytest: Integration and unit tests.
Frontend
Expo SDK 54 & React Native: High-fidelity native mobile apps (iOS & Android) with responsive Web support.
Expo Router: File-based navigation.
Expo Secure Store: Secure encrypted token storage.
Expo Haptics: Native tactile feedback for key button interactions.
📂 Project Structure
text

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
⚙️ Setup & Installation
Backend Setup
Navigate to the Backend Directory:

bash

cd backend
Set Up a Virtual Environment & Install Dependencies:

bash

python -m venv venv
# On Windows (cmd):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
Configure Environment Variables: Create a .env file inside the backend/ directory:

env

MONGO_URL=mongodb://localhost:27017
DB_NAME=mealrandom
JWT_SECRET_KEY=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ADMIN_EMAIL=natitasinsuwan@gmail.com
ADMIN_PASSWORD=097987696
SPOONACULAR_API_KEY=your_spoonacular_key_here
Run the Seeder Script: Populate your MongoDB database with the 38 pre-configured startup meals (including 15 authentic Thai dishes with high-quality Unsplash image assets):

bash

python seed_meals.py
Start the API Server:

bash

uvicorn server:app --reload
The API will be available at http://127.0.0.1:8000.

Run Backend Tests: Ensure EXPO_PUBLIC_BACKEND_URL is set in your environment pointing to the server:

bash

pytest
Frontend Setup
Navigate to the Frontend Directory:

bash

cd frontend
Install Node Packages:

bash

yarn install
# Or using NPM:
npm install
Configure Environment Variables: Create a .env file in the frontend/ directory (or use your host's environment):

env

EXPO_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
Start the Expo Development Server:

bash

npx expo start
In the CLI terminal, press:

w to launch on the Web.
a to run on an Android emulator (requires Android Studio).
i to run on an iOS simulator (requires macOS & Xcode).
Scan the QR code with the Expo Go app on your physical mobile device to run it directly.
🎨 Design & Theme Guidelines
MealRandom is built around a warm, organic, and encouraging aesthetic. Key styling elements outlined in design_guidelines.json include:

Archetype & Tone: Organic & earthy. Focuses on warmth and minimizing cognitive load.
Palette:
Primary: #F4A024 (Warm orange) - Random meal and primary CTA actions.
Secondary/Success: #2EAF4F (Green) - Diet mode highlight, remaining calorie count, and successful operations.
App Background: #E5DDA5 (Soft warm olive/yellow).
Base Surface: #FFFFFF (White) card elements.
Typography: Clean modern type scaling using Outfit for headings and Manrope for body texts (avoiding typical Inter/SaaS layouts).
Borders & Layouts: Rounded corners using rounded-3xl for bento widgets/cards and rounded-full for chips/buttons. No sharp shapes. Includes soft, diffuse ambient shadows.
Tactile Interactions: Scale-down micro-animations on taps (active:scale-95).
🧪 Testing Protocol
The codebase maintains high-quality compliance. A specialized test log mapping is tracked inside test_result.md. All UI components must use distinct data-testid properties (e.g. testID in React Native components) for high automation visibility.

Run the 20+ automated API endpoint tests using:
bash

pytest backend/tests/test_mealrandom_api.py
