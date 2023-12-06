CREATE TABLE recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    prep_time INTEGER NOT NULL,
    cook_time INTEGER NOT NULL,
    servings INTEGER NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE recipe_steps (
    step_id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    step_description TEXT NOT NULL,
    step_image VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES recipes (id)
);

CREATE TABLE recipe_ingredients (
    ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES recipes (id)
);

INSERT INTO recipes (id, title, image, prep_time, cook_time, servings, description)
VALUES
(1, 'Pike Place Chowder', 'https://example.com/pike-place-chowder.jpg', 30, 45, 6, 'A rich and creamy seafood chowder inspired by the famous Pike Place Chowder in Seattle.');

INSERT INTO recipe_steps (recipe_id, step_number, step_description)
VALUES
(1, 1, 'In a large pot, melt butter over medium heat. Add onions, celery, carrots, and potatoes. Cook until softened, about 5 minutes.'),
(1, 2, 'Stir in flour and cook for another 2 minutes. Gradually add vegetable broth, stirring constantly.'),
(1, 3, 'Add mixed seafood and bring to a simmer. Cook for 20 minutes.'),
(1, 4, 'Stir in heavy cream, salt, and pepper. Simmer for another 10 minutes. Serve real hot.');

-- Inserting ingredients for Pike Place Chowder
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity)
VALUES
(1, 'mixed seafood', '1 lb'),
(1, 'vegetable broth', '4 cups'),
(1, 'heavy cream', '1 cup'),
(1, 'diced onions', '1/2 cup'),
(1, 'diced celery', '1/2 cup'),
(1, 'diced carrots', '1/2 cup'),
(1, 'diced potatoes', '1/2 cup'),
(1, 'butter', '1/4 cup'),
(1, 'all-purpose flour', '1/4 cup'),
(1, 'salt', 'to taste'),
(1, 'pepper', 'to taste');



INSERT INTO recipes (id, title, image, prep_time, cook_time, servings, description)
VALUES
(2, 'Action''s Dungeness Crab Cakes', 'https://example.com/actions-dungeness-crab-cakes.jpg', 20, 20, 4, 'These Dungeness crab cakes, man, they''re out of this world! I found them at a spot in Seattle, and they were so good I had to share the recipe.');

INSERT INTO recipe_steps (recipe_id, step_number, step_description)
VALUES
(2, 1, 'In a large bowl, mix together crab meat, panko breadcrumbs, mayonnaise, egg, parsley, Dijon mustard, Worcestershire sauce, Old Bay seasoning, salt, and black pepper.'),
(2, 2, 'Shape the mixture into 8 equal-sized patties.'),
(2, 3, 'Heat vegetable oil in a large skillet over medium heat.'),
(2, 4, 'Cook the crab cakes for 4-5 minutes per side until they are golden brown and crispy.'),
(2, 5, 'Serve with your favorite dipping sauce and enjoy!');

-- Inserting ingredients for Action's Dungeness Crab Cakes
INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity)
VALUES
(2, 'Dungeness crab meat', '1 lb'),
(2, 'panko breadcrumbs', '1/2 cup'),
(2, 'mayonnaise', '1/4 cup'),
(2, 'large egg', '1'),
(2, 'chopped fresh parsley', '2 tbsp'),
(2, 'Dijon mustard', '1 tbsp'),
(2, 'Worcestershire sauce', '1 tbsp'),
(2, 'Old Bay seasoning', '1 tsp'),
(2, 'salt', '1/4 tsp'),
(2, 'black pepper', '1/8 tsp'),
(2, 'vegetable oil', '2 tbsp');
