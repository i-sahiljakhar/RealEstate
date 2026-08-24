// import express from "express";
// import Chat from "../models/chat.model.js";
// import { protect } from "../middlewares/auth.middleware.js";

// const chatRouter = express.Router()

// chatRouter.use(protect);

// //to create a chat

// chatRouter.post("/start", async (req, res) => {
//   try {
//     const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;
//     let buyerId, finalSellerId;
//     if ((req, userRouter.role === "seller")) {
//       buyerId = providedBuyerId;
//       finalSellerId = req.user._id;
//     } else {
//       buyerId = req.user._id;
//       finalSellerId = sellerId;
//     }
//     if (!buyerId || !finalSellerId) {
//       return res.status(400).json({
//         message: "Missing buyer or seller Id ",
//       });
//     }
//     //check for an existing chat btw this buyer and seller
//     let chat = await Chat.findOne({
//       buyer: buyerId,
//       seller: finalSellerId,
//     });
//     if (!chat) {
//       chat = await Chat.create({
//         property: propertyId, //inital property context
//         buyer: buyerId,
//         seller: finalSellerId,
//         messages: [],
//       });
//     }
//     chat = await Chat.findById(chat._id)
//       .populate("buyer", "name email profilePic")
//       .populate("seller", "name email profilePic")
//       .populate("property", "title price images");
//     res.json(chat);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error creating chat or getting previous one",
//       error: err.message,
//     });
//   }
// });

// //to send message

// chatRouter.post("/send", async (req, res) => {
//   try {
//     const { chatId, text, image } = req.body;
//     const userId = req.user.id;

//     const chat = await Chat.findById(chatId);
//     if (!chat)
//       return res.status(404).json({
//         message: "Chat not found",
//       });

//     //ensure sender  is part of this chat
//     if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
//       return res.status(403).json({
//         message: "Not authorized to send messages in this chat",
//       });
//     }
//     // const newMessage = {
//     //     sender:userId,
//     //     text,
//     //     images,
//     //     createdAt = new Date()
//     // };
//     const newMessage = {
//       sender: userId,
//       text,
//       image,
//       createdAt: new Date(),
//     };
//     chat.message.push(newMessage);
//     await chat.save();

//     const savedMessage = chat.message[chat.message.length - 1];
//     res.json({ chat, newMessage: savedMessage });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error sending message",
//       error: err.message,
//     });
//   }
// });



// //to get chats  for user

// // chatRouter.get("/user", async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const chats = await Chat.find({
// //       $or: [{ buyer: userId }, { seller: userId }],
// //     })
// //       .populate("buyer", "name email profilePic")
// //       .populate("seller", "name email profilePic")
// //       .populate("property", "title price images")
// //       .sort({ updatedAt: -1 });
// //   } catch (err) {
// //     res.status(500).json({
// //       message: "Error fetching user chats",
// //       error: err.message,
// //     });
// //   }
// // });

// // ------------------------------------------

// // same code laken new version updated

// chatRouter.get("/user", async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const chats = await Chat.find({
//       $or: [{ buyer: userId }, { seller: userId }],
//     })
//       .populate("buyer", "name email profilePic")
//       .populate("seller", "name email profilePic")
//       .populate("property", "title price images")
//       .sort({ updatedAt: -1 });

//     res.status(200).json(chats);
//   } catch (err) {
//     console.error("Error fetching user chats:", err);

//     res.status(500).json({
//       message: "Error fetching user chats",
//       error: err.message,
//     });
//   }
// });

// //------------------------------------------




// //to get chat messages
// chatRouter.get("/:chatId", async (req, res) => {
//   try {
//     const chat = await Chat.findById(req.params.chatId).populate(
//       "message.sender",
//       "name profilePic",
//     );
//     if (!chat) return res.status(404).json({ message: "Chat not found" });
//     const userId = req.user._id.toString();
//     if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
//       return res.status(403).json({
//         message: "you are not  authorized",
//       });
//     }
//     res.json(chat);
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching chat message",
//       error: err.message,
//     });
//   }
// });

// //to delete an entire chat

// chatRouter.delete("/:chatId", async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const chat = await Chat.findById(req.params.chatId);

//     if (!chat) return res.status(404).json({ message: "Chat not found" });

//     //now we ensure the user is part of the chat
//     if (
//       chat.buyer.toString() !== userId.toString() &&
//       chat.seller.toString() !== userId.toString()
//     ) {
//       return res.status(403).json({ message: "Not authorized" });
//     }
//     await Chat.findByIdAndDelete(req.params.chatId);
//     res.json({ message: "Chat deleted successfully" });
//   } catch (err) {
//     res.status(500).json({
//       message: "error fetching chat message",
//       error: err.message,
//     });
//   }
// });

// // to delete a specific message

// chatRouter.delete("/:chatId/message/:messageId", async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const chat = await Chat.findById(req.params.chatId);

//     if (!chat) return res.status(404).json({ message: "Chat not found" });

//     const message = chat.message.id(req.params.messageId);
//     if (!message)
//       return res.status(404).json({
//         message: "message  not found",
//       });
//     //only sender  can delete their message
//     if (message.sender.toString() !== userId.toString()) {
//       return res.status(403).json({
//         message: "Not Authorized to delete  this message",
//       });
//     }
//     chat.message.pull(req.params.messageId);
//     await chat.save();
//     res.json({ message: "Message deleted successfully", chat });
//   } catch (err) {
//     res.status(500).json({
//       message: "Error fetching chat message",
//       error: err.message,
//     });
//   }
// });

