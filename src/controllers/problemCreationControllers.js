const problemModel = require("../models/problem");

const {
    getLanguageById,
    submitBatch,
    submitToken
} = require("../utils/problemValidation");


// -----------------------------------------
// CREATE PROBLEM
// -----------------------------------------

async function problemCreationMethod(req, res) {

    try {

        const {
            title,
            description,
            tags,
            difficultyLevel,
            visibleTestCases,
            hiddenTestCases,
            refrenceSolution,
            initialCode
        } = req.body;


        // -----------------------------------------
        // BASIC VALIDATION
        // -----------------------------------------

        if (!title) {
            return res.status(400).json({
                message: "Title is required"
            });
        }


        if (!description) {
            return res.status(400).json({
                message: "Description is required"
            });
        }


        if (
            !hiddenTestCases ||
            hiddenTestCases.length === 0
        ) {
            return res.status(400).json({
                message: "Hidden testcases are required"
            });
        }


        if (
            !refrenceSolution ||
            refrenceSolution.length === 0
        ) {
            return res.status(400).json({
                message: "Reference solution is required"
            });
        }



        // -----------------------------------------
        // TEST EVERY REFERENCE SOLUTION
        // -----------------------------------------

        for (const solution of refrenceSolution) {

            const {
                language,
                completeCode
            } = solution;


            console.log("--------------------------------");
            console.log("Language:", language);
            console.log("Complete Code:");
            console.log(completeCode);
            console.log("--------------------------------");


            // -----------------------------------------
            // GET LANGUAGE ID
            // -----------------------------------------

            const languageId =
                getLanguageById(language);


            if (!languageId) {

                return res.status(400).json({
                    message: `Unsupported language: ${language}`
                });

            }


            console.log(
                "Judge0 Language ID:",
                languageId
            );



            // -----------------------------------------
            // CREATE SUBMISSIONS
            // -----------------------------------------

            const submissions =
                hiddenTestCases.map(testcase => {

                    return {

                        source_code: completeCode,

                        language_id: languageId,

                        stdin: testcase.input,

                        expected_output: testcase.output

                    };

                });


            console.log(
                "Number of submissions:",
                submissions.length
            );



            // -----------------------------------------
            // SEND TO JUDGE0
            // -----------------------------------------

            const submitResult =
                await submitBatch(submissions);


            if (
                !submitResult ||
                !Array.isArray(submitResult)
            ) {

                return res.status(500).json({
                    message: "Invalid response from Judge0"
                });

            }



            // -----------------------------------------
            // GET TOKENS
            // -----------------------------------------

            const resultTokens =
                submitResult.map(
                    submission => submission.token
                );


            console.log(
                "Tokens:",
                resultTokens
            );


            if (
                resultTokens.length !==
                hiddenTestCases.length
            ) {

                return res.status(500).json({
                    message:
                        "Judge0 did not return all tokens"
                });

            }



            // -----------------------------------------
            // POLL RESULTS
            // -----------------------------------------

            const testResult =
                await submitToken(resultTokens);



            // -----------------------------------------
            // CHECK RESULTS
            // -----------------------------------------

            for (
                let i = 0;
                i < testResult.length;
                i++
            ) {

                const result = testResult[i];


                console.log(
                    `Testcase ${i + 1}:`,
                    result.status
                );


                // Accepted = 3

                if (result.status_id !== 3) {

                    return res.status(400).json({

                        message:
                            `Reference solution failed for ${language}`,

                        testcase:
                            i + 1,

                        status:
                            result.status?.description,

                        stdout:
                            result.stdout,

                        stderr:
                            result.stderr,

                        compile_output:
                            result.compile_output

                    });

                }

            }


            console.log(
                `All hidden testcases passed for ${language}`
            );

        }



        // -----------------------------------------
        // SAVE PROBLEM
        // -----------------------------------------

        const userProblem =
            await problemModel.create({

                title,

                description,

                tags,

                difficultyLevel,

                visibleTestCases,

                hiddenTestCases,

                refrenceSolution,

                initialCode,

                problemCreator: req.user._id

            });



        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        return res.status(201).json({

            message:
                "Problem Saved Successfully",

            problem:
                userProblem

        });


    } catch (error) {

        console.error(
            "Problem Creation Error:",
            error
        );


        return res.status(500).json({

            message:
                "Error while creating problem",

            error:
                error.response?.data ||
                error.message

        });

    }

}


module.exports = {
    problemCreationMethod
};