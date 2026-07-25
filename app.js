// Application Flow & User State
let isLoggedIn = false;
let isOnboarded = localStorage.getItem('mp_onboarded') === 'true';
let activeTab = 'home';

let currentUser = JSON.parse(localStorage.getItem('mp_user') || JSON.stringify({
  email: '',
  isAdmin: false
}));

let profile = JSON.parse(localStorage.getItem('mp_user_profile') || JSON.stringify({
  sex: 'female',
  birthday: '2011-05-15',
  weight: 45,
  height: 157,
  exercise_week: 2,
  dietary: ['Vegetarian'],
  allergies: ['Nuts']
}));

let activeKeywords = {
  countries: [],
  cooking_methods: [],
  carbs: [],
  protein: []
};

let todayMeals = JSON.parse(localStorage.getItem('mp_today_meals') || '[]');
let editingMealId = null;

// Calculate Age dynamically from Birthday
function getAgeFromBirthday(birthdayStr) {
  if (!birthdayStr) return 15;
  const birthDate = new Date(birthdayStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(1, age);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  renderApp();

  // Step 1: Login Form
  document.getElementById('formLogin').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    
    const isAdmin = (email === 'natitasinsuwan@gmail.com' || email === 'natitasinsuwan@gmail.coom' || email.includes('admin'));
    
    currentUser = {
      email: email,
      isAdmin: isAdmin
    };
    
    localStorage.setItem('mp_user', JSON.stringify(currentUser));
    isLoggedIn = true;

    if (!isOnboarded) {
      renderApp('onboarding');
    } else {
      renderApp('home');
    }
  });

  // Create an Account Link
  document.getElementById('btnCreateAccount').addEventListener('click', (e) => {
    e.preventDefault();
    isLoggedIn = true;
    renderApp('onboarding');
  });

  // Step 2: Onboarding Form
  document.getElementById('formOnboarding').addEventListener('submit', (e) => {
    e.preventDefault();
    profile.sex = document.getElementById('onbSex').value;
    profile.birthday = document.getElementById('onbBirthday').value || '2011-05-15';
    profile.weight = parseFloat(document.getElementById('onbWeight').value) || 45;
    profile.height = parseFloat(document.getElementById('onbHeight').value) || 157;
    
    isOnboarded = true;
    localStorage.setItem('mp_onboarded', 'true');
    localStorage.setItem('mp_user_profile', JSON.stringify(profile));

    renderApp('home');
  });

  // Admin Add New Meal Form
  document.getElementById('formAdminAddMeal').addEventListener('submit', handleAddMeal);

  // Admin Edit Meal Form Modal
  document.getElementById('formAdminEditMeal').addEventListener('submit', handleSaveEditedMeal);
  document.getElementById('btnCloseEditModal').addEventListener('click', closeEditModal);

  // Profile Save Changes
  document.getElementById('btnSaveProfile').addEventListener('click', saveProfileChanges);

  // Sign Out
  document.getElementById('btnSignOut').addEventListener('click', () => {
    isLoggedIn = false;
    isOnboarded = false;
    localStorage.removeItem('mp_onboarded');
    localStorage.removeItem('mp_user');
    currentUser = { email: '', isAdmin: false };
    renderApp('login');
  });

  // Edit Profile Button
  document.getElementById('btnEditProfile').addEventListener('click', () => {
    switchTab('profile');
  });

  // Random Meal Button
  document.getElementById('btnRandomMeal').addEventListener('click', rollRandomMeal);

  renderKeywordsChips();
  renderProfileChips();
  renderOnboardingExerciseGrid();
});

// Calculate TDEE
function calculateTDEE() {
  const age = getAgeFromBirthday(profile.birthday);
  const { sex, weight, height, exercise_week } = profile;
  
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = sex === 'male' ? bmr + 5 : bmr - 161;

  const activityFactors = {
    0: 1.2, 1: 1.3, 2: 1.375, 3: 1.46, 4: 1.55, 5: 1.65, 6: 1.725, 7: 1.9
  };

  const factor = activityFactors[exercise_week] || 1.375;
  return Math.round(bmr * factor);
}