// export default chatRouter;

//==============================================
//               updated code new version
//==============================================


import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();

chatRouter.use(protect);

// ==========================================
// CREATE / GET EXISTING CHAT
// ==========================================

chatRouter.post("/start", async (req, res) => {
  try {
    const {
      propertyId,
      sellerId,
      buyerId: providedBuyerId,
    } = req.body;

    let buyerId;
    let finalSellerId;

    // If logged-in user is seller
    if (req.user.role === "seller") {
      buyerId = providedBuyerId;
      finalSellerId = req.user._id;
    } else {
      // If logged-in user is buyer
      buyerId = req.user._id;
      finalSellerId = sellerId;
    }

    if (!buyerId || !finalSellerId) {
      return res.status(400).json({
        success: false,
        message: "Missing buyer or seller ID",
      });
    }

    // Check existing chat between buyer and seller
    let chat = await Chat.findOne({
      buyer: buyerId,
      seller: finalSellerId,
    });

    // Create new chat if it doesn't exist
    if (!chat) {
      chat = await Chat.create({
        property: propertyId,
        buyer: buyerId,
        seller: finalSellerId,
        message: [],
      });
    }

    // Populate chat data
    chat = await Chat.findById(chat._id)
      .populate("buyer", "name email phone profilePic")
      .populate("seller", "name email phone profilePic")
      .populate("property", "title price images");

    return res.status(200).json(chat);
  } catch (err) {
    console.error("ERROR STARTING CHAT:", err);

    return res.status(500).json({
      success: false,
      message: "Error creating chat or getting previous chat",
      error: err.message,
    });
  }
});

// ==========================================
// SEND MESSAGE
// ==========================================

chatRouter.post("/send", async (req, res) => {
  try {
    const { chatId, text, image } = req.body;

    const userId = req.user._id;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Ensure sender belongs to this chat
    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this chat",
      });
    }

    // Create new message
    const newMessage = {
      sender: userId,
      text: text || "",
      image: image || null,
      createdAt: new Date(),
    };

    // Add message
    chat.message.push(newMessage);

    await chat.save();

    const savedMessage =
      chat.message[chat.message.length - 1];

    return res.status(200).json({
      success: true,
      chat,
      newMessage: savedMessage,
    });
  } catch (err) {
    console.error("ERROR SENDING MESSAGE:", err);

    return res.status(500).json({
      success: false,
      message: "Error sending message",
      error: err.message,
    });
  }
});

// ==========================================
// GET ALL CHATS OF LOGGED-IN USER
// ==========================================

chatRouter.get("/user", async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({
      $or: [
        { buyer: userId },
        { seller: userId },
      ],
    })
      .populate("buyer", "name email phone profilePic")
      .populate("seller", "name email phone profilePic")
      .populate("property", "title price images")
      .sort({ updatedAt: -1 });

    return res.status(200).json(chats);
  } catch (err) {
    console.error("ERROR FETCHING USER CHATS:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching user chats",
      error: err.message,
    });
  }
});

// ==========================================
// GET SINGLE CHAT / MESSAGES
// ==========================================

chatRouter.get("/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(
      req.params.chatId
    )
      .populate(
        "buyer",
        "name email phone profilePic"
      )
      .populate(
        "seller",
        "name email phone profilePic"
      )
      .populate(
        "message.sender",
        "name profilePic"
      );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    const userId = req.user._id.toString();

    // Check authorization
    if (
      chat.buyer._id.toString() !== userId &&
      chat.seller._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized",
      });
    }

    return res.status(200).json(chat);
  } catch (err) {
    console.error("ERROR FETCHING CHAT:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching chat messages",
      error: err.message,
    });
  }
});

// ==========================================
// DELETE ENTIRE CHAT
// ==========================================

chatRouter.delete("/:chatId", async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await Chat.findById(
      req.params.chatId
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check user belongs to chat
    if (
      chat.buyer.toString() !== userId.toString() &&
      chat.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Chat.findByIdAndDelete(
      req.params.chatId
    );

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error("ERROR DELETING CHAT:", err);

    return res.status(500).json({
      success: false,
      message: "Error deleting chat",
      error: err.message,
    });
  }
});

// ==========================================
// DELETE SPECIFIC MESSAGE
// ==========================================

chatRouter.delete(
  "/:chatId/message/:messageId",
  async (req, res) => {
    try {
      const userId = req.user._id;

      const chat = await Chat.findById(
        req.params.chatId
      );

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }

      const message = chat.message.id(
        req.params.messageId
      );

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      // Only sender can delete message
      if (
        message.sender.toString() !==
        userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to delete this message",
        });
      }

      chat.message.pull(
        req.params.messageId
      );

      await chat.save();

      return res.status(200).json({
        success: true,
        message:
          "Message deleted successfully",
        chat,
      });
    } catch (err) {
      console.error(
        "ERROR DELETING MESSAGE:",
        err
      );

      return res.status(500).json({
        success: false,
        message: "Error deleting message",
        error: err.message,
      });
    }
  }
);

export default chatRouter;