const INITIAL_MEALS = [
  // --- THAI ---
  {
    id: "m1",
    name: "Pad Thai Krakoong",
    description: "Stir-fried rice noodles with jumbo prawns, farm egg, tofu, bean sprouts, crushed peanuts, and authentic tamarind sauce.",
    image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80",
    calories: 486, fat_g: 14.0, protein_g: 22.0, carbs_g: 65.0,
    keywords: { countries: ["thai"], cooking_methods: ["stir-fry"], carbs: ["noodles"], protein: ["egg", "tofu", "seafood"] },
    dietary_tags: ["halal"], allergens: ["nuts", "egg", "soy", "shellfish"], low_fat: false,
    ingredients: [
      "200g Thin Rice Noodles",
      "6 Jumbo Prawns",
      "2 Eggs",
      "50g Yellow Tofu (cubed)",
      "100g Fresh Bean Sprouts",
      "2 tbsp Tamarind Paste & Palm Sugar Sauce",
      "2 tbsp Crushed Roasted Peanuts"
    ],
    instructions: [
      "Soak rice noodles in warm water for 15 minutes until soft.",
      "Sear prawns in a hot wok with a touch of oil until pink; remove and set aside.",
      "Scramble eggs and yellow tofu in the wok.",
      "Add noodles, tamarind sauce, bean sprouts, and prawns. Toss vigorously for 2 minutes.",
      "Serve hot garnished with crushed peanuts and lime wedges."
    ]
  },
  {
    id: "m2",
    name: "Tom Yum Goong Supreme",
    description: "Spicy and sour Thai lemongrass soup loaded with giant river prawns, straw mushrooms, galangal, kaffir lime leaves, and fresh lime juice.",
    image_url: "https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=800&q=80",
    calories: 220, fat_g: 6.0, protein_g: 24.0, carbs_g: 12.0,
    keywords: { countries: ["thai"], cooking_methods: ["boil"], carbs: ["low-carbs"], protein: ["seafood"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: ["shellfish"], low_fat: true,
    ingredients: [
      "4 River Prawns",
      "3 Stalks Lemongrass (bruised)",
      "5 slices Galangal",
      "4 Kaffir Lime Leaves",
      "100g Straw Mushrooms",
      "2 tbsp Thai Chili Paste (Nam Prik Pao)",
      "3 tbsp Fresh Lime Juice & Fish Sauce"
    ],
    instructions: [
      "Boil chicken or prawn stock with lemongrass, galangal, and kaffir lime leaves for 5 minutes.",
      "Add straw mushrooms and chili paste.",
      "Poach river prawns until tender.",
      "Turn off heat and stir in fresh lime juice, fish sauce, and fresh bird's eye chilies."
    ]
  },
  {
    id: "m3",
    name: "Green Curry Chicken (Gaeng Keow Wan)",
    description: "Aromatic Thai green curry paste with tender chicken breast, pea aubergines, and sweet basil leaves simmered in coconut milk.",
    image_url: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    calories: 420, fat_g: 22.0, protein_g: 28.0, carbs_g: 28.0,
    keywords: { countries: ["thai"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["chicken"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: [], low_fat: false,
    ingredients: [
      "250g Chicken Breast (sliced)",
      "2 tbsp Thai Green Curry Paste",
      "200ml Light Coconut Milk",
      "50g Thai Pea Aubergines",
      "1 cup Sweet Basil Leaves",
      "1 tbsp Palm Sugar & Fish Sauce"
    ],
    instructions: [
      "Fry green curry paste in 2 tbsp coconut cream until fragrant oil separates.",
      "Add chicken slices and sear for 3 minutes.",
      "Pour remaining coconut milk and broth; add pea aubergines.",
      "Simmer for 8 minutes, season with palm sugar, and finish with sweet basil leaves."
    ]
  },
  {
    id: "m4",
    name: "Som Tum Thai (Green Papaya Salad)",
    description: "Fresh hand-shredded green papaya pounded in clay mortar with garlic, bird's eye chili, cherry tomatoes, long beans, and lime dressing.",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80",
    calories: 120, fat_g: 2.0, protein_g: 4.0, carbs_g: 24.0,
    keywords: { countries: ["thai", "laos"], cooking_methods: ["boil"], carbs: ["low-carbs"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal"], allergens: [], low_fat: true,
    ingredients: [
      "150g Shredded Green Papaya",
      "2 Cloves Garlic & 2 Bird's Eye Chilies",
      "5 Cherry Tomatoes (halved)",
      "30g Yardlong Beans",
      "1.5 tbsp Lime Juice & Coconut Sugar"
    ],
    instructions: [
      "Pound garlic and chilies in a mortar.",
      "Add long beans, cherry tomatoes, lime juice, and coconut sugar; bruise gently.",
      "Toss in shredded green papaya and mix lightly with spoon and pestle."
    ]
  },
  {
    id: "m5",
    name: "Massaman Curry Beef",
    description: "Rich and mild Southern Thai curry featuring tender slow-cooked beef chunks, roasted peanuts, potatoes, onions, and aromatic spices.",
    image_url: "https://images.unsplash.com/photo-1546069901-eacef0df6022?w=800&q=80",
    calories: 540, fat_g: 32.0, protein_g: 34.0, carbs_g: 30.0,
    keywords: { countries: ["thai"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["beef"] },
    dietary_tags: ["halal"], allergens: ["nuts"], low_fat: false,
    ingredients: [
      "300g Braised Beef Chuck",
      "2 tbsp Massaman Curry Paste",
      "150ml Coconut Milk",
      "1 Potato (cubed)",
      "1/2 Onion (quartered)",
      "2 tbsp Roasted Peanuts & Tamarind Juice"
    ],
    instructions: [
      "Sauté Massaman paste in coconut cream until fragrant.",
      "Add beef, potatoes, onions, and remaining coconut milk.",
      "Simmer covered on low heat for 45 minutes until beef and potatoes are tender.",
      "Stir in roasted peanuts and tamarind juice."
    ]
  },
  {
    id: "m6",
    name: "Pad Kra Pao Crispy Pork Belly",
    description: "Crispy pork belly stir-fried at high heat with holy basil, garlic, and fresh chilies, served over jasmine rice with a crispy fried egg.",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
    calories: 680, fat_g: 42.0, protein_g: 30.0, carbs_g: 45.0,
    keywords: { countries: ["thai"], cooking_methods: ["stir-fry"], carbs: ["rice"], protein: ["pork", "egg"] },
    dietary_tags: ["dairy-free"], allergens: ["egg", "soy"], low_fat: false,
    ingredients: [
      "200g Crispy Pork Belly (sliced)",
      "1 cup Fresh Holy Basil",
      "4 Cloves Garlic & 5 Red Chilies (crushed)",
      "1 tbsp Soy Sauce & Oyster Sauce",
      "1 Crispy Fried Egg & Jasmine Rice"
    ],
    instructions: [
      "Sauté crushed garlic and chilies in high heat wok until fragrant.",
      "Add crispy pork belly, soy sauce, oyster sauce, and splash of water.",
      "Toss in holy basil and turn off heat immediately.",
      "Serve over steaming jasmine rice topped with a crispy fried egg."
    ]
  },
  {
    id: "m7",
    name: "Khao Soi Chicken (Northern Curry Noodle)",
    description: "Northern Thai golden coconut curry noodle soup with slow-braised drumstick, crispy fried noodles, pickled mustard greens, and shallots.",
    image_url: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80",
    calories: 510, fat_g: 24.0, protein_g: 28.0, carbs_g: 48.0,
    keywords: { countries: ["thai"], cooking_methods: ["boil"], carbs: ["noodles"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["gluten", "egg"], low_fat: false,
    ingredients: [
      "2 Chicken Drumsticks",
      "150g Egg Noodles",
      "2 tbsp Khao Soi Paste",
      "200ml Coconut Milk",
      "Crispy Noodle Topping, Pickled Mustard Greens, Lime & Shallots"
    ],
    instructions: [
      "Simmer Khao Soi paste and coconut milk until golden oil rises.",
      "Add chicken drumsticks and broth; cook on low for 30 minutes.",
      "Boil egg noodles and place in serving bowl.",
      "Ladle hot curry broth over noodles and garnish with crispy fried noodles and pickles."
    ]
  },

  // --- JAPANESE & KOREAN ---
  {
    id: "m8",
    name: "Chicken Teriyaki Rice Bowl",
    description: "Charbroiled chicken thigh coated in sweet mirin-soy glaze, served over steamed Japanese short-grain rice with sesame edamame.",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    calories: 460, fat_g: 12.0, protein_g: 36.0, carbs_g: 52.0,
    keywords: { countries: ["japanese"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["soy", "gluten"], low_fat: true,
    ingredients: [
      "220g Chicken Thigh (skin-on)",
      "2 tbsp Teriyaki Sauce (Soy, Mirin, Sake, Sugar)",
      "1 Bowl Japanese Steamed Rice",
      "Steamed Edamame & Toasted Sesame Seeds"
    ],
    instructions: [
      "Sear chicken skin-down on pan until golden and crisp.",
      "Pour teriyaki sauce over chicken and simmer until glaze thickens.",
      "Slice chicken and serve over warm Japanese rice, sprinkled with sesame seeds."
    ]
  },
  {
    id: "m9",
    name: "Fresh Salmon Nigiri & Maki Platter",
    description: "Fresh slices of Norwegian salmon over seasoned vinegared rice alongside avocado cucumber maki rolls and pickled ginger.",
    image_url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    calories: 380, fat_g: 10.0, protein_g: 26.0, carbs_g: 46.0,
    keywords: { countries: ["japanese"], cooking_methods: ["boil"], carbs: ["rice"], protein: ["fish"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: [], low_fat: true,
    ingredients: [
      "150g Sashimi-grade Fresh Norwegian Salmon",
      "200g Seasoned Sushi Rice",
      "Nori Seaweed, Cucumber & Avocado",
      "Wasabi, Pickled Ginger & Low-sodium Soy Sauce"
    ],
    instructions: [
      "Shape sushi rice into small ovals and drape with fresh salmon slices.",
      "Roll cucumber and avocado inside sushi rice and nori for maki.",
      "Serve chilled with artisan wasabi and pickled ginger."
    ]
  },
  {
    id: "m10",
    name: "Tonkotsu Chashu Ramen",
    description: "Silky 12-hour rich pork bone broth served with handmade ramen noodles, slow-roasted chashu pork belly, ajitama egg, and nori.",
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    calories: 620, fat_g: 28.0, protein_g: 32.0, carbs_g: 60.0,
    keywords: { countries: ["japanese"], cooking_methods: ["boil"], carbs: ["noodles"], protein: ["pork", "egg"] },
    dietary_tags: [], allergens: ["gluten", "egg", "soy"], low_fat: false,
    ingredients: [
      "300ml Concentrated Tonkotsu Broth",
      "150g Fresh Thin Ramen Noodles",
      "2 slices Rolled Chashu Pork Belly",
      "1 Soft-boiled Marinated Ajitama Egg",
      "Scallions, Wood Ear Mushrooms & Nori"
    ],
    instructions: [
      "Boil ramen noodles for 90 seconds; drain thoroughly.",
      "Heat rich pork broth until boiling.",
      "Pour broth into deep bowl, add noodles, top with chashu pork, halved egg, scallions, and nori sheet."
    ]
  },
  {
    id: "m11",
    name: "Korean Beef Bulgogi Bibimbap",
    description: "Sizzling dolsot stone bowl rice with marinated ribeye bulgogi, sauteed spinach, bean sprouts, shiitake mushrooms, fried egg, and gochujang.",
    image_url: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&q=80",
    calories: 490, fat_g: 15.0, protein_g: 26.0, carbs_g: 62.0,
    keywords: { countries: ["korean"], cooking_methods: ["stir-fry"], carbs: ["rice"], protein: ["beef", "egg"] },
    dietary_tags: ["halal"], allergens: ["egg", "soy", "gluten"], low_fat: true,
    ingredients: [
      "120g Marinated Ribeye Beef Bulgogi",
      "1 Bowl Cooked White Rice",
      "Sauteed Spinach, Zucchini, Carrots & Shiitake",
      "1 Sunny-side-up Egg",
      "2 tbsp Gochujang Chili Paste & Sesame Oil"
    ],
    instructions: [
      "Stir-fry bulgogi beef in a hot pan.",
      "Arrange warm rice in a bowl, position colorful seasoned vegetables in sections on top.",
      "Crown with fried egg and serve with gochujang and sesame oil."
    ]
  },
  {
    id: "m12",
    name: "Crispy Korean Yangnyeom Chicken",
    description: "Double-fried extra crispy chicken wings tossed in a sweet, sticky, and tangy chili glaze with pickled white radish.",
    image_url: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80",
    calories: 580, fat_g: 32.0, protein_g: 38.0, carbs_g: 34.0,
    keywords: { countries: ["korean"], cooking_methods: ["fry"], carbs: ["low-carbs"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["soy", "gluten"], low_fat: false,
    ingredients: [
      "300g Chicken Wings",
      "Potato Starch Coating",
      "3 tbsp Sweet Chili Gochujang Sauce",
      "Toasted Sesame Seeds & Pickled Daikon Radish"
    ],
    instructions: [
      "Coat chicken wings with potato starch and double-fry until golden and crisp.",
      "Heat sticky gochujang glaze in a wok.",
      "Toss crispy fried wings in glaze until completely covered; sprinkle with sesame seeds."
    ]
  },

  // --- INDIAN & LEBANESE ---
  {
    id: "m13",
    name: "Butter Chicken (Murgh Makhani) & Naan",
    description: "Tandoori chicken tikka simmered in a velvety sauce of tomatoes, cream, butter, and fragrant fenugreek, served with garlic butter naan.",
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80",
    calories: 520, fat_g: 28.0, protein_g: 32.0, carbs_g: 36.0,
    keywords: { countries: ["indian"], cooking_methods: ["grill", "stew"], carbs: ["bread"], protein: ["chicken"] },
    dietary_tags: ["halal"], allergens: ["dairy"], low_fat: false,
    ingredients: [
      "200g Grilled Tandoori Chicken Tikka",
      "150ml Creamy Tomato Butter Gravy",
      "1 tbsp Kasuri Methi (Dried Fenugreek)",
      "1 Garlic Butter Naan Bread"
    ],
    instructions: [
      "Simmer spiced tomato puree with butter and heavy cream.",
      "Add grilled chicken tikka and cook for 10 minutes.",
      "Crush kasuri methi over gravy and serve alongside warm garlic butter naan."
    ]
  },
  {
    id: "m14",
    name: "Vegan Chana Masala Curry",
    description: "Hearty chickpea curry cooked with roasted onions, tomatoes, ginger, garlic, cilantro, and warm Indian spices.",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80",
    calories: 320, fat_g: 8.0, protein_g: 16.0, carbs_g: 48.0,
    keywords: { countries: ["indian"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal", "kosher"], allergens: [], low_fat: true,
    ingredients: [
      "250g Cooked Chickpeas",
      "1 Onion & 2 Tomatoes (chopped)",
      "1 tbsp Chana Masala Spice Blend",
      "Fresh Ginger, Garlic & Cilantro"
    ],
    instructions: [
      "Sauté onions, ginger, and garlic in oil until caramelized.",
      "Add tomatoes and spices; simmer into a thick curry base.",
      "Add chickpeas with 1/2 cup water; cook for 15 minutes and garnish with fresh cilantro."
    ]
  },
  {
    id: "m15",
    name: "Vietnamese Pho Bo (Beef Noodle Soup)",
    description: "Traditional aromatic beef bone broth infused with star anise and cinnamon, served with flat rice noodles and thin sirloin cuts.",
    image_url: "https://images.unsplash.com/photo-1583224994076-ae8423f44e83?w=800&q=80",
    calories: 400, fat_g: 9.0, protein_g: 28.0, carbs_g: 50.0,
    keywords: { countries: ["vietnamese"], cooking_methods: ["boil"], carbs: ["noodles"], protein: ["beef"] },
    dietary_tags: ["dairy-free", "halal"], allergens: [], low_fat: true,
    ingredients: [
      "350ml Star Anise & Cinnamon Infused Beef Broth",
      "150g Flat Rice Noodles",
      "100g Thinly Sliced Raw Beef Sirloin",
      "Fresh Thai Basil, Sawtooth Herb, Bean Sprouts & Lime"
    ],
    instructions: [
      "Place cooked rice noodles in a warm bowl and lay raw sirloin slices on top.",
      "Ladle boiling hot beef broth over raw beef to cook it instantly.",
      "Serve immediately with bean sprouts, fresh herbs, and lime wedges."
    ]
  },
  {
    id: "m16",
    name: "Lebanese Hummus & Falafel Plate",
    description: "Golden crispy herb falafel served with creamy tahini hummus, tabbouleh salad, pickled turnips, and warm pita pocket.",
    image_url: "https://images.unsplash.com/photo-1571197119282-7c4e2c2dd3a4?w=800&q=80",
    calories: 380, fat_g: 14.0, protein_g: 16.0, carbs_g: 48.0,
    keywords: { countries: ["lebanon"], cooking_methods: ["fry"], carbs: ["bread"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "dairy-free", "halal", "kosher"], allergens: ["gluten"], low_fat: true,
    ingredients: [
      "5 Golden Crispy Falafels",
      "100g Creamy Chickpea Tahini Hummus",
      "1/2 cup Parsley Tabbouleh Salad",
      "1 Warm Whole Wheat Pita Bread"
    ],
    instructions: [
      "Spread creamy hummus smoothly over plate.",
      "Arrange hot falafel balls and fresh parsley tabbouleh salad next to hummus.",
      "Drizzle extra virgin olive oil and serve with warm pita pockets."
    ]
  },

  // --- ITALIAN, SPANISH, FRENCH ---
  {
    id: "m17",
    name: "Charbroiled Chicken Tacos",
    description: "Warm corn tortillas topped with citrus-marinated grilled chicken breast, fresh pico de gallo, guacamole, and cilantro.",
    image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    calories: 350, fat_g: 10.0, protein_g: 28.0, carbs_g: 36.0,
    keywords: { countries: ["mexican"], cooking_methods: ["grill"], carbs: ["bread"], protein: ["chicken"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal"], allergens: [], low_fat: true,
    ingredients: [
      "3 Soft Corn Tortillas",
      "180g Citrus-marinated Grilled Chicken Breast",
      "Pico de Gallo (Tomato, Onion, Cilantro, Lime)",
      "Fresh Guacamole"
    ],
    instructions: [
      "Warm corn tortillas on a dry skillet.",
      "Fill with sliced grilled chicken breast.",
      "Top with fresh pico de gallo salsa and scoop of guacamole."
    ]
  },
  {
    id: "m18",
    name: "Traditional Spaghetti Carbonara",
    description: "Classic Roman pasta tossed with farm egg yolks, aged Pecorino Romano cheese, crispy guanciale, and cracked black pepper.",
    image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    calories: 620, fat_g: 30.0, protein_g: 25.0, carbs_g: 65.0,
    keywords: { countries: ["italian"], cooking_methods: ["boil"], carbs: ["pasta"], protein: ["egg", "pork"] },
    dietary_tags: [], allergens: ["gluten", "egg", "dairy"], low_fat: false,
    ingredients: [
      "120g Spaghetti Pasta",
      "2 Egg Yolks + 1 Whole Egg",
      "50g Crispy Pan-fried Guanciale",
      "40g Aged Pecorino Romano Cheese (grated)",
      "Coarsely Ground Black Pepper"
    ],
    instructions: [
      "Boil spaghetti in salted water until al dente.",
      "Whisk egg yolks with Pecorino Romano cheese and black pepper in a bowl.",
      "Toss hot pasta with rendered guanciale fat off heat, then quickly stir in egg cheese mixture to create a silky emulsion."
    ]
  },
  {
    id: "m19",
    name: "Caprese Salad with Aged Balsamic",
    description: "Thick slices of fresh Buffalo mozzarella cheese and vine-ripened heirloom tomatoes garnished with sweet basil pesto and balsamic reduction.",
    image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800&q=80",
    calories: 250, fat_g: 18.0, protein_g: 14.0, carbs_g: 8.0,
    keywords: { countries: ["italian"], cooking_methods: ["boil"], carbs: ["low-carbs"], protein: ["tofu"] },
    dietary_tags: ["vegetarian", "gluten-free", "halal", "kosher"], allergens: ["dairy"], low_fat: false,
    ingredients: [
      "150g Fresh Buffalo Mozzarella",
      "2 Heirloom Tomatoes",
      "Fresh Sweet Basil Leaves",
      "2 tbsp Extra Virgin Olive Oil & Aged Balsamic Glaze"
    ],
    instructions: [
      "Slice mozzarella and tomatoes into 1/2 inch thick rounds.",
      "Alternate mozzarella and tomato slices on a platter with basil leaves.",
      "Drizzle liberally with olive oil and aged balsamic glaze."
    ]
  },
  {
    id: "m20",
    name: "Provençal Herb Ratatouille",
    description: "Classic French countryside stew of layered eggplant, yellow squash, zucchini, bell peppers, and plum tomatoes baked with herbs de Provence.",
    image_url: "https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=800&q=80",
    calories: 180, fat_g: 7.0, protein_g: 5.0, carbs_g: 28.0,
    keywords: { countries: ["french"], cooking_methods: ["stew"], carbs: ["low-carbs"], protein: ["tofu"] },
    dietary_tags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "halal", "kosher"], allergens: [], low_fat: true,
    ingredients: [
      "1 Eggplant & 1 Zucchini & 1 Yellow Squash (sliced thinly)",
      "1 cup Tomato Garlic Pepper Sauce Base",
      "Herbs de Provence & Olive Oil"
    ],
    instructions: [
      "Spread tomato pepper sauce at the bottom of a baking dish.",
      "Arrange thinly sliced vegetables in an alternating accordion pattern.",
      "Drizzle olive oil, sprinkle Herbs de Provence, cover with parchment paper, and bake at 190°C for 40 minutes."
    ]
  },
  {
    id: "m21",
    name: "Spanish Seafood Paella",
    description: "Saffron Bomba rice slowly simmered with tiger prawns, blue mussels, calamari rings, green peas, and lemon wedges.",
    image_url: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80",
    calories: 560, fat_g: 16.0, protein_g: 34.0, carbs_g: 68.0,
    keywords: { countries: ["spanish"], cooking_methods: ["stew"], carbs: ["rice"], protein: ["seafood"] },
    dietary_tags: ["dairy-free", "gluten-free", "halal"], allergens: ["shellfish"], low_fat: true,
    ingredients: [
      "150g Bomba Spanish Rice",
      "4 Tiger Prawns, 4 Mussels & Calamari Rings",
      "Saffron Broth & Red Peppers",
      "Lemon Wedges"
    ],
    instructions: [
      "Sauté aromatics and Bomba rice in a wide paella pan.",
      "Pour saffron infused seafood stock; simmer uncovered without stirring.",
      "Nestle prawns, mussels, and calamari on top during final 10 minutes until cooked and crispy crust (socarrat) forms underneath."
    ]
  },

  // --- AMERICAN & NORDIC ---
  {
    id: "m22",
    name: "Grilled Salmon & Lemon Quinoa Bowl",
    description: "Wild-caught Atlantic salmon fillet flame-grilled, served over fluffy lemon dill quinoa and steamed asparagus spears.",
    image_url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    calories: 430, fat_g: 16.0, protein_g: 38.0, carbs_g: 32.0,
    keywords: { countries: ["american", "nordic"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["fish"] },
    dietary_tags: ["gluten-free", "dairy-free", "halal", "kosher"], allergens: [], low_fat: true,
    ingredients: [
      "180g Wild Atlantic Salmon Fillet",
      "1 cup Fluffy Cooked Quinoa",
      "1/2 bunch Steamed Asparagus",
      "Lemon Zest & Fresh Dill"
    ],
    instructions: [
      "Season salmon fillet with lemon juice, salt, and pepper; grill skin-side down for 4 minutes per side.",
      "Toss warm cooked quinoa with fresh dill, lemon zest, and olive oil.",
      "Plate quinoa base with asparagus spears and top with golden salmon."
    ]
  },
  {
    id: "m23",
    name: "Nordic Smoked Salmon Rye Toast",
    description: "Scandinavian dark rye bread spread with chive goat cheese, cold-smoked salmon slices, capers, and fresh dill sprigs.",
    image_url: "https://images.unsplash.com/photo-1626202378416-86f23a7c30a4?w=800&q=80",
    calories: 320, fat_g: 12.0, protein_g: 22.0, carbs_g: 32.0,
    keywords: { countries: ["nordic"], cooking_methods: ["smoke"], carbs: ["bread"], protein: ["fish"] },
    dietary_tags: ["kosher"], allergens: ["gluten", "dairy"], low_fat: true,
    ingredients: [
      "2 slices Dark Whole-grain Rye Bread",
      "100g Cold-smoked Salmon Slices",
      "30g Whipped Chive Goat Cheese",
      "Capers, Thin Red Onion & Dill"
    ],
    instructions: [
      "Lightly toast dark rye bread slices.",
      "Spread whipped chive cheese generously over toast.",
      "Layer cold-smoked salmon, capers, red onion slices, and fresh dill."
    ]
  },
  {
    id: "m24",
    name: "Lao Sticky Rice & Charred Pork Skewers",
    description: "Charcoal-grilled pork loin marinated with coriander root, garlic, and fish sauce, served with sticky rice and spicy jeow bong dip.",
    image_url: "https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&q=80",
    calories: 480, fat_g: 18.0, protein_g: 28.0, carbs_g: 50.0,
    keywords: { countries: ["laos"], cooking_methods: ["grill"], carbs: ["rice"], protein: ["pork"] },
    dietary_tags: ["dairy-free", "gluten-free"], allergens: [], low_fat: false,
    ingredients: [
      "4 Charred Pork Skewers",
      "1 Bamboo Basket Steamed Lao Sticky Rice",
      "Spicy Jeow Bong Paste & Fresh Cucumber Slices"
    ],
    instructions: [
      "Marinate pork strips in garlic, coriander root, soy sauce, and palm sugar; thread onto bamboo skewers.",
      "Grill over hot charcoal until caramelized.",
      "Serve hot with steamed sticky rice."
    ]
  }
];
