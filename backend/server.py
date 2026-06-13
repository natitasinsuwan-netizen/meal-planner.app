"""MealRandom backend — FastAPI + MongoDB.

Endpoints under /api:
- auth/register, auth/login (JWT)
- users/me, users/me/profile (PUT)
- meals (list/filter, create/update/delete), meals/random
- logs/today, logs/add, logs/clear, logs/entry/{id}
- spoonacular/search (admin: import meals)
"""
from __future__ import annotations

import logging
import os
import random
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import List, Optional

import httpx
import jwt
from bcrypt import checkpw, gensalt, hashpw
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from seed_meals import SEED_MEALS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET_KEY"]
JWT_ALG = os.environ["JWT_ALGORITHM"]
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"].lower()
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
SPOONACULAR_API_KEY = os.environ.get("SPOONACULAR_API_KEY", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="MealRandom API")
api = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
log = logging.getLogger("mealrandom")


# ---------------------------------------------------------------- Models -----
SEX_OPTIONS = {"male", "female"}
PURPOSE_OPTIONS = {"random", "diet"}
ACTIVITY_FACTORS = {
    0: 1.2, 1: 1.3, 2: 1.375, 3: 1.46, 4: 1.55, 5: 1.65, 6: 1.725, 7: 1.9,
}

KEYWORD_GROUPS = {
    "countries": ["thai", "japanese", "chinese", "korean", "indian", "vietnamese", "laos", "lebanon",
                  "mexican", "italian", "french", "spanish", "american", "nordic", "german", "british"],
    "cooking_methods": ["fry", "boil", "grill", "bake", "steam", "stir-fry", "stew", "smoke"],
    "carbs": ["noodles", "rice", "bread", "pasta", "low-carbs"],
    "protein": ["chicken", "egg", "pork", "beef", "fish", "seafood", "tofu"],
}

DIETARY_OPTIONS = ["vegetarian", "vegan", "gluten-free", "dairy-free", "nut-free", "halal", "kosher"]
ALLERGEN_OPTIONS = ["nuts", "dairy", "gluten", "shellfish", "egg", "soy"]


class Profile(BaseModel):
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    birthday: Optional[str] = None  # ISO date "YYYY-MM-DD"
    sex: Optional[str] = None
    exercise_per_week: Optional[int] = None
    dietary_preferences: List[str] = []
    allergies: List[str] = []
    purpose: str = "random"


class UserOut(BaseModel):
    id: str
    email: EmailStr
    is_admin: bool
    profile: Profile
    daily_calorie_target: Optional[float] = None
    daily_calorie_adjusted: Optional[float] = None


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MealIn(BaseModel):
    name: str
    description: str = ""
    image_url: str = ""
    calories: float
    fat_g: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    keywords: dict = Field(default_factory=lambda: {"countries": [], "cooking_methods": [], "carbs": [], "protein": []})
    dietary_tags: List[str] = []
    allergens: List[str] = []
    low_fat: bool = False


class MealOut(MealIn):
    id: str


class RandomIn(BaseModel):
    keywords: dict = Field(default_factory=dict)
    exclude_ids: List[str] = []


class AddLogIn(BaseModel):
    meal_id: str


# ----------------------------------------------------------------- Utils -----
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def today_iso() -> str:
    return date.today().isoformat()


def hash_pw(plain: str) -> str:
    return hashpw(plain.encode(), gensalt()).decode()


def verify_pw(plain: str, hashed: str) -> bool:
    try:
        return checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str, email: str, is_admin: bool) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "is_admin": is_admin,
        "exp": now_utc() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def calc_age(birthday: Optional[str]) -> Optional[int]:
    if not birthday:
        return None
    try:
        b = date.fromisoformat(birthday)
    except ValueError:
        return None
    t = date.today()
    return t.year - b.year - ((t.month, t.day) < (b.month, b.day))


def calc_daily_calories(profile: Profile) -> Optional[float]:
    age = calc_age(profile.birthday)
    if not (profile.weight_kg and profile.height_cm and age and profile.sex in SEX_OPTIONS):
        return None
    if profile.sex == "male":
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age + 5
    else:
        bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age - 161
    activity = ACTIVITY_FACTORS.get(int(profile.exercise_per_week or 0), 1.2)
    return round(bmr * activity, 0)


