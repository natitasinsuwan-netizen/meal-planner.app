const INITIAL_MEALS = [
  // --- THAI ---
  {
    id: "m1",
    name: "Pad Thai Krakoong",
    description: "Stir-fried rice noodles with jumbo prawns, farm egg, tofu, bean sprouts, crushed peanuts, and authentic tamarind sauce.",
    image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    calories: 486, fat_g: 14.0, protein_g: 22.0, carbs_g: 65.0,
    keywords: { countries: ["thai"], cooking_methods: ["stir-fry"], carbs: ["noodles"], protein: ["egg", "tofu", "seafood"] },
    dietary_tags: ["halal"], allergens: ["nuts", "egg", "soy", "shellfish"], low_fat: false
  },
  {
    id: "m2",
    name: "Tom Yum Goong Supreme",
    description: "Spicy and sour Thai lemongrass soup loaded with giant river prawns, straw mushrooms, galangal, kaffir lime leaves, and fresh lime juice.",
    image_url: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
    calories: 220, fat_g: 6.0, protein_g: 24.0, carbs_g: 12.0,
    keywords: { countries: ["thai"], cooking_methods: ["boil"], carbs: ["low-carbs"], protein: ["seafood"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: ["shellfish"], low_fat: true
  },
  {
    id: "m3",
    name: "Green Curry Chicken (Gaeng Keow Wan)",
    description: "Aromatic Thai green curry paste with tender chicken breast, pea aubergines, and sweet basil leaves simmered in coconut milk.",
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    calories: 420, fat_g: 22.0, protein_g: 28.0, carbs_g: 28.0,
    keywords: { countries: ["thai"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["chicken"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: [], low_fat: false
  },
  {
    id: "m4",
    name: "Som Tum Thai (Green Papaya Salad)",
    description: "Fresh hand-shredded green papaya pounded in clay mortar with garlic, bird's eye chili, cherry tomatoes, long beans, and lime dressing.",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    calories: 120, fat_g: 2.0, protein_g: 4.0, carbs_g: 24.0,
    keywords: { countries: ["thai", "laos"], cooking_methods: ["boil"], carbs: ["low-carbs"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal"], allergens: [], low_fat: true
  },
  {
    id: "m5",
    name: "Massaman Curry Beef",
    description: "Rich and mild Southern Thai curry featuring tender slow-cooked beef chunks, roasted peanuts, potatoes, onions, and aromatic spices.",
    image_url: "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=800&q=80",
    calories: 540, fat_g: 32.0, protein_g: 34.0, carbs_g: 30.0,
    keywords: { countries: ["thai"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["beef"] },
    dietary_tags: ["halal"], allergens: ["nuts"], low_fat: false
  },
  {
    id: "m6",
    name: "Pad Kra Pao Crispy Pork Belly",
    description: "Crispy pork belly stir-fried at high heat with holy basil, garlic, and fresh chilies, served over jasmine rice with a crispy fried egg.",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    calories: 680, fat_g: 42.0, protein_g: 30.0, carbs_g: 45.0,
    keywords: { countries: ["thai"], cooking_methods: ["stir-fry"], carbs: ["rice"], protein: ["pork", "egg"] },
    dietary_tags: ["dairy-free"], allergens: ["egg", "soy"], low_fat: false
  },
  {
    id: "m7",
    name: "Khao Soi Chicken (Northern Curry Noodle)",
    description: "Northern Thai golden coconut curry noodle soup with slow-braised drumstick, crispy fried noodles, pickled mustard greens, and shallots.",
    image_url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
    calories: 510, fat_g: 24.0, protein_g: 28.0, carbs_g: 48.0,
    keywords: { countries: ["thai"], cooking_methods: ["boil"], carbs: ["noodles"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["gluten", "egg"], low_fat: false
  },

  // --- JAPANESE & KOREAN ---
  {
    id: "m8",
    name: "Chicken Teriyaki Rice Bowl",
    description: "Charbroiled chicken thigh coated in sweet mirin-soy glaze, served over steamed Japanese short-grain rice with sesame edamame.",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    calories: 460, fat_g: 12.0, protein_g: 36.0, carbs_g: 52.0,
    keywords: { countries: ["japanese"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["soy", "gluten"], low_fat: true
  },
  {
    id: "m9",
    name: "Fresh Salmon Nigiri & Maki Platter",
    description: "Fresh slices of Norwegian salmon over seasoned vinegared rice alongside avocado cucumber maki rolls and pickled ginger.",
    image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    calories: 380, fat_g: 10.0, protein_g: 26.0, carbs_g: 46.0,
    keywords: { countries: ["japanese"], cooking_methods: ["boil"], carbs: ["rice"], protein: ["fish"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: [], low_fat: true
  },
  {
    id: "m10",
    name: "Tonkotsu Chashu Ramen",
    description: "Silky 12-hour rich pork bone broth served with handmade ramen noodles, slow-roasted chashu pork belly, ajitama egg, and nori.",
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    calories: 620, fat_g: 28.0, protein_g: 32.0, carbs_g: 60.0,
    keywords: { countries: ["japanese"], cooking_methods: ["boil"], carbs: ["noodles"], protein: ["pork", "egg"] },
    dietary_tags: [], allergens: ["gluten", "egg", "soy"], low_fat: false
  },
  {
    id: "m11",
    name: "Korean Beef Bulgogi Bibimbap",
    description: "Sizzling dolsot stone bowl rice with marinated ribeye bulgogi, sauteed spinach, bean sprouts, shiitake mushrooms, fried egg, and gochujang.",
    image_url: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&q=80",
    calories: 490, fat_g: 15.0, protein_g: 26.0, carbs_g: 62.0,
    keywords: { countries: ["korean"], cooking_methods: ["stir-fry"], carbs: ["rice"], protein: ["beef", "egg"] },
    dietary_tags: ["halal"], allergens: ["egg", "soy", "gluten"], low_fat: true
  },
  {
    id: "m12",
    name: "Crispy Korean Yangnyeom Chicken",
    description: "Double-fried extra crispy chicken wings tossed in a sweet, sticky, and tangy chili glaze with pickled white radish.",
    image_url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80",
    calories: 580, fat_g: 32.0, protein_g: 38.0, carbs_g: 34.0,
    keywords: { countries: ["korean"], cooking_methods: ["fry"], carbs: ["low-carbs"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["soy", "gluten"], low_fat: false
  },

  // --- INDIAN & LEBANESE ---
  {
    id: "m13",
    name: "Butter Chicken (Murgh Makhani) & Naan",
    description: "Tandoori chicken tikka simmered in a velvety sauce of tomatoes, cream, butter, and fragrant fenugreek, served with garlic butter naan.",
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80",
    calories: 520, fat_g: 28.0, protein_g: 32.0, carbs_g: 36.0,
    keywords: { countries: ["indian"], cooking_methods: ["grill", "stew"], carbs: ["bread"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["dairy"], low_fat: false
  },
  {
    id: "m14",
    name: "Vegan Chana Masala Curry",
    description: "Hearty chickpea curry cooked with roasted onions, tomatoes, ginger, garlic, cilantro, and warm Indian spices.",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    calories: 320, fat_g: 8.0, protein_g: 16.0, carbs_g: 48.0,
    keywords: { countries: ["indian"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal", "kosher"], allergens: [], low_fat: true
  },
  {
    id: "m15",
    name: "Vietnamese Pho Bo (Beef Noodle Soup)",
    description: "Traditional aromatic beef bone broth infused with star anise and cinnamon, served with flat rice noodles and thin sirloin cuts.",
    image_url: "https://images.unsplash.com/photo-1583224994076-ae8423f44e83?w=800&q=80",
    calories: 400, fat_g: 9.0, protein_g: 28.0, carbs_g: 50.0,
    keywords: { countries: ["vietnamese"], cooking_methods: ["boil"], carbs: ["noodles"], protein: ["beef"] },
    dietary_tags: ["dairy-free", "halal"], allergens: [], low_fat: true
  },
  {
    id: "m16",
    name: "Lebanese Hummus & Falafel Plate",
    description: "Golden crispy herb falafel served with creamy tahini hummus, tabbouleh salad, pickled turnips, and warm pita pocket.",
    image_url: "https://images.unsplash.com/photo-1571197119282-7c4e2c2dd3a4?w=800&q=80",
    calories: 380, fat_g: 14.0, protein_g: 16.0, carbs_g: 48.0,
    keywords: { countries: ["lebanon"], cooking_methods: ["fry"], carbs: ["bread"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "dairy-free", "halal", "kosher"], allergens: ["gluten"], low_fat: true
  },

  // --- ITALIAN, SPANISH, FRENCH ---
  {
    id: "m17",
    name: "Charbroiled Chicken Tacos",
    description: "Warm corn tortillas topped with citrus-marinated grilled chicken breast, fresh pico de gallo, guacamole, and cilantro.",
    image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    calories: 350, fat_g: 10.0, protein_g: 28.0, carbs_g: 36.0,
    keywords: { countries: ["mexican"], cooking_methods: ["grill"], carbs: ["bread"], protein: ["chicken"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: [], low_fat: true
  },
  {
    id: "m18",
    name: "Traditional Spaghetti Carbonara",
    description: "Classic Roman pasta tossed with farm egg yolks, aged Pecorino Romano cheese, crispy guanciale, and cracked black pepper.",
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    calories: 620, fat_g: 30.0, protein_g: 25.0, carbs_g: 65.0,
    keywords: { countries: ["italian"], cooking_methods: ["boil"], carbs: ["pasta"], protein: ["egg", "pork"] },
    dietary_tags: [], allergens: ["gluten", "egg", "dairy"], low_fat: false
  },
  {
    id: "m19",
    name: "Caprese Salad with Aged Balsamic",
    description: "Thick slices of fresh Buffalo mozzarella cheese and vine-ripened heirloom tomatoes garnished with sweet basil pesto and balsamic reduction.",
    image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80",
    calories: 250, fat_g: 18.0, protein_g: 14.0, carbs_g: 8.0,
    keywords: { countries: ["italian"], cooking_methods: ["boil"], carbs: ["low-carbs"], protein: ["tofu"] },
    dietary_tags: ["vegetarian", "gluten-free", "halal", "kosher"], allergens: ["dairy"], low_fat: false
  },
  {
    id: "m20",
    name: "Provençal Herb Ratatouille",
    description: "Classic French countryside stew of layered eggplant, yellow squash, zucchini, bell peppers, and plum tomatoes baked with herbs de Provence.",
    image_url: "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=800&q=80",
    calories: 180, fat_g: 7.0, protein_g: 5.0, carbs_g: 28.0,
    keywords: { countries: ["french"], cooking_methods: ["stew"], carbs: ["low-carbs"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal", "kosher"], allergens: [], low_fat: true
  },
  {
    id: "m21",
    name: "Spanish Seafood Paella",
    description: "Saffron Bomba rice slowly simmered with tiger prawns, blue mussels, calamari rings, green peas, and lemon wedges.",
    image_url: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80",
    calories: 560, fat_g: 16.0, protein_g: 34.0, carbs_g: 68.0,
    keywords: { countries: ["spanish"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["seafood"] },
    dietary_tags: ["dairy-free", "gluten-free", "halal"], allergens: ["shellfish"], low_fat: true
  },

  // --- AMERICAN & NORDIC ---
  {
    id: "m22",
    name: "Grilled Salmon & Lemon Quinoa Bowl",
    description: "Wild-caught Atlantic salmon fillet flame-grilled, served over fluffy lemon dill quinoa and steamed asparagus spears.",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    calories: 430, fat_g: 16.0, protein_g: 38.0, carbs_g: 32.0,
    keywords: { countries: ["american", "nordic"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["fish"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal", "kosher"], allergens: [], low_fat: true
  },
  {
    id: "m23",
    name: "Nordic Smoked Salmon Rye Toast",
    description: "Scandinavian dark rye bread spread with chive goat cheese, cold-smoked salmon slices, capers, and fresh dill sprigs.",
    image_url: "https://images.unsplash.com/photo-1626202378416-86f23a7c30a4?w=800&q=80",
    calories: 320, fat_g: 12.0, protein_g: 22.0, carbs_g: 32.0,
    keywords: { countries: ["nordic"], cooking_methods: ["smoke"], carbs: ["bread"], protein: ["fish"] },
    dietary_tags: ["kosher"], allergens: ["gluten", "dairy"], low_fat: true
  },
  {
    id: "m24",
    name: "Lao Sticky Rice & Charred Pork Skewers",
    description: "Charcoal-grilled pork loin marinated with coriander root, garlic, and fish sauce, served with sticky rice and spicy jeow bong dip.",
    image_url: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&q=80",
    calories: 480, fat_g: 18.0, protein_g: 28.0, carbs_g: 50.0,
    keywords: { countries: ["laos"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["pork"] },
    dietary_tags: ["dairy-free", "gluten-free"], allergens: [], low_fat: false
  }
];
