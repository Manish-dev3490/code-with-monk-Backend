const problemModel = require("../models/problem");
const { submissionModel } = require("../models/submission");
const {submitBatch,submitToken,getLanguageById} =require("../utils/problemValidation")

const codeSubmitController = async (req, res) => {
    try {
        const problemId = req.params._id;
        const userId = req.user._id;

        const { language, sourceCode } = req.body;

        if (!problemId || !userId || !language || !sourceCode) {
            return res.status(400).send("some fields are missing");
        }

        const problem = await problemModel.findById(problemId);

        if (!problem) {
            return res.status(404).send("problem is not found in database");
        }

        const languageId = getLanguageById(language);

        const submittedResult = await submissionModel.create({
            userId,
            problemId,
            language: language,
            code: sourceCode,
            testCasesTotal: problem.hiddenTestCases.length,
            status: "pending",
            testCasesPassed: 0
        });

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        // 1. Submit all test cases
        const submitResult = await submitBatch(submissions);

        // 2. Extract tokens
        const resultTokens = submitResult.map(
            submission => submission.token
        );

        console.log("TOKENS:", resultTokens);

        // 3. Get actual results from Judge0
        const results = await submitToken(resultTokens);

        console.log("RESULTS:", results);

        let runtime = 0;
        let memory = 0;
        let testCasesPassed = 0;
        let errorMessage = null;
        let status = "accepted";

        // 4. Process actual results
        for (const test of results) {

            if (test.status_id === 3) {

                testCasesPassed++;

                if (test.time) {
                    runtime += parseFloat(test.time);
                }

                if (test.memory) {
                    memory = Math.max(memory, test.memory);
                }

            } else {

                if (test.status_id === 4) {
                    status = "wrong";
                    errorMessage = test.stderr || "Wrong Answer";
                } 
                else {
                    status = "error";
                    errorMessage =
                        test.stderr ||
                        test.compile_output ||
                        "Execution Error";
                }
            }
        }

        // 5. Update DB
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        submittedResult.status = status;
        submittedResult.errorMessage = errorMessage;
        submittedResult.testCasesPassed = testCasesPassed;

        await submittedResult.save();

        console.log(submittedResult);

        if(!req.user.problemSolved.includes(problemId) && submittedResult.status==="accepted"){
            req.user.problemSolved.push(problemId);
            await req.user.save();
        }
        
        return res.status(201).json({
            message: "your submission is created successfully",
            submission: submittedResult
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "error",
            error: error.message
        });
    }
};


const codeRunController = async (req, res) => {
     try {
        const problemId = req.params._id;
        const userId = req.user._id;

        const { language, sourceCode } = req.body;

        if (!problemId || !userId || !language || !sourceCode) {
            return res.status(400).send("some fields are missing");
        }

        const problem = await problemModel.findById(problemId);

        if (!problem) {
            return res.status(404).send("problem is not found in database");
        }

        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        // 1. Submit all test cases
        const submitResult = await submitBatch(submissions);

        // 2. Extract tokens
        const resultTokens = submitResult.map(
            submission => submission.token
        );

        console.log("TOKENS:", resultTokens);

        // 3. Get actual results from Judge0
        const results = await submitToken(resultTokens);

     
        console.log(results);

       
        
        return res.status(201).json({
            message: "your code is runned successfully",
            results
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "error",
            error: error.message
        });
    }
};

module.exports = { codeRunController, codeSubmitController };
