import ChatDAO from "../dao/mongomanagers/messageManagerMongo.js";
import ChatRepository from "../repositories/chat.repository.js";

export const ChatService = new ChatRepository(new ChatDAO());
