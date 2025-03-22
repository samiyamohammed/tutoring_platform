const ChatService = require("./ChatService");
const Message = require("../../domain/models/Message");

jest.mock("../../domain/models/Message"); // Mock the MessageModel
jest.mock("../../infrastructure/config/socketConfig", () => ({
  getIO: () => ({
    to: jest.fn().mockReturnThis(), // Mock the WebSocket `to()` method for room targeting
    emit: jest.fn(), // Mock the WebSocket `emit()` method for broadcasting
  }),
}));

describe("ChatService", () => {
  let io;
  let messageData;

  beforeEach(() => {
    io = require("../../infrastructure/config/socketConfig").getIO(); // Get mocked IO
    messageData = {
      roomId: "room123",
      senderId: "user1",
      content: "Hello, World!",
      timestamp: new Date(),
    };
  });

  test("should save the message to the database and broadcast it to the room", async () => {
    // Mock MessageModel.create to simulate DB save
    Message.create.mockResolvedValue(messageData);

    await ChatService.sendMessage(io, messageData);

    // Verify that the message was saved to the database
    expect(Message.create).toHaveBeenCalledWith(messageData);

    // Verify that the message was broadcasted to the chat room
    expect(io.to).toHaveBeenCalledWith(messageData.roomId);
    expect(io.emit).toHaveBeenCalledWith("receiveMessage", messageData);
  });

  test("should throw error if the message fails to save", async () => {
    Message.create.mockRejectedValue(new Error("Database error"));

    await expect(ChatService.sendMessage(io, messageData)).rejects.toThrow("Database error");
  });
});