def user_doc_to_out(doc: dict) -> UserOut:
    profile = Profile(**(doc.get("profile") or {}))
    tdee = calc_daily_calories(profile)
    adjusted = (tdee - 400) if (tdee and profile.purpose == "diet") else tdee
    return UserOut(
        id=doc["id"],
        email=doc["email"],
        is_admin=doc.get("is_admin", False),
        profile=profile,
        daily_calorie_target=tdee,
        daily_calorie_adjusted=adjusted,
    )


def meal_doc_to_out(doc: dict) -> MealOut:
    return MealOut(
        id=doc["id"],
        name=doc["name"],
        description=doc.get("description", ""),
        image_url=doc.get("image_url", ""),
        calories=doc["calories"],
        fat_g=doc.get("fat_g", 0),
        protein_g=doc.get("protein_g", 0),
        carbs_g=doc.get("carbs_g", 0),
        keywords=doc.get("keywords", {}),
        dietary_tags=doc.get("dietary_tags", []),
        allergens=doc.get("allergens", []),
        low_fat=doc.get("low_fat", False),
    )


DIET_TO_ALLERGENS = {
    "gluten-free": ["gluten"],
    "dairy-free": ["dairy"],
    "nut-free": ["nuts"],
}


def meal_matches_user(meal: dict, profile: Profile, diet_mode: bool) -> bool:
    tags = set(meal.get("dietary_tags", []))
    allergens = set(meal.get("allergens", []))
    for must in ("vegetarian", "vegan", "halal", "kosher"):
        if must in (profile.dietary_preferences or []) and must not in tags:
            return False
    excluded = set(profile.allergies or [])
    for pref in (profile.dietary_preferences or []):
        for a in DIET_TO_ALLERGENS.get(pref, []):
            excluded.add(a)
    if excluded & allergens:
        return False
    if diet_mode and not meal.get("low_fat", False):
        return False
    return True


def meal_matches_keywords(meal: dict, kw: dict) -> bool:
    meal_kw = meal.get("keywords", {}) or {}
    for group, selected in (kw or {}).items():
        if not selected:
            continue
        mvals = set(meal_kw.get(group, []) or [])
        if not (set(selected) & mvals):
            return False
    return True


# ----------------------------------------------------------- Auth deps -------
async def current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        uid = payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    user = await db.users.find_one({"id": uid}, {"_id": 0})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user


async def current_admin(user: dict = Depends(current_user)) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin only")
    return user


# ------------------------------------------------------------- Routes --------
@api.get("/")
async def root():
    return {"message": "MealRandom API", "ok": True}


@api.get("/keywords")
async def list_keywords():
    return {
        "groups": KEYWORD_GROUPS,
        "dietary_preferences": DIETARY_OPTIONS,
        "allergies": ALLERGEN_OPTIONS,
    }


# ---- Auth ----
@api.post("/auth/register", response_model=TokenOut)
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    doc = {
        "id": uid,
        "email": email,
        "hashed_password": hash_pw(body.password),
        "is_admin": False,
        "profile": Profile().model_dump(),
        "created_at": now_utc().isoformat(),
    }
    await db.users.insert_one(doc)
    return TokenOut(access_token=make_token(uid, email, False))


@api.post("/auth/login", response_model=TokenOut)
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_pw(body.password, user["hashed_password"]):
        raise HTTPException(401, "Incorrect email or password")
    return TokenOut(access_token=make_token(user["id"], user["email"], user.get("is_admin", False)))


# ---- Users ----
@api.get("/users/me", response_model=UserOut)
async def get_me(user: dict = Depends(current_user)):
    return user_doc_to_out(user)


@api.put("/users/me/profile", response_model=UserOut)
async def update_profile(profile: Profile, user: dict = Depends(current_user)):
    if profile.sex and profile.sex not in SEX_OPTIONS:
        raise HTTPException(400, "sex must be 'male' or 'female'")
    if profile.purpose not in PURPOSE_OPTIONS:
        raise HTTPException(400, "purpose must be 'random' or 'diet'")
    if profile.exercise_per_week is not None and not (0 <= profile.exercise_per_week <= 7):
        raise HTTPException(400, "exercise_per_week must be 0..7")
    await db.users.update_one({"id": user["id"]}, {"$set": {"profile": profile.model_dump()}})
    user["profile"] = profile.model_dump()
    return user_doc_to_out(user)


# ---- Meals ----
@api.get("/meals", response_model=List[MealOut])
async def list_meals(q: Optional[str] = None):
    query: dict = {}
    if q:
        query["name"] = {"$regex": q, "$options": "i"}
    docs = await db.meals.find(query, {"_id": 0}).to_list(500)
    return [meal_doc_to_out(d) for d in docs]


@api.post("/meals", response_model=MealOut)
async def create_meal(body: MealIn, _: dict = Depends(current_admin)):
    doc = body.model_dump()
    doc["id"] = str(uuid.uuid4())
    await db.meals.insert_one(doc.copy())
    return meal_doc_to_out(doc)


@api.put("/meals/{meal_id}", response_model=MealOut)
async def update_meal(meal_id: str, body: MealIn, _: dict = Depends(current_admin)):
    doc = body.model_dump()
    res = await db.meals.update_one({"id": meal_id}, {"$set": doc})
    if not res.matched_count:
        raise HTTPException(404, "Meal not found")
    doc["id"] = meal_id
    return meal_doc_to_out(doc)


@api.delete("/meals/{meal_id}")
async def delete_meal(meal_id: str, _: dict = Depends(current_admin)):
    res = await db.meals.delete_one({"id": meal_id})
    if not res.deleted_count:
        raise HTTPException(404, "Meal not found")
    return {"ok": True}


@api.post("/meals/random", response_model=MealOut)
async def random_meal(body: RandomIn, user: dict = Depends(current_user)):
    profile = Profile(**(user.get("profile") or {}))
    diet_mode = profile.purpose == "diet"

    docs = await db.meals.find({"id": {"$nin": body.exclude_ids}}, {"_id": 0}).to_list(2000)
    pool = [d for d in docs if meal_matches_user(d, profile, diet_mode) and meal_matches_keywords(d, body.keywords)]

    if not pool and diet_mode:
        pool = [d for d in docs if meal_matches_user(d, profile, False) and meal_matches_keywords(d, body.keywords)]

    if not pool:
        raise HTTPException(404, "No meal matches those filters. Try removing some keywords.")
    return meal_doc_to_out(random.choice(pool))


# ---- Daily Log ----
async def get_or_create_today_log(user_id: str) -> dict:
    iso = today_iso()
    log_doc = await db.logs.find_one({"user_id": user_id, "date": iso}, {"_id": 0})
    if not log_doc:
        log_doc = {"id": str(uuid.uuid4()), "user_id": user_id, "date": iso, "entries": []}
        await db.logs.insert_one(log_doc.copy())
    return log_doc


@api.get("/logs/today")
async def get_today(user: dict = Depends(current_user)):
    log_doc = await get_or_create_today_log(user["id"])
    consumed = sum(e.get("calories", 0) for e in log_doc.get("entries", []))
    me = user_doc_to_out(user)
    target = me.daily_calorie_adjusted or me.daily_calorie_target or 0
    remaining = (target - consumed) if target else None
    return {
        "date": log_doc["date"],
        "entries": log_doc.get("entries", []),
        "consumed": round(consumed, 0),
        "target": target,
        "remaining": (round(remaining, 0) if remaining is not None else None),
        "purpose": me.profile.purpose,
    }


@api.post("/logs/add")
async def add_meal_to_log(body: AddLogIn, user: dict = Depends(current_user)):
    meal = await db.meals.find_one({"id": body.meal_id}, {"_id": 0})
    if not meal:
        raise HTTPException(404, "Meal not found")
    await get_or_create_today_log(user["id"])
    entry = {
        "entry_id": str(uuid.uuid4()),
        "meal_id": meal["id"],
        "name": meal["name"],
        "image_url": meal.get("image_url", ""),
        "calories": meal.get("calories", 0),
        "added_at": now_utc().isoformat(),
    }
    await db.logs.update_one(
        {"user_id": user["id"], "date": today_iso()},
        {"$push": {"entries": entry}},
    )
    return {"ok": True, "entry": entry}


