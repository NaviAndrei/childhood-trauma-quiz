// Defines the structure for the calculation input
type CtqAnswerInput = {
    questionId: number; // The ID of the question from the database
    value: number; // The raw score (1-5) for the answer
};

// Defines the scales used in CTQ-SF
export type CtqScale = 
    | 'emotional_abuse'
    | 'physical_abuse'
    | 'sexual_abuse'
    | 'emotional_neglect'
    | 'physical_neglect';
    // | 'minimization_denial'; // Optional scale

// Defines the severity levels
type SeverityLevel = 'None' | 'Low' | 'Moderate' | 'Severe';

// Defines the structure of the results object
export type CtqResult = {
    scores: Record<CtqScale, number>;
    severity: Record<CtqScale, SeverityLevel>;
    totalScore: number;
    minimizationScore?: number; // Optional - Uncommented
};

// --- Standard CTQ-SF Scoring Configuration --- 

// **IMPORTANT**: Verify this mapping matches your question IDs/order to standard CTQ items.
// Using the example mapping from comments. Assumes questionId corresponds to the item number.
const QUESTION_TO_SCALE_MAPPING: Record<number, CtqScale> = {
  // Emotional Abuse (EA): Items 3, 8, 14, 18, 25
  3: 'emotional_abuse', 8: 'emotional_abuse', 14: 'emotional_abuse', 18: 'emotional_abuse', 25: 'emotional_abuse',
  // Physical Abuse (PA): Items 9, 11, 12, 15, 17
  9: 'physical_abuse', 11: 'physical_abuse', 12: 'physical_abuse', 15: 'physical_abuse', 17: 'physical_abuse',
  // Sexual Abuse (SA): Items 20, 21, 23, 24, 27
  20: 'sexual_abuse', 21: 'sexual_abuse', 23: 'sexual_abuse', 24: 'sexual_abuse', 27: 'sexual_abuse',
  // Emotional Neglect (EN): Items 5, 7, 13, 19, 28
  5: 'emotional_neglect', 7: 'emotional_neglect', 13: 'emotional_neglect', 19: 'emotional_neglect', 28: 'emotional_neglect',
  // Physical Neglect (PN): Items 1, 2, 4, 6, 26
  1: 'physical_neglect', 2: 'physical_neglect', 4: 'physical_neglect', 6: 'physical_neglect', 26: 'physical_neglect',
  // Minimization/Denial items (10, 16, 22) are often excluded or analyzed separately
};

// Severity Cutoffs (Example from comments - Verify with source documentation)
const SEVERITY_CUTOFFS: Record<CtqScale, { low: number; moderate: number; severe: number }> = {
  emotional_abuse:   { low: 9,  moderate: 13, severe: 16 }, // Example adjusted based on common use (often >8, >12, >15)
  physical_abuse:    { low: 8,  moderate: 10, severe: 13 }, // Example adjusted based on common use (often >7, >9, >12)
  sexual_abuse:      { low: 6,  moderate: 8,  severe: 13 }, // Example adjusted based on common use (often >5, >7, >12)
  emotional_neglect: { low: 10, moderate: 15, severe: 18 }, // Example adjusted based on common use (often >9, >14, >17)
  physical_neglect:  { low: 8,  moderate: 10, severe: 13 }, // Example adjusted based on common use (often >7, >9, >12)
};

// Function to determine severity based on score and cutoffs
function getSeverity(scale: CtqScale, score: number): SeverityLevel {
    const cutoffs = SEVERITY_CUTOFFS[scale];
    if (score >= cutoffs.severe) return 'Severe';
    if (score >= cutoffs.moderate) return 'Moderate';
    if (score >= cutoffs.low) return 'Low';
    return 'None';
}

/**
 * Calculates CTQ-SF scores and severity based on user answers.
 * Assumes standard 5-point Likert scoring (1-5) and the defined item mapping and cutoffs.
 *
 * @param answers Array of user answers with question IDs and selected values (1-5).
 * @returns CtqResult object with scores and severity levels per scale.
 */
export function calculateCtqScores(answers: CtqAnswerInput[]): CtqResult {
    // Initialize scores for each scale
    const scaleScores: Record<CtqScale, number> = {
        emotional_abuse: 0,
        physical_abuse: 0,
        sexual_abuse: 0,
        emotional_neglect: 0,
        physical_neglect: 0,
    };
    let minimizationScore = 0; // Initialize minimization score
    const minimizationQuestionIds = [10, 16, 22]; // Define minimization question IDs

    // Sum scores for each scale based on the mapping
    for (const answer of answers) {
        // Ensure value is within expected range (1-5), default to 0 if not?
        const scoreValue = (answer.value >= 1 && answer.value <= 5) ? answer.value : 0;
        if (scoreValue === 0) {
            console.warn(`Invalid score value ${answer.value} for question ID ${answer.questionId}. Treating as 0.`);
        }
        
        const scale = QUESTION_TO_SCALE_MAPPING[answer.questionId];
        if (scale) {
            scaleScores[scale] += scoreValue;
        } else if (minimizationQuestionIds.includes(answer.questionId)) {
            // Handle Minimization/Denial Score
            // CTQ Minimization/Denial scoring is often reverse-coded (6 - score)
            // Example: If score is 5 ("Very Often True"), it counts as 1 point for denial.
            // If score is 1 ("Never True"), it counts as 5 points (low denial).
            // We sum the *raw* scores here as per screenshot, but comment on standard scoring.
            minimizationScore += scoreValue; 
            // Standard scoring might be: minimizationScore += (6 - scoreValue);
        }
         // else {
         //     console.warn(`Question ID ${answer.questionId} not found in CTQ-SF mapping or minimization set.`);
         // }
    }

    // Determine severity for each scale
    const scaleSeverity: Record<CtqScale, SeverityLevel> = {
        emotional_abuse: getSeverity('emotional_abuse', scaleScores.emotional_abuse),
        physical_abuse: getSeverity('physical_abuse', scaleScores.physical_abuse),
        sexual_abuse: getSeverity('sexual_abuse', scaleScores.sexual_abuse),
        emotional_neglect: getSeverity('emotional_neglect', scaleScores.emotional_neglect),
        physical_neglect: getSeverity('physical_neglect', scaleScores.physical_neglect),
    };

    // Calculate total score (sum of all main scale scores)
    const totalScore = Object.values(scaleScores).reduce((sum, score) => sum + score, 0);

    const results: CtqResult = {
        scores: scaleScores,
        severity: scaleSeverity,
        totalScore: totalScore,
        minimizationScore: minimizationScore, // Include minimization score
    };

    console.log('Calculated CTQ Scores:', results);
    return results;
} 