

const mongoose = require("mongoose");
const requestModel = require("../models/request");
const userModel = require("../models/user");

const sentRequestController = async (req, res) => {
  try {
    const { toUserId } = req.params;
    const fromUserId = req.user._id;

    // Invalid ID ko database query se pehle reject karo
    if (!mongoose.isObjectIdOrHexString(toUserId)) {
      return res.status(400).json({
        message: "Invalid receiver ID",
      });
    }

    // 1. Khud ko request nahi bhej sakte
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself",
      });
    }

    // 2. Dono directions mein existing request check karo
    const existingRequest = await requestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "A connection request already exists between these users",
      });
    }

    // 3. Receiver database mein exist karna chahiye
    const receiver = await userModel.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    // 4. Request create karo
    const connectionRequest = await requestModel.create({
      fromUserId,
      toUserId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Connection request sent successfully",
      request: connectionRequest,
    });
  } catch (error) {
    console.error("Send connection request failed:", error);

    return res.status(500).json({
      message: "Unable to send connection request",
    });
  }
};


const sentRequestController2 = async (req, res) => {
  try {
    const { toUserId } = req.params;
    const fromUserId = req.user._id;

    // Invalid ID ko database query se pehle reject karo
    if (!mongoose.isObjectIdOrHexString(toUserId)) {
      return res.status(400).json({
        message: "Invalid receiver ID",
      });
    }

    // 1. Khud ko request nahi bhej sakte
    if (fromUserId.toString() === toUserId) {
      return res.status(400).json({
        message: "You cannot send a connection request to yourself",
      });
    }

    // 2. Dono directions mein existing request check karo
    const existingRequest = await requestModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return res.status(409).json({
        message: "A connection request already exists between these users",
      });
    }

    // 3. Receiver database mein exist karna chahiye
    const receiver = await userModel.findById(toUserId);

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    // 4. Request create karo
    const connectionRequest = await requestModel.create({
      fromUserId,
      toUserId,
      status: "ignored",
    });

    return res.status(201).json({
      message: "you have ignored them successfully",
      request: connectionRequest,
    });
  } catch (error) {
    console.error("Send connection request failed:", error);

    return res.status(500).json({
      message: "Unable to ignore connection request",
    });
  }
};


const reviewRequestController = async (req, res) => {
  try {
    const { requestId ,status} = req.params;
    const loggedInUserId = req.user._id;

    // Sirf accept ya reject allow karo
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected",
      });
    }

    if (!mongoose.isObjectIdOrHexString(requestId)) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    // Matching pending request ko ek hi operation mein update karo
    const updatedRequest = await requestModel.findOneAndUpdate(
      {
        _id: requestId,
        toUserId: loggedInUserId,
        status: "pending",
      },
      {
        $set: { status },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedRequest) {
      return res.status(404).json({
        message: "No pending request found for you with this ID",
      });
    }

    return res.status(200).json({
      message: `Connection request ${status}`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Review connection request failed:", error);

    return res.status(500).json({
      message: "Unable to review connection request",
    });
  }

}



module.exports = { sentRequestController, sentRequestController2, reviewRequestController }