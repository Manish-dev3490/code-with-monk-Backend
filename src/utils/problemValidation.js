const axios = require("axios");

const JUDGE0_URL = "https://ce.judge0.com";

// Language mapping
const getLanguageById = (lang) => {

    const language = {
        c: 50,
        cpp: 54,
        java: 62,
        javascript: 102,
        python: 71
    };

    return language[lang.toLowerCase()];
};


// Small delay
const waiting = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


// Submit multiple testcases
const submitBatch = async (submissions) => {

    try {

        const response = await axios.post(
            `${JUDGE0_URL}/submissions/batch`,
            {
                submissions: submissions
            },
            {
                params: {
                    base64_encoded: false
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Judge0 Batch Response:");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.error(
            "Judge0 Submission Error:",
            error.response?.status,
            error.response?.data || error.message
        );

        throw error;
    }
};


// Poll submissions until all are finished
const submitToken = async (resultTokens) => {

    // resultTokens:
    // ["token1", "token2", "token3"]

    const tokenString = resultTokens.join(",");

    console.log("Polling tokens:", tokenString);

    while (true) {

        try {

            const response = await axios.get(
                `${JUDGE0_URL}/submissions/batch`,
                {
                    params: {
                        tokens: tokenString,
                        base64_encoded: false,
                        fields: "*"
                    }
                }
            );

            const results = response.data.submissions;

            console.log("Judge0 Results:");
            console.log(results);


            // status_id:
            // 1 = In Queue
            // 2 = Processing
            // 3 = Accepted
            // 4 = Wrong Answer
            // 5 = Time Limit Exceeded
            // 6 = Compilation Error
            // etc.

            const allFinished = results.every(
                result => result.status_id > 2
            );


            if (allFinished) {

                return results;

            }


            console.log("Still processing...");

            await waiting(1000);

        } catch (error) {

            console.error(
                "Polling Error:",
                error.response?.status,
                error.response?.data || error.message
            );

            throw error;
        }
    }
};


module.exports = {
    getLanguageById,
    submitBatch,
    submitToken
};