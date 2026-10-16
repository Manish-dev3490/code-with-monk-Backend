const express = require("express");
const authValidation = require("../middlewares/auth");
const { sentRequestController, sentRequestController2, reviewRequestController } = require("../controllers/request");
const requestModel = require("../models/request");
const { default: mongoose } = require("mongoose");
const userModel = require("../models/user");
const requestRouter = express.Router();



requestRouter.post("/sent/interested/:toUserId", authValidation, sentRequestController);
requestRouter.post("/sent/ignored/:toUserId", authValidation, sentRequestController2);

// review accepted or rejected
requestRouter.post("/review/:status/:requestId", authValidation, reviewRequestController)

// recieved request api
requestRouter.get(
    "/received/:toUserId",
    authValidation,
    async (req, res) => {
        try {
            const { toUserId } = req.params;

            if (!mongoose.isObjectIdOrHexString(toUserId)) {
                return res.status(400).json({
                    message: "Invalid user ID",
                });
            }

            if (!req.user._id.equals(toUserId)) {
                return res.status(403).json({
                    message: "You can only view your own received requests",
                });
            }

            const requests = await requestModel
                .find({
                    toUserId: req.user._id,
                    status: "pending",
                })
                .populate("fromUserId", "firstName emailId")
                .populate("toUserId", "firstName emailId")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                message: "Received requests fetched successfully",
                requests,
            });
        } catch (error) {
            console.error("Fetch received requests failed:", error);

            return res.status(500).json({
                message: "Unable to fetch received requests",
            });
        }
    }
);

// api to see freinds/connections
requestRouter.get("/connections", authValidation, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const connections = await requestModel
            .find({
                status: "accepted",
                $or: [
                    { fromUserId: loggedInUserId },
                    { toUserId: loggedInUserId },
                ],
            })
            .populate("fromUserId", "firstName emailId problemSolved")
            .populate("toUserId", "firstName emailId problemSolved")
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            message: "Connections fetched successfully",
            connections,
        });
    } catch (error) {
        console.error("Fetch connections failed:", error);

        return res.status(500).json({
            message: "Unable to fetch connections",
        });
    }
});
requestRouter.get("/feed", authValidation, async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const requests = await requestModel
            .find({
                $or: [
                    { fromUserId: loggedInUserId },
                    { toUserId: loggedInUserId },
                ],
            })
            .select("fromUserId toUserId")
            .lean();

        const excludedUserIds = new Set([
            loggedInUserId.toString(),
        ]);

        for (const request of requests) {
            excludedUserIds.add(request.fromUserId.toString());
            excludedUserIds.add(request.toUserId.toString());
        }

        const users = await userModel
            .find({
                _id: {
                    $ne: loggedInUserId,
                    $nin: [...excludedUserIds],
                },
            })
            .select("_id firstName emailId problemSolved")
            .sort({ _id: -1 })
            .lean();

        return res.status(200).json({
            message: "Feed fetched successfully",
            users,
        });
    } catch (error) {
        console.error("Fetch feed failed:", error);

        return res.status(500).json({
            message: "Unable to fetch feed",
        });
    }
});

module.exports = requestRouter;