// Application State & User Storage
let isLoggedIn = localStorage.getItem('mp_is_logged_in') === 'true';
let hasCompletedProfile = localStorage.getItem('mp_has_profile') === 'true';
let mode = localStorage.getItem('mp_app_mode') || null; // 'random' or 'diet'
let activeTab = 'home'; // 'home' or 'profile'
let currentUserEmail = localStorage.getItem('mp_user_email') || '';

const ADMIN_EMAIL = "natitasinsuwan@gmail.com";

function isAdmin() {
  return currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

let profile = JSON.parse(localStorage.getItem('mp_user_profile') || JSON.stringify({
  weight: 45,
  height: 160,
  birthday: '2010-05-15',
  sex: 'female',
  exercise: 0,
  allergies: [],
  religious: [],
  ethical: []
}));

let selectedKeywords = new Set();
let todayMeals = [];

// Load stored custom meals into INITIAL_MEALS
const customMeals = JSON.parse(localStorage.getItem('mp_custom_meals') || '[]');
if (customMeals.length > 0) {
  INITIAL_MEALS = [...INITIAL_MEALS, ...customMeals];
}

// Helper: Get Today's Date String (YYYY-MM-DD)
function getTodayDateString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Automatic Daily Reset Check
function checkAndResetNewDay() {
  const lastDate = localStorage.getItem('mp_last_date');
  const todayStr = getTodayDateString();

  if (lastDate !== todayStr) {
    todayMeals = [];
    localStorage.setItem('mp_today_meals', JSON.stringify([]));
    localStorage.setItem('mp_last_date', todayStr);
  } else {
    todayMeals = JSON.parse(localStorage.getItem('mp_today_meals') || '[]');
  }
}

// EXACT REQUESTED KEYWORD CATEGORIES
const CATEGORIZED_KEYWORDS = {
  "Country": ["Thai", "Japanese", "Chinese", "Indian", "Vietnamese", "Laos", "Lebanon", "Mexican", "Italian", "French", "Spanish", "American", "British", "German"],
  "Cooking Methods": ["Fry", "Boil", "Grill", "Bake", "Steam", "Stir-Fry", "Stew", "Smoke"],
  "Carbs": ["Noodles", "Rice", "Bread", "Pasta", "Low-Carb"],
  "Protein": ["Chicken", "Egg", "Pork", "Beef", "Fish", "Seafood", "Tofu"]
};

// Dietary Restriction Options
const DIETARY_OPTIONS = {
  allergies: ["Peanut", "Tree Nuts", "Dairy / Lactose", "Gluten", "Shellfish", "Egg", "Soy", "Fish", "Sesame"],
  religious: ["Halal", "Kosher", "Buddhist Vegetarian", "Hindu Vegetarian"],
  ethical: ["Vegan", "Vegetarian", "Pescatarian", "Keto / Low-Carb", "Paleo", "Dairy-Free"]
};

// Calculate Age dynamically from Birthday
function getAgeFromBirthday(birthdayStr) {
  if (!birthdayStr) return 14;
  const birthDate = new Date(birthdayStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(1, age);
}

// Calculate TDEE
function calculateTDEE() {
  const age = getAgeFromBirthday(profile.birthday);
  const weight = parseFloat(profile.weight) || 45;
  const height = parseFloat(profile.height) || 160;
  const sex = profile.sex || 'female';
  const exercise = parseInt(profile.exercise) || 0;

  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = sex === 'male' ? bmr + 5 : bmr - 161;

  const activityFactors = { 0: 1.2, 2: 1.375, 4: 1.55, 6: 1.725 };
  const factor = activityFactors[exercise] || 1.2;
  return Math.round(bmr * factor);
}

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  checkAndResetNewDay();
  setupEventListeners();
  setupBottomNav();
  setupAdminModal();
  renderCategorizedKeywords();
  renderProfileRestrictionChips();

  // FLOW LOGIC:
  if (!isLoggedIn) {
    showScreen('screenLogin');
  } else if (!hasCompletedProfile) {
    showScreen('screenProfileForm');
  } else if (!mode) {
    showScreen('screenPurpose');
  } else {
    renderDashboard();
    showScreen('screenDashboard');
  }
});