@api.delete("/logs/clear")
async def clear_today(user: dict = Depends(current_user)):
    await db.logs.update_one(
        {"user_id": user["id"], "date": today_iso()},
        {"$set": {"entries": []}},
        upsert=True,
    )
    return {"ok": True}


@api.delete("/logs/entry/{entry_id}")
async def delete_entry(entry_id: str, user: dict = Depends(current_user)):
    res = await db.logs.update_one(
        {"user_id": user["id"], "date": today_iso()},
        {"$pull": {"entries": {"entry_id": entry_id}}},
    )
    if not res.modified_count:
        raise HTTPException(404, "Entry not found")
    return {"ok": True}


# ---- Spoonacular (admin import) ----
@api.get("/spoonacular/search")
async def spoonacular_search(query: str = "thai", number: int = 10, _: dict = Depends(current_admin)):
    if not SPOONACULAR_API_KEY:
        raise HTTPException(400, "SPOONACULAR_API_KEY not configured")
    async with httpx.AsyncClient(timeout=15) as cx:
        r = await cx.get(
            "https://api.spoonacular.com/recipes/complexSearch",
            params={
                "apiKey": SPOONACULAR_API_KEY,
                "query": query,
                "number": min(number, 25),
                "addRecipeNutrition": "true",
                "addRecipeInformation": "true",
            },
        )
    if r.status_code != 200:
        raise HTTPException(r.status_code, f"Spoonacular error: {r.text[:200]}")
    return r.json()


@api.post("/spoonacular/import")
async def spoonacular_import(body: dict, _: dict = Depends(current_admin)):
    """Body: { results: [...] } from /spoonacular/search."""
    results = body.get("results", [])
    inserted = 0
    for it in results:
        nutrients = {n["name"].lower(): n["amount"] for n in (it.get("nutrition", {}).get("nutrients", []) or [])}
        cuisines = [c.lower() for c in it.get("cuisines", [])]
        countries = [c for c in cuisines if c in KEYWORD_GROUPS["countries"]]
        diets = [d.lower() for d in it.get("diets", [])]
        dietary_tags = []
        if "vegetarian" in diets or it.get("vegetarian"):
            dietary_tags.append("vegetarian")
        if "vegan" in diets or it.get("vegan"):
            dietary_tags.append("vegan")
        if it.get("glutenFree"):
            dietary_tags.append("gluten-free")
        if it.get("dairyFree"):
            dietary_tags.append("dairy-free")

        cal = nutrients.get("calories", 400)
        fat = nutrients.get("fat", 15)
        doc = {
            "id": str(uuid.uuid4()),
            "name": it.get("title", "Untitled"),
            "description": (it.get("summary") or "")[:240].replace("<b>", "").replace("</b>", ""),
            "image_url": it.get("image", ""),
            "calories": round(float(cal), 0),
            "fat_g": round(float(fat), 1),
            "protein_g": round(float(nutrients.get("protein", 0)), 1),
            "carbs_g": round(float(nutrients.get("carbohydrates", 0)), 1),
            "keywords": {"countries": countries, "cooking_methods": [], "carbs": [], "protein": []},
            "dietary_tags": dietary_tags,
            "allergens": [],
            "low_fat": float(fat) <= 12,
        }
        await db.meals.insert_one(doc)
        inserted += 1
    return {"inserted": inserted}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------------------------- Startup ---------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.meals.create_index("id", unique=True)
    await db.logs.create_index([("user_id", 1), ("date", 1)], unique=True)

    existing_admin = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing_admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "hashed_password": hash_pw(ADMIN_PASSWORD),
            "is_admin": True,
            "profile": Profile().model_dump(),
            "created_at": now_utc().isoformat(),
        })
        log.info("Seeded admin user %s", ADMIN_EMAIL)
    elif not existing_admin.get("is_admin"):
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": {"is_admin": True}})

    meal_count = await db.meals.count_documents({})
    if meal_count == 0:
        for m in SEED_MEALS:
            doc = dict(m)
            doc["id"] = str(uuid.uuid4())
            await db.meals.insert_one(doc)
        log.info("Seeded %d meals", len(SEED_MEALS))


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