// Navigation Controls
function setupNavigation() {
  document.getElementById('navHome').addEventListener('click', () => switchTab('home'));
  document.getElementById('navAdmin').addEventListener('click', () => switchTab('admin'));
  document.getElementById('navProfile').addEventListener('click', () => switchTab('profile'));
}

function switchTab(tab) {
  activeTab = tab;
  renderApp(tab);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Master Screen Switcher
function renderApp(forceScreen = null) {
  const screenLogin = document.getElementById('screenLogin');
  const screenOnboarding = document.getElementById('screenOnboarding');
  const screenHome = document.getElementById('screenHome');
  const screenAdmin = document.getElementById('screenAdmin');
  const screenProfile = document.getElementById('screenProfile');
  const bottomNav = document.getElementById('bottomNav');
  const navAdminBtn = document.getElementById('navAdmin');

  [screenLogin, screenOnboarding, screenHome, screenAdmin, screenProfile].forEach(s => s.classList.remove('active'));

  if (!isLoggedIn || forceScreen === 'login') {
    screenLogin.classList.add('active');
    bottomNav.style.display = 'none';
    return;
  }

  if (forceScreen === 'onboarding' || (!isOnboarded && forceScreen !== 'home')) {
    document.getElementById('onbBirthday').value = profile.birthday || '2011-05-15';
    document.getElementById('onbWeight').value = profile.weight || 45;
    document.getElementById('onbHeight').value = profile.height || 157;
    screenOnboarding.classList.add('active');
    bottomNav.style.display = 'none';
    return;
  }

  bottomNav.style.display = 'flex';

  if (currentUser && currentUser.isAdmin) {
    navAdminBtn.style.display = 'flex';
  } else {
    navAdminBtn.style.display = 'none';
  }

  if (activeTab === 'admin' || forceScreen === 'admin') {
    screenAdmin.classList.add('active');
    document.getElementById('navAdmin').classList.add('active');
    document.getElementById('navHome').classList.remove('active');
    document.getElementById('navProfile').classList.remove('active');
    renderAdminView();
  } else if (activeTab === 'profile' || forceScreen === 'profile') {
    screenProfile.classList.add('active');
    document.getElementById('navProfile').classList.add('active');
    document.getElementById('navHome').classList.remove('active');
    document.getElementById('navAdmin').classList.remove('active');
    renderProfileView();
  } else {
    screenHome.classList.add('active');
    document.getElementById('navHome').classList.add('active');
    document.getElementById('navAdmin').classList.remove('active');
    document.getElementById('navProfile').classList.remove('active');
    renderHomeView();
  }
}

// Render Home View
function renderHomeView() {
  const calculatedAge = getAgeFromBirthday(profile.birthday);
  const tdee = calculateTDEE();
  const consumed = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const remaining = tdee - consumed;

  document.getElementById('userSubtitle').textContent = `${profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1)}, ${calculatedAge} years, ${profile.weight}kg, ${profile.height}cm`;

  const adminBadge = document.getElementById('adminRoleBadge');
  if (currentUser && currentUser.isAdmin) {
    adminBadge.style.display = 'block';
    adminBadge.textContent = `🛡️ Logged in as Admin (${currentUser.email})`;
  } else {
    adminBadge.style.display = 'none';
  }

  document.getElementById('valNeed').textContent = tdee;
  document.getElementById('valConsumed').textContent = consumed;
  document.getElementById('valRemaining').textContent = remaining;

  renderTodayMealsList();
}

// Keywords Chips
function renderKeywordsChips() {
  const categories = {
    countries: ["Thai", "Japanese", "Chinese", "Korean", "Indian", "Vietnamese", "Laos", "Lebanon", "Mexican", "Italian", "French", "Spanish", "American", "Nordic", "German", "British"],
    cooking_methods: ["Fry", "Boil", "Grill", "Bake", "Steam", "Stir-Fry", "Stew", "Smoke"],
    carbs: ["Noodles", "Rice", "Bread", "Pasta", "Low-Carbs"],
    protein: ["Chicken", "Egg", "Pork", "Beef", "Fish", "Seafood", "Tofu"]
  };

  const container = document.getElementById('keywordChipsContainer');
  container.innerHTML = '';

  for (const [cat, tags] of Object.entries(categories)) {
    const title = document.createElement('div');
    title.className = 'chip-group-title';
    title.textContent = cat.replace('_', ' ');
    container.appendChild(title);

    const flex = document.createElement('div');
    flex.className = 'chip-flex';

    tags.forEach(tag => {
      const lower = tag.toLowerCase();
      const chip = document.createElement('div');
      chip.className = `chip ${activeKeywords[cat].includes(lower) ? 'active' : ''}`;
      chip.textContent = tag;
      chip.addEventListener('click', () => {
        const idx = activeKeywords[cat].indexOf(lower);
        if (idx > -1) {
          activeKeywords[cat].splice(idx, 1);
          chip.classList.remove('active');
        } else {
          activeKeywords[cat].push(lower);
          chip.classList.add('active');
        }
      });
      flex.appendChild(chip);
    });

    container.appendChild(flex);
  }
}

// Roll Random Meal
function rollRandomMeal() {
  let pool = INITIAL_MEALS;

  const hasFilter = Object.values(activeKeywords).some(arr => arr.length > 0);
  if (hasFilter) {
    pool = pool.filter(meal => {
      for (const [cat, selected] of Object.entries(activeKeywords)) {
        if (selected.length > 0) {
          const mealTags = meal.keywords[cat] || [];
          const match = selected.some(s => mealTags.includes(s));
          if (!match) return false;
        }
      }
      return true;
    });
  }

  if (pool.length === 0) pool = INITIAL_MEALS;

  const picked = pool[Math.floor(Math.random() * pool.length)];

  const box = document.getElementById('yourMealBox');
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
      <div>
        <div style="font-weight:900; font-size:1.25rem;">${picked.name}</div>
        <div style="font-size:0.85rem; color:#6B7280; margin-top:2px;">${picked.description}</div>
      </div>
      <button id="btnRandomMeal" class="btn-orange" style="width:auto; padding:10px 18px; font-size:0.85rem;">🔀 Random Meal</button>
    </div>

    <img src="${picked.image_url}" style="width:100%; height:160px; object-fit:cover; border-radius:18px; margin-bottom:14px;" alt="" />

    <div style="display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:900; color:var(--orange-primary); font-size:1.1rem;">🔥 ${picked.calories} kcal</span>
      <button class="btn-orange" style="width:auto; padding:8px 16px; font-size:0.8rem;" onclick="addMealToToday('${picked.name}', ${picked.calories}, '${picked.image_url}')">➕ Add to Today</button>
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
  renderHomeView();
}

function renderTodayMealsList() {
  const container = document.getElementById('todayMealsContainer');

  if (todayMeals.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 20px 0; color:#888888;">
        <div style="font-weight:800; font-size:1.05rem; color:#111827; margin-bottom:4px;">No meals added yet</div>
        <div style="font-size:0.85rem;">Add meals to track your daily intake</div>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  todayMeals.forEach((meal, idx) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #F3F4F6;';
    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <img src="${meal.image_url}" style="width:40px; height:40px; border-radius:12px; object-fit:cover;" />
        <div>
          <div style="font-weight:800; font-size:0.9rem;">${meal.name}</div>
          <div style="font-size:0.75rem; color:#888888;">${meal.time} • ${meal.calories} kcal</div>
        </div>
      </div>
      <button onclick="removeTodayMeal(${idx})" style="background:transparent; border:none; color:#EF4444; font-size:0.9rem; cursor:pointer; font-weight:800;">✕</button>
    `;
    container.appendChild(div);
  });
}

function removeTodayMeal(index) {
  todayMeals.splice(index, 1);
  localStorage.setItem('mp_today_meals', JSON.stringify(todayMeals));
  renderHomeView();
}

// ADMIN MENU MANAGEMENT
function renderAdminView(query = '') {
  const container = document.getElementById('adminCatalogContainer');
  container.innerHTML = '';

  const searchInput = document.getElementById('adminSearchInput');
  if (searchInput) {
    searchInput.oninput = (e) => renderAdminView(e.target.value.toLowerCase());
  }

  const filtered = INITIAL_MEALS.filter(m => 
    m.name.toLowerCase().includes(query) || 
    m.description.toLowerCase().includes(query)
  );

  filtered.forEach(meal => {
    const card = document.createElement('div');
    card.className = 'white-card';
    card.style.padding = '16px';
    card.style.marginBottom = '14px';
    card.innerHTML = `
      <div style="display:flex; gap:12px; margin-bottom:12px;">
        <img src="${meal.image_url}" style="width:70px; height:70px; border-radius:14px; object-fit:cover;" />
        <div style="flex:1;">
          <div style="font-weight:900; font-size:1.05rem;">${meal.name}</div>
          <div style="font-size:0.8rem; color:#6B7280; margin-top:2px; height:36px; overflow:hidden;">${meal.description}</div>
          <div style="font-size:0.8rem; font-weight:800; color:var(--orange-primary); margin-top:4px;">🔥 ${meal.calories} kcal • 🥩 ${meal.protein_g}g Prot • 🍚 ${meal.carbs_g}g Carb</div>
        </div>
      </div>
      <div style="display:flex; gap:8px;">
        <button class="btn-orange" style="flex:1; padding:8px; font-size:0.8rem;" onclick="openEditMealModal('${meal.id}')">✏️ Edit Recipe</button>
        <button class="btn-white-pill" style="flex:1; padding:8px; font-size:0.8rem; color:#EF4444; border-color:#FEE2E2;" onclick="deleteMeal('${meal.id}')">🗑️ Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function handleAddMeal(e) {
  e.preventDefault();
  const name = document.getElementById('addMealName').value;
  const desc = document.getElementById('addMealDesc').value;
  const img = document.getElementById('addMealImg').value || 'https://images.unsplash.com/photo-1546069901-eacef0df6022?w=800&q=80';
  const cal = parseFloat(document.getElementById('addMealCal').value) || 400;
  const prot = parseFloat(document.getElementById('addMealProt').value) || 24;
  const fat = parseFloat(document.getElementById('addMealFat').value) || 12;
  const carb = parseFloat(document.getElementById('addMealCarb').value) || 45;

  const newMeal = {
    id: "m_" + Date.now(),
    name, description: desc, image_url: img,
    calories: cal, protein_g: prot, fat_g: fat, carbs_g: carb,
    keywords: { countries: ["thai"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: [], low_fat: fat <= 10
  };

  INITIAL_MEALS.unshift(newMeal);
  renderAdminView();
  document.getElementById('formAdminAddMeal').reset();
  alert('✨ New recipe added to menu catalog!');
}

function openEditMealModal(id) {
  const meal = INITIAL_MEALS.find(m => m.id === id);
  if (!meal) return;

  editingMealId = id;
  document.getElementById('editMealName').value = meal.name;
  document.getElementById('editMealDesc').value = meal.description;
  document.getElementById('editMealImg').value = meal.image_url;
  document.getElementById('editMealCal').value = meal.calories;
  document.getElementById('editMealProt').value = meal.protein_g;
  document.getElementById('editMealFat').value = meal.fat_g;
  document.getElementById('editMealCarb').value = meal.carbs_g;

  document.getElementById('modalEditMeal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('modalEditMeal').style.display = 'none';
}

function handleSaveEditedMeal(e) {
  e.preventDefault();
  const meal = INITIAL_MEALS.find(m => m.id === editingMealId);
  if (meal) {
    meal.name = document.getElementById('editMealName').value;
    meal.description = document.getElementById('editMealDesc').value;
    meal.image_url = document.getElementById('editMealImg').value;
    meal.calories = parseFloat(document.getElementById('editMealCal').value) || meal.calories;
    meal.protein_g = parseFloat(document.getElementById('editMealProt').value) || meal.protein_g;
    meal.fat_g = parseFloat(document.getElementById('editMealFat').value) || meal.fat_g;
    meal.carbs_g = parseFloat(document.getElementById('editMealCarb').value) || meal.carbs_g;

    renderAdminView();
    closeEditModal();
    alert('✅ Recipe updated successfully!');
  }
}

function deleteMeal(id) {
  if (confirm('Are you sure you want to delete this recipe from the catalog?')) {
    const idx = INITIAL_MEALS.findIndex(m => m.id === id);
    if (idx > -1) {
      INITIAL_MEALS.splice(idx, 1);
      renderAdminView();
    }
  }
}

// Onboarding Exercise Selector
function renderOnboardingExerciseGrid() {
  const grid = document.getElementById('onboardingExerciseGrid');
  grid.innerHTML = '';
  for (let i = 0; i <= 7; i++) {
    const btn = document.createElement('div');
    btn.className = `num-btn ${profile.exercise_week === i ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      profile.exercise_week = i;
      renderOnboardingExerciseGrid();
    });
    grid.appendChild(btn);
  }
}

// Profile View Render with Height & Weight Editing
function renderProfileView() {
  document.getElementById('profSex').value = profile.sex || 'female';
  document.getElementById('profBirthday').value = profile.birthday || '2011-05-15';
  document.getElementById('profWeight').value = profile.weight || 45;
  document.getElementById('profHeight').value = profile.height || 157;

  const grid = document.getElementById('exerciseNumGrid');
  grid.innerHTML = '';
  for (let i = 0; i <= 7; i++) {
    const btn = document.createElement('div');
    btn.className = `num-btn ${profile.exercise_week === i ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => {
      profile.exercise_week = i;
      renderProfileView();
    });
    grid.appendChild(btn);
  }
}

function renderProfileChips() {
  const dietaryList = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal", "Kosher"];
  const allergyList = ["Nuts", "Dairy", "Gluten", "Shellfish", "Egg", "Soy"];

  const containerDiet = document.getElementById('dietaryChipsContainer');
  containerDiet.innerHTML = '';
  dietaryList.forEach(item => {
    const chip = document.createElement('div');
    chip.className = `chip ${profile.dietary.includes(item) ? 'active' : ''}`;
    chip.textContent = item;
    chip.addEventListener('click', () => {
      const idx = profile.dietary.indexOf(item);
      if (idx > -1) profile.dietary.splice(idx, 1);
      else profile.dietary.push(item);
      chip.classList.toggle('active');
    });
    containerDiet.appendChild(chip);
  });

  const containerAllergy = document.getElementById('allergyChipsContainer');
  containerAllergy.innerHTML = '';
  allergyList.forEach(item => {
    const chip = document.createElement('div');
    chip.className = `chip ${profile.allergies.includes(item) ? 'active' : ''}`;
    chip.textContent = item;
    chip.addEventListener('click', () => {
      const idx = profile.allergies.indexOf(item);
      if (idx > -1) profile.allergies.splice(idx, 1);
      else profile.allergies.push(item);
      chip.classList.toggle('active');
    });
    containerAllergy.appendChild(chip);
  });
}

function saveProfileChanges() {
  profile.sex = document.getElementById('profSex').value;
  profile.birthday = document.getElementById('profBirthday').value || '2011-05-15';
  profile.weight = parseFloat(document.getElementById('profWeight').value) || profile.weight;
  profile.height = parseFloat(document.getElementById('profHeight').value) || profile.height;
  
  localStorage.setItem('mp_user_profile', JSON.stringify(profile));
  alert('✨ Profile changes saved! Your daily calorie budget has been recalculated.');
  switchTab('home');
}
