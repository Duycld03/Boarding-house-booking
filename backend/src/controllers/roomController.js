import mongoose from "mongoose";
import Room from "../models/room.js";


class RoomController {
    async getRoomsByRoomType(req, res) {

        try {
            const { roomTypeId } = req.params;


            if (!roomTypeId) {
                return res.status(400).json({ message: "Missing required parameters" });
            }

            const rooms = await Room.find({ roomTypeId: new mongoose.Types.ObjectId(roomTypeId) });

            res.status(200).json(rooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            res.status(500).json({ message: "Server error", error });
        }
    }

}

export default new RoomController();
