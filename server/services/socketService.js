import { Server } from "socket.io";
import Auction from "../models/Auction.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join Auction Room
    socket.on("join_auction", (auctionId) => {
      socket.join(auctionId);
      console.log(`User ${socket.id} joined auction ${auctionId}`);
    });

    // Leave Auction Room
    socket.on("leave_auction", (auctionId) => {
      socket.leave(auctionId);
      console.log(`User ${socket.id} left auction ${auctionId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
