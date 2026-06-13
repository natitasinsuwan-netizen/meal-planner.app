"""MealRandom backend tests — auth, profile, meals, random, logs, admin, Spoonacular."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://calorie-balance-app-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "natitasinsuwan@gmail.com"
ADMIN_PASSWORD = "097987696"


# ---------- Fixtures ----------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def user_token():
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "test123"}, timeout=15)
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    return r.json()["access_token"], email


def H(tok):
    return {"Authorization": f"Bearer {tok}"}


# ---------- AUTH ----------
def test_register_returns_jwt():
    email = f"TEST_reg_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": "test123"})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body and len(body["access_token"]) > 20
    assert body.get("token_type") == "bearer"


def test_register_duplicate_400():
    email = f"TEST_dup_{uuid.uuid4().hex[:8]}@example.com"
    requests.post(f"{API}/auth/register", json={"email": email, "password": "test123"})
    r2 = requests.post(f"{API}/auth/register", json={"email": email, "password": "test123"})
    assert r2.status_code == 400


def test_admin_login_success(admin_token):
    assert admin_token


def test_login_bad_password_401():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


# ---------- USERS ----------
def test_me_admin_is_admin_true(admin_token):
    r = requests.get(f"{API}/users/me", headers=H(admin_token))
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert data["is_admin"] is True


def test_me_regular_is_admin_false(user_token):
    tok, email = user_token
    r = requests.get(f"{API}/users/me", headers=H(tok))
    assert r.status_code == 200
    assert r.json()["is_admin"] is False


def test_me_unauthorized():
    r = requests.get(f"{API}/users/me")
    assert r.status_code == 401


def test_update_profile_and_calorie_targets(user_token):
    tok, _ = user_token
    payload = {
        "weight_kg": 70, "height_cm": 175, "birthday": "1995-05-10",
        "sex": "male", "exercise_per_week": 3,
        "dietary_preferences": [], "allergies": [], "purpose": "random",
    }
    r = requests.put(f"{API}/users/me/profile", json=payload, headers=H(tok))
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["daily_calorie_target"] is not None and d["daily_calorie_target"] > 1500
    # random mode → adjusted == target
    assert d["daily_calorie_adjusted"] == d["daily_calorie_target"]

    # Switch to diet → adjusted = target - 400
    payload["purpose"] = "diet"
    r2 = requests.put(f"{API}/users/me/profile", json=payload, headers=H(tok))
    d2 = r2.json()
    assert d2["daily_calorie_adjusted"] == d2["daily_calorie_target"] - 400


def test_update_profile_invalid_sex(user_token):
    tok, _ = user_token
    r = requests.put(f"{API}/users/me/profile", json={"sex": "X", "purpose": "random"}, headers=H(tok))
    assert r.status_code == 400


# ---------- KEYWORDS ----------
def test_keywords_groups():
    r = requests.get(f"{API}/keywords")
    assert r.status_code == 200
    d = r.json()
    assert set(d["groups"].keys()) == {"countries", "cooking_methods", "carbs", "protein"}
    assert "vegan" in d["dietary_preferences"]
    assert "shellfish" in d["allergies"]


# ---------- MEALS ----------
def test_list_meals_count_and_thai():
    r = requests.get(f"{API}/meals")
    assert r.status_code == 200
    meals = r.json()
    assert len(meals) >= 38, f"expected >=38 meals, got {len(meals)}"
    names = {m["name"] for m in meals}
    for thai in ["Pad Thai", "Tom Yum Goong", "Green Curry Chicken",
                 "Pad Krapow Moo", "Khao Soi"]:
        assert thai in names, f"missing Thai dish: {thai}"
    # exclude _id
    for m in meals[:3]:
        assert "_id" not in m
        assert "id" in m


def test_random_meal_basic(user_token):
    tok, _ = user_token
    r = requests.post(f"{API}/meals/random", json={"keywords": {}}, headers=H(tok))
    assert r.status_code == 200
    assert "id" in r.json() and "name" in r.json()


def test_random_meal_keyword_filter(user_token):
    tok, _ = user_token
    r = requests.post(f"{API}/meals/random", json={"keywords": {"countries": ["thai"]}}, headers=H(tok))
    assert r.status_code == 200
    meal = r.json()
    assert "thai" in meal["keywords"].get("countries", [])


def test_random_respects_dietary_vegan(user_token):
    tok, _ = user_token
    # set vegan preference
    payload = {
        "weight_kg": 60, "height_cm": 170, "birthday": "1995-01-01",
        "sex": "female", "exercise_per_week": 2,
        "dietary_preferences": ["vegan"], "allergies": [], "purpose": "random",
    }
    requests.put(f"{API}/users/me/profile", json=payload, headers=H(tok))
    for _ in range(8):
        r = requests.post(f"{API}/meals/random", json={"keywords": {}}, headers=H(tok))
        assert r.status_code == 200
        assert "vegan" in r.json().get("dietary_tags", [])


def test_random_respects_shellfish_allergy(user_token):
    tok, _ = user_token
    payload = {
        "weight_kg": 60, "height_cm": 170, "birthday": "1995-01-01",
        "sex": "female", "exercise_per_week": 2,
        "dietary_preferences": [], "allergies": ["shellfish"], "purpose": "random",
    }
    requests.put(f"{API}/users/me/profile", json=payload, headers=H(tok))
    for _ in range(10):
        r = requests.post(f"{API}/meals/random", json={"keywords": {}}, headers=H(tok))
        assert r.status_code == 200
        assert "shellfish" not in r.json().get("allergens", [])


def test_random_diet_mode_low_fat(user_token):
    tok, _ = user_token
    payload = {
        "weight_kg": 70, "height_cm": 175, "birthday": "1995-05-10",
        "sex": "male", "exercise_per_week": 3,
        "dietary_preferences": [], "allergies": [], "purpose": "diet",
    }
    requests.put(f"{API}/users/me/profile", json=payload, headers=H(tok))
    # use a keyword filter (thai) where low_fat meals exist → must be low_fat
    low_fat_hits = 0
    for _ in range(10):
        r = requests.post(f"{API}/meals/random",
                          json={"keywords": {"countries": ["thai"]}}, headers=H(tok))
        assert r.status_code == 200
        if r.json().get("low_fat"):
            low_fat_hits += 1
    # graceful-fallback is allowed but with thai filter there ARE low_fat meals,
    # so primary pool should be used → all low_fat
    assert low_fat_hits == 10, f"expected all low_fat in diet mode w/ thai filter, got {low_fat_hits}/10"


# ---------- LOGS ----------
def test_logs_flow_add_get_delete_clear(user_token):
    tok, _ = user_token
    # ensure profile so target is computed
    requests.put(f"{API}/users/me/profile", json={
        "weight_kg": 70, "height_cm": 175, "birthday": "1995-05-10",
        "sex": "male", "exercise_per_week": 3,
        "dietary_preferences": [], "allergies": [], "purpose": "random",
    }, headers=H(tok))

    # clear first to avoid prior-day state
    requests.delete(f"{API}/logs/clear", headers=H(tok))

    r = requests.get(f"{API}/logs/today", headers=H(tok))
    assert r.status_code == 200
    base = r.json()
    assert {"date", "entries", "consumed", "target", "remaining", "purpose"} <= set(base.keys())
    assert base["consumed"] == 0
    target = base["target"]

    # pick a meal
    meals = requests.get(f"{API}/meals").json()
    meal = meals[0]
    add = requests.post(f"{API}/logs/add", json={"meal_id": meal["id"]}, headers=H(tok))
    assert add.status_code == 200
    entry_id = add.json()["entry"]["entry_id"]

    after = requests.get(f"{API}/logs/today", headers=H(tok)).json()
    assert after["consumed"] == round(meal["calories"], 0)
    assert after["remaining"] == round(target - meal["calories"], 0)
    assert len(after["entries"]) == 1

    # delete entry
    d = requests.delete(f"{API}/logs/entry/{entry_id}", headers=H(tok))
    assert d.status_code == 200
    after2 = requests.get(f"{API}/logs/today", headers=H(tok)).json()
    assert after2["consumed"] == 0

    # add then clear
    requests.post(f"{API}/logs/add", json={"meal_id": meal["id"]}, headers=H(tok))
    c = requests.delete(f"{API}/logs/clear", headers=H(tok))
    assert c.status_code == 200
    after3 = requests.get(f"{API}/logs/today", headers=H(tok)).json()
    assert after3["entries"] == []


# ---------- ADMIN MEAL CRUD ----------
def test_create_meal_non_admin_forbidden(user_token):
    tok, _ = user_token
    r = requests.post(f"{API}/meals",
                      json={"name": "TEST_x", "calories": 100}, headers=H(tok))
    assert r.status_code == 403


def test_admin_meal_crud(admin_token):
    payload = {
        "name": f"TEST_meal_{uuid.uuid4().hex[:6]}",
        "description": "test", "image_url": "",
        "calories": 300, "fat_g": 10, "protein_g": 20, "carbs_g": 30,
        "keywords": {"countries": ["thai"], "cooking_methods": [], "carbs": [], "protein": []},
        "dietary_tags": [], "allergens": [], "low_fat": True,
    }
    c = requests.post(f"{API}/meals", json=payload, headers=H(admin_token))
    assert c.status_code == 200, c.text
    mid = c.json()["id"]

    # Verify persisted
    g = requests.get(f"{API}/meals?q={payload['name']}")
    assert any(m["id"] == mid for m in g.json())

    # Update
    payload["calories"] = 350
    u = requests.put(f"{API}/meals/{mid}", json=payload, headers=H(admin_token))
    assert u.status_code == 200 and u.json()["calories"] == 350

    # Delete
    d = requests.delete(f"{API}/meals/{mid}", headers=H(admin_token))
    assert d.status_code == 200
    # Verify gone
    g2 = requests.get(f"{API}/meals?q={payload['name']}")
    assert not any(m["id"] == mid for m in g2.json())


# ---------- SPOONACULAR ----------
def test_spoonacular_search_admin_only(user_token, admin_token):
    tok, _ = user_token
    r1 = requests.get(f"{API}/spoonacular/search?query=thai&number=2", headers=H(tok))
    assert r1.status_code == 403

    r2 = requests.get(f"{API}/spoonacular/search?query=thai&number=2", headers=H(admin_token), timeout=30)
    # Spoonacular may rate-limit; treat 402/429 as flaky-allowed
    if r2.status_code in (402, 429):
        pytest.skip(f"Spoonacular rate limit/quota: {r2.status_code}")
    assert r2.status_code == 200, r2.text
    assert "results" in r2.json()
