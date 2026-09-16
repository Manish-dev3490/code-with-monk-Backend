const problemModel = require("../models/problem");
const userModel = require("../models/user");

const {
    getLanguageById,
    submitBatch,
    submitToken
} = require("../utils/problemValidation");



// CREATE PROBLEM
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


            const resultTokens =
                submitResult.map(
                    submission => submission.token
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

            const testResult = await submitToken(resultTokens);



            for (
                let i = 0;
                i < testResult.length;
                i++
            ) {

                const result = testResult[i];





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
        }



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


// update problem 
async function problemUpdationMethod(req, res) {
    try {
        console.log(req.params);

        const { _id } = req.params;
        if (!_id) return res.status(400).send("_id is missing");
        const doesProblemexist = await problemModel.findById(_id);
        if (!doesProblemexist) return res.status(404).send("problem does not exist in database");
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



        // BASIC VALIDATION


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


        // TEST EVERY REFERENCE SOLUTION
        for (const solution of refrenceSolution) {

            const {
                language,
                completeCode
            } = solution;




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



            console.log(testResult);


            // -----------------------------------------
            // CHECK RESULTS
            // -----------------------------------------

            for (
                let i = 0;
                i < testResult.length;
                i++
            ) {

                const result = testResult[i];





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

        const newproblem = await problemModel.findByIdAndUpdate(_id, { ...req.body }, { runValidators: true, new: true })

        res.status(200).send(newproblem);

    }
    catch (error) {
        res.status(400).send("error is" + error);
    }
}


// delete problem
async function problemDeletionMethod(req, res) {
    try {
        const { _id } = req.params;
        if (!_id) return res.status(400).send("_id is missing");
        const doesProblemexist = await problemModel.findById(_id);
        if (!doesProblemexist) return res.status(404).send("problem does not exist in database");

        const deletedProblem = await problemModel.findByIdAndDelete(_id);
        res.status(200).send("your problem is deleted successfully");
    }
    catch (error) {
        res.status(500).send("error is :" + error);
    }
}


// get problem by id
async function getProblemMethod(req, res) {
    try {

        const { _id } = req.params;
        if (!_id) return res.status(400).send("_id is missing");
        const problem = await problemModel.findById(_id).
            select('title tags description visibleTestCases difficultyLevel');
        if (!problem) return res.status(404).send("problem does not exist in database");


        res.status(200).send("your problem is fetched successfully", problem);
    }
    catch (error) {
        res.status(500).send("error is : " + error);
    }
}

// get all problem
async function getAllProblemMethod(req, res) {
    try {
        const problems = await problemModel.find({});

        res.status(200).json({
            message: "Problems fetched successfully",
            data: problems,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Something went wrong",
            error: error.message,
        });
    }
}


// get allproblemSolvedByUser
async function fetchProblemsSolvedByUserdMethod(req, res) {

    try {

        const user = await userModel
            .findById(req.user._id)
            .populate({
                path: "problemSolved",
                select: "title difficultyLevel tags description"
            });

        res.status(200).send(user.problemSolved);
    }
    catch (error) {
        console.log(error);
        res.status(500).send("error occured");
    }
};

module.exports = {
    problemCreationMethod, problemUpdationMethod, problemDeletionMethod, getProblemMethod, getAllProblemMethod, fetchProblemsSolvedByUserdMethod
};