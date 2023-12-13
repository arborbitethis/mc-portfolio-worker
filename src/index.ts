
export interface Env {
    DB: D1Database;
    LCCBBucket: R2Bucket
}


export default {
    async fetch(request: Request, env: Env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        const requestOrigin = request.headers.get("Origin");
        const allowedOrigins = ["https://www.lilycancookbetter.com", "https://lilycancookbetter.com"];

        let corsHeaders = {
            "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        };

        // Set the Access-Control-Allow-Origin dynamically
        if (allowedOrigins.includes(requestOrigin)) {
            corsHeaders["Access-Control-Allow-Origin"] = requestOrigin;
        }


        // Route for fetching all recipes
        if (pathname === "/api/recipes") {
            const { results } = await env.DB.prepare("SELECT * FROM recipes").all();

            const transformedResults = results.map(item => {
                return {
                    ...item, // copy all existing properties
                    prepTime: item.prep_time, // rename prep_time to prepTime
                    cookTime: item.cook_time, // rename cook_time to cookTime
                    prep_time: undefined, // remove original prep_time
                    cook_time: undefined  // remove original cook_time
                };
            });

            return new Response(JSON.stringify(transformedResults), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        // Route to update an existing recipe
        const putMatch = pathname.match(/^\/api\/recipe\/(\d+)$/);
        if (putMatch && request.method === "PUT") {
            const recipeId = putMatch[1];
            const requestData = await request.json();

            // Validate request data
            // Add validation as needed

            // Update the recipe
            await env.DB.prepare("UPDATE recipes SET title = ?, image = ?, prep_time = ?, cook_time = ?, servings = ?, description = ? WHERE id = ?")
                .bind(requestData.title, requestData.image, requestData.prep_time, requestData.cook_time, requestData.servings, requestData.description, recipeId)
                .run();

            // Delete all existing ingredients and steps for the recipe
            await env.DB.prepare("DELETE FROM recipe_ingredients WHERE recipe_id = ?").bind(recipeId).run();
            await env.DB.prepare("DELETE FROM recipe_steps WHERE recipe_id = ?").bind(recipeId).run();

            // Add new ingredients
            // Assuming requestData.ingredients is an array of {ingredient_name, quantity}
            for (const ingredient of requestData.ingredients) {
                await env.DB.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity) VALUES (?, ?, ?)")
                    .bind(recipeId, ingredient.ingredient_name, ingredient.quantity)
                    .run();
            }

            // Add new steps
            // Assuming requestData.steps is an array of {step_number, step_description}
            for (const step of requestData.steps) {
                await env.DB.prepare("INSERT INTO recipe_steps (recipe_id, step_number, step_description) VALUES (?, ?, ?)")
                    .bind(recipeId, step.step_number, step.step_description)
                    .run();
            }

            return new Response("Recipe updated successfully", { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }


        // Route for fetching a specific recipe with its ingredients and steps
        const match = pathname.match(/^\/api\/recipe\/(\d+)$/);
        if (match) {
            const recipeId = match[1];

            // Fetching the recipe
            const recipeQuery = await env.DB.prepare("SELECT * FROM recipes WHERE id = ?").bind(recipeId).all();

            // Fetching ingredients for the recipe
            const ingredientsQuery = await env.DB.prepare("SELECT * FROM recipe_ingredients WHERE recipe_id = ?").bind(recipeId).all();

            // Fetching steps for the recipe
            const stepsQuery = await env.DB.prepare("SELECT * FROM recipe_steps WHERE recipe_id = ?").bind(recipeId).all();

            const response = {
                recipe: recipeQuery.results,
                ingredients: ingredientsQuery.results,
                steps: stepsQuery.results
            };

            return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }


        // Route to insert a new recipe
        if (pathname === "/api/recipe" && request.method === "POST") {
            const requestData = await request.json();

            // Validate request data
            if (!requestData.title || !requestData.ingredients || !requestData.steps || requestData.ingredients.length === 0 || requestData.steps.length === 0) {
                return new Response("Recipe must have a title, at least one ingredient, and one step.", { status: 400 });
            }

            // Insert the recipe
            const recipeResult = await env.DB.prepare("INSERT INTO recipes (title, image, prep_time, cook_time, servings, description) VALUES (?, ?, ?, ?, ?, ?)")
                .bind(requestData.title, requestData.image, requestData.prep_time, requestData.cook_time, requestData.servings, requestData.description)
                .run();

            // Get the inserted recipe ID
            const recipeId = recipeResult.lastInsertId;

            // Insert ingredients
            for (const ingredient of requestData.ingredients) {
                await env.DB.prepare("INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity) VALUES (?, ?, ?)")
                    .bind(recipeId, ingredient.name, ingredient.quantity)
                    .run();
            }

            // Insert steps
            for (const step of requestData.steps) {
                await env.DB.prepare("INSERT INTO recipe_steps (recipe_id, step_number, step_description) VALUES (?, ?, ?)")
                    .bind(recipeId, step.number, step.description)
                    .run();
            }

            return new Response("Recipe created successfully", { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        if (pathname === "/api/uploadimage" && request.method === "POST") {
            const url = new URL(request.url);
  
            // Handle the file upload from FormData
            // Assuming the image is being sent as 'file'
            const formData = await request.formData();
            const imageFile = formData.get('image');
            const stepId = formData.get('stepId');
            const recipeId = formData.get('recipeId');

            const key = `images/${recipeId}/${stepId}`;
            
            // Create multipart upload
            const multipartUpload = await env.LCCBBucket.createMultipartUpload(key);

            // Upload the image part
            const uploadedPart = await multipartUpload.uploadPart(1, imageFile);

            // Complete the multipart upload
            const object = await multipartUpload.complete([uploadedPart]);

            return new Response(JSON.stringify({ key: object.key, etag: object.httpEtag }), { 
                status: 200, 
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        // Default response if no route is matched
        return new Response("Default response / No path hit", { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    },
};
