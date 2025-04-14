require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Supabase URL or Service Key not found in .env file");
    process.exit(1); // Exit if keys are not found
}
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Quiz App Backend is running!');
});

// --- Quiz Submission Endpoint ---
app.post('/api/quiz/submit', async (req, res, next) => { // Added next for error handling
    console.log("Received submission:", req.body);
    const { quizId, answers } = req.body; // Assuming quizId and answers [{ question_id, selected_option_id }]

    if (!quizId || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({ message: "Missing quizId or answers in request body" });
    }

    try {
        // 1. & 4. Fetch scores for selected options
        // Get all selected option IDs
        const selectedOptionIds = answers.map(a => a.selected_option_id);

        // Fetch the corresponding answer options from Supabase
        const { data: optionsData, error: optionsError } = await supabase
            .from('answer_options')
            .select('id, value')
            .in('id', selectedOptionIds);

        if (optionsError) {
            console.error("Supabase error fetching options:", optionsError);
            throw new Error('Failed to fetch answer options'); // Throw error to be caught by handler
        }

        if (!optionsData || optionsData.length !== selectedOptionIds.length) {
            // Handle cases where some options weren't found (potential invalid input)
            console.warn("Warning: Not all selected options found in DB", { selectedOptionIds, optionsData });
            // Depending on requirements, you might return an error or proceed with found options
            // For now, let's proceed but this might indicate an issue.
        }

        // Create a map for quick score lookup
        const scoreMap = optionsData.reduce((map, option) => {
            map[option.id] = option.value; // Store the raw value first
            return map;
        }, {});
        console.log("Score Map:", scoreMap); // Log the created map

        // 5. Calculate total score
        let calculatedScore = 0;
        for (const answer of answers) {
            const rawScore = scoreMap[answer.selected_option_id];
            console.log(`Processing option ${answer.selected_option_id}: Raw score = ${rawScore} (Type: ${typeof rawScore})`); // Log raw score and type

            // Attempt to parse the score to a number
            const score = parseInt(rawScore, 10); // Use parseInt for whole numbers

            // Check if parsing was successful (result is not NaN)
            if (!isNaN(score)) {
                calculatedScore += score;
                console.log(`  Added ${score} to total. New total: ${calculatedScore}`); // Log successful addition
            } else {
                 // Handle case where an option ID from input wasn't in the DB response OR parsing failed
                console.warn(`  Score could not be parsed to a number for option ID: ${answer.selected_option_id} (Raw value: ${rawScore})`);
                 // Decide how to handle this: error out, skip, or assign default score?
                 // Skipping as before.
            }
        }
        console.log("Final Calculated Score:", calculatedScore); // Log final score

        // 6. Determine result category
        let determinedCategory;
        if (calculatedScore >= 0 && calculatedScore <= 3) {
            determinedCategory = "Low";
        } else if (calculatedScore >= 4 && calculatedScore <= 7) {
            determinedCategory = "Medium";
        } else if (calculatedScore >= 8) { // Assuming 8-10+ maps to High based on plan (0-3, 4-7, 8-10)
            determinedCategory = "High";
        } else {
            determinedCategory = "Unknown"; // Should not happen with valid scores
        }

        // --- Optional Steps (Not implemented yet, as per plan) ---
        // 2. (Optional) Create user_quiz_session
        // 3. (Optional) Insert answers into user_answers
        // 7. (Optional) Update user_quiz_session
        // ----------------------------------------------------------

        // 8. Respond with { score, result_category }
        res.status(200).json({ score: calculatedScore, result_category: determinedCategory });

    } catch (error) {
        console.error("Error processing quiz submission:", error);
        // Pass the error to the error handling middleware
        next(error);
    }
});

// --- Error Handling Middleware (Improved) ---
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    // Send a more generic error message to the client
    res.status(500).json({ message: err.message || 'An internal server error occurred' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
}); 