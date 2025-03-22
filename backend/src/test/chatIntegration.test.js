import http from "http";
import { Server } from "socket.io";
import { init } from "../infrastructure/config/socketConfig";
import app from "../index"; // Import app, not index.js

let server;
let io;
let clientSocket1;
let clientSocket2;

beforeAll((done) => {
  server = http.createServer(app);
  io = new Server(server);

  // Initialize WebSocket server
  init(server);

  server.listen(3001, () => {
    console.log("✅ Testing server running on port 3001");
    setTimeout(done, 2000); // Give the server extra time to start
  });
});

afterEach(() => {
  if (clientSocket1) clientSocket1.disconnect();
  if (clientSocket2) clientSocket2.disconnect();
});

afterAll((done) => {
  io.close();
  server.close(done);
});

describe("Chat System", () => {
  test("should allow a user to join the chat room", (done) => {
    clientSocket1 = require("socket.io-client")("http://localhost:3001");

    clientSocket1.on("connect", () => {
      console.log("🔵 Client 1 connected.");
      clientSocket1.emit("joinRoom", "room123");
    });

    clientSocket1.on("joinRoomSuccess", (message) => {
      console.log("✅ Received:", message);
      expect(message).toBe("Successfully joined room123");
      done();
    });

    clientSocket1.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      done(error);
    });
  }, 15000);
});