function setupBottomNav() {
  const tabHome = document.getElementById('tabNavHome');
  const tabProfile = document.getElementById('tabNavProfile');

  if (tabHome) {
    tabHome.addEventListener('click', () => {
      activeTab = 'home';
      tabHome.classList.add('active');
      tabProfile.classList.remove('active');
      renderDashboard();
      showScreen('screenDashboard');
    });
  }

  if (tabProfile) {
    tabProfile.addEventListener('click', () => {
      activeTab = 'profile';
      tabProfile.classList.add('active');
      tabHome.classList.remove('active');
      document.getElementById('inputWeight').value = profile.weight;
      document.getElementById('inputHeight').value = profile.height;
      document.getElementById('inputBirthday').value = profile.birthday;
      document.getElementById('selectSex').value = profile.sex;
      document.getElementById('selectExercise').value = profile.exercise;
      renderProfileRestrictionChips();
      showScreen('screenProfileForm');
    });
  }
}

function setupEventListeners() {
  // Screen 1: Login Submit
  document.getElementById('formLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    currentUserEmail = document.getElementById('loginEmail').value.trim() || 'user@example.com';
    isLoggedIn = true;
    localStorage.setItem('mp_is_logged_in', 'true');
    localStorage.setItem('mp_user_email', currentUserEmail);

    if (!hasCompletedProfile) {
      showScreen('screenProfileForm');
    } else if (!mode) {
      showScreen('screenPurpose');
    } else {
      renderDashboard();
      showScreen('screenDashboard');
    }
  });

  // Create Account Link
  document.getElementById('btnCreateAccount').addEventListener('click', (e) => {
    e.preventDefault();
    currentUserEmail = 'natitasinsuwan@gmail.com'; // Default shortcut for user testing
    isLoggedIn = true;
    localStorage.setItem('mp_is_logged_in', 'true');
    localStorage.setItem('mp_user_email', currentUserEmail);
    showScreen('screenProfileForm');
  });

  // Screen 2: Profile Form Submit
  document.getElementById('formProfileInputs').addEventListener('submit', (e) => {
    e.preventDefault();
    profile.weight = parseFloat(document.getElementById('inputWeight').value) || 45;
    profile.height = parseFloat(document.getElementById('inputHeight').value) || 160;
    profile.birthday = document.getElementById('inputBirthday').value || '2010-05-15';
    profile.sex = document.getElementById('selectSex').value;
    profile.exercise = parseInt(document.getElementById('selectExercise').value) || 0;

    hasCompletedProfile = true;
    localStorage.setItem('mp_has_profile', 'true');
    localStorage.setItem('mp_user_profile', JSON.stringify(profile));

    if (!mode) {
      showScreen('screenPurpose');
    } else {
      activeTab = 'home';
      document.getElementById('tabNavHome').classList.add('active');
      document.getElementById('tabNavProfile').classList.remove('active');
      renderDashboard();
      showScreen('screenDashboard');
    }
  });

  // Sign Out from Profile
  const btnSignOut = document.getElementById('btnSignOutProfile');
  if (btnSignOut) {
    btnSignOut.addEventListener('click', () => {
      isLoggedIn = false;
      localStorage.setItem('mp_is_logged_in', 'false');
      showScreen('screenLogin');
    });
  }

  // Screen 3: Purpose Options
  document.getElementById('btnChooseRandom').addEventListener('click', (e) => {
    e.preventDefault();
    mode = 'random';
    localStorage.setItem('mp_app_mode', 'random');
    renderDashboard();
    showScreen('screenDashboard');
  });

  document.getElementById('btnChooseDiet').addEventListener('click', (e) => {
    e.preventDefault();
    mode = 'diet';
    localStorage.setItem('mp_app_mode', 'diet');
    renderDashboard();
    showScreen('screenDashboard');
  });

  // Dashboard: Edit Profile Button
  document.getElementById('btnEditProfile').addEventListener('click', () => {
    activeTab = 'profile';
    document.getElementById('tabNavProfile').classList.add('active');
    document.getElementById('tabNavHome').classList.remove('active');
    document.getElementById('inputWeight').value = profile.weight;
    document.getElementById('inputHeight').value = profile.height;
    document.getElementById('inputBirthday').value = profile.birthday;
    document.getElementById('selectSex').value = profile.sex;
    document.getElementById('selectExercise').value = profile.exercise;
    renderProfileRestrictionChips();
    showScreen('screenProfileForm');
  });

  // Clear Keywords Selection
  document.getElementById('btnClearKeywords').addEventListener('click', () => {
    selectedKeywords.clear();
    renderCategorizedKeywords();
  });

  // Manual "Start New Day" Reset Button
  const btnStartNewDay = document.getElementById('btnStartNewDay');
  if (btnStartNewDay) {
    btnStartNewDay.addEventListener('click', () => {
      if (confirm("Start a new day? This will reset all your logged meals and consumed calories for today.")) {
        todayMeals = [];
        localStorage.setItem('mp_today_meals', JSON.stringify([]));
        localStorage.setItem('mp_last_date', getTodayDateString());
        renderDashboard();
      }
    });
  }

  // Random Meal Roll Button
  document.getElementById('btnRandomMeal').addEventListener('click', rollRandomMeal);
}

// ADMIN MODAL & MANAGEMENT LOGIC
function setupAdminModal() {
  const modal = document.getElementById('modalAdminMenu');
  const btnOpen = document.getElementById('btnOpenAdminModal');
  const btnClose = document.getElementById('btnCloseAdminModal');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      renderAdminMealsList();
      modal.style.display = 'flex';
    });
  }

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  const formAddMeal = document.getElementById('formAddMeal');
  if (formAddMeal) {
    formAddMeal.addEventListener('submit', (e) => {
      e.preventDefault();
      const newMeal = {
        name: document.getElementById('adminMealName').value.trim(),
        description: document.getElementById('adminMealDesc').value.trim(),
        calories: parseInt(document.getElementById('adminMealCal').value) || 450,
        image_url: document.getElementById('adminMealImg').value.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        keywords: {
          countries: [document.getElementById('adminMealCountry').value],
          cooking_methods: [document.getElementById('adminMealMethod').value],
          carbs: [document.getElementById('adminMealCarbs').value],
          protein: [document.getElementById('adminMealProtein').value]
        }
      };

      INITIAL_MEALS.push(newMeal);
      
      const storedCustom = JSON.parse(localStorage.getItem('mp_custom_meals') || '[]');
      storedCustom.push(newMeal);
      localStorage.setItem('mp_custom_meals', JSON.stringify(storedCustom));

      alert(`Success! "${newMeal.name}" has been added to the database menu.`);
      formAddMeal.reset();
      renderAdminMealsList();
    });
  }
}

function renderAdminMealsList() {
  const container = document.getElementById('adminMealsList');
  const countEl = document.getElementById('adminMealCount');

  if (!container) return;
  countEl.textContent = INITIAL_MEALS.length;
  container.innerHTML = '';

  INITIAL_MEALS.forEach((meal, idx) => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px; background:#F9FAFB; border-radius:12px; border:1px solid #E5E7EB;';
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${meal.image_url}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;" />
        <div>
          <div style="font-weight:800; font-size:0.85rem;">${meal.name}</div>
          <div style="font-size:0.75rem; color:#6B7280;">🔥 ${meal.calories} kcal • ${meal.keywords.countries ? meal.keywords.countries.join(', ') : ''}</div>
        </div>
      </div>
      <button onclick="deleteMealFromAdmin(${idx})" style="background:#FEE2E2; border:none; color:#EF4444; border-radius:8px; padding:6px 10px; font-size:0.75rem; font-weight:800; cursor:pointer;">Delete</button>
    `;
    container.appendChild(item);
  });
}

function deleteMealFromAdmin(index) {
  if (confirm(`Delete "${INITIAL_MEALS[index].name}" from menu database?`)) {
    INITIAL_MEALS.splice(index, 1);
    localStorage.setItem('mp_custom_meals', JSON.stringify(INITIAL_MEALS));
    renderAdminMealsList();
  }
}

// Master Screen Controller
function showScreen(screenId) {
  const screens = ['screenLogin', 'screenProfileForm', 'screenPurpose', 'screenDashboard'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const bottomNav = document.getElementById('bottomNav');
  if (bottomNav) {
    if (screenId === 'screenDashboard' || screenId === 'screenProfileForm') {
      bottomNav.style.display = 'flex';
    } else {
      bottomNav.style.display = 'none';
    }
  }

  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render Profile Dietary Restrictions Chips
function renderProfileRestrictionChips() {
  const categories = [
    { key: 'allergies', id: 'profileAllergiesChips' },
    { key: 'religious', id: 'profileReligiousChips' },
    { key: 'ethical', id: 'profileEthicalChips' }
  ];

  categories.forEach(cat => {
    const container = document.getElementById(cat.id);
    if (!container) return;
    container.innerHTML = '';

    if (!profile[cat.key]) profile[cat.key] = [];

    DIETARY_OPTIONS[cat.key].forEach(opt => {
      const chip = document.createElement('div');
      chip.className = `restriction-chip ${profile[cat.key].includes(opt) ? 'active' : ''}`;
      chip.textContent = opt;
      chip.addEventListener('click', () => {
        const idx = profile[cat.key].indexOf(opt);
        if (idx > -1) {
          profile[cat.key].splice(idx, 1);
          chip.classList.remove('active');
        } else {
          profile[cat.key].push(opt);
          chip.classList.add('active');
        }
      });
      container.appendChild(chip);
    });
  });
}

// Render Categorized Keywords List (Country, Cooking Methods, Carbs, Protein)
function renderCategorizedKeywords() {
  const container = document.getElementById('categorizedKeywordsContainer');
  container.innerHTML = '';

  for (const [catName, tags] of Object.entries(CATEGORIZED_KEYWORDS)) {
    const header = document.createElement('div');
    header.className = 'keyword-category-header';
    header.textContent = catName;
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'chip-wrap-grid';

    tags.forEach(tag => {
      const chip = document.createElement('div');
      chip.className = `chip-btn ${selectedKeywords.has(tag) ? 'active' : ''}`;
      chip.textContent = tag;
      chip.setAttribute('data-testid', `chip-${tag.toLowerCase()}`);
      chip.addEventListener('click', () => {
        if (selectedKeywords.has(tag)) {
          selectedKeywords.delete(tag);
          chip.classList.remove('active');
        } else {
          selectedKeywords.add(tag);
          chip.classList.add('active');
        }
      });
      grid.appendChild(chip);
    });

    container.appendChild(grid);
  }
}

// Render Main Dashboard
function renderDashboard() {
  const calculatedAge = getAgeFromBirthday(profile.birthday);
  const tdee = calculateTDEE();
  const consumed = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const remaining = tdee - consumed;

  const sexFormatted = profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1);
  document.getElementById('dashSubtitle').textContent = `${sexFormatted}, ${calculatedAge} years, ${profile.weight}kg, ${profile.height}cm`;

  // Toggle Admin Badge
  const adminBadge = document.getElementById('adminHeaderBadge');
  if (adminBadge) {
    adminBadge.style.display = isAdmin() ? 'flex' : 'none';
  }

  const bentoContainer = document.getElementById('bentoContainer');
  const dashTitle = document.getElementById('dashTitle');

  if (mode === 'diet') {
    dashTitle.textContent = "Diet Planning";
    bentoContainer.style.display = 'block';
    document.getElementById('valNeed').textContent = tdee;
    document.getElementById('valConsumed').textContent = consumed;
    document.getElementById('valRemaining').textContent = remaining;
  } else {
    dashTitle.textContent = "Random Meal Generator";
    bentoContainer.style.display = 'none';
  }

  renderTodayMealsList();
}

// Roll Random Meal
function rollRandomMeal() {
  let pool = INITIAL_MEALS;

  if (selectedKeywords.size > 0) {
    const selectedArr = Array.from(selectedKeywords).map(k => k.toLowerCase());
    pool = pool.filter(meal => {
      const allMealTags = [
        ...(meal.keywords.countries || []),
        ...(meal.keywords.cooking_methods || []),
        ...(meal.keywords.carbs || []),
        ...(meal.keywords.protein || [])
      ].map(t => t.toLowerCase());

      return selectedArr.some(sel => allMealTags.includes(sel) || meal.name.toLowerCase().includes(sel) || meal.description.toLowerCase().includes(sel));
    });
  }

  if (pool.length === 0) pool = INITIAL_MEALS;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const box = document.getElementById('yourMealBox');
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
      <div>
        <div style="font-weight:900; font-size:1.25rem;">${picked.name}</div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin-top:2px;">${picked.description}</div>
      </div>
      <button id="btnRandomMeal" class="btn-purple" style="width:auto; padding:10px 18px; font-size:0.85rem; border-radius:14px;" data-testid="btn-re-randomize">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
        <span>Random Meal</span>
      </button>
    </div>

    <img src="${picked.image_url}" style="width:100%; height:180px; object-fit:cover; border-radius:16px; margin-bottom:14px;" alt="" />

    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:900; color:var(--orange-primary); font-size:1.1rem;">🔥 ${picked.calories} kcal</span>
      <button class="btn-purple" style="width:auto; padding:8px 18px; font-size:0.85rem;" onclick="addMealToToday('${picked.name}', ${picked.calories}, '${picked.image_url}')" data-testid="btn-add-today">➕ Add to Today</button>
    </div>
  `;

  document.getElementById('btnRandomMeal').addEventListener('click', rollRandomMeal);
}

function addMealToToday(name, calories, img) {
  todayMeals.push({
    id: Date.now(),
    name,
    calories,
    image_url: img,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  localStorage.setItem('mp_today_meals', JSON.stringify(todayMeals));
  renderDashboard();
}

function renderTodayMealsList() {
  const container = document.getElementById('todayMealsContainer');

  if (todayMeals.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 24px 0; color:#9CA3AF;">
        <div style="font-weight:600; font-size:0.95rem; color:#6B7280; margin-bottom:4px;">No meals added yet</div>
        <div style="font-size:0.85rem;">Add meals to track your daily intake</div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  todayMeals.forEach((meal, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #F3F4F6;';
    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <img src="${meal.image_url}" style="width:44px; height:44px; border-radius:12px; object-fit:cover;" />
        <div>
          <div style="font-weight:800; font-size:0.9rem;">${meal.name}</div>
          <div style="font-size:0.8rem; color:#6B7280;">${meal.time} • ${meal.calories} kcal</div>
        </div>
      </div>
      <button onclick="removeTodayMeal(${idx})" style="background:none; border:none; color:#EF4444; font-size:1rem; cursor:pointer; font-weight:800; padding:4px;">✕</button>
    `;
    container.appendChild(div);
  });
}

function removeTodayMeal(index) {
  todayMeals.splice(index, 1);
  localStorage.setItem('mp_today_meals', JSON.stringify(todayMeals));
  renderDashboard();
}
