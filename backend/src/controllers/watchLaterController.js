import Account from '../models/account.js';
import WatchLater from '../models/watchLater.js';
import BoardingHouse from '../models/boardingHouse.js';
import mongoose from 'mongoose';

class watchLaterController {
  async getWatchLater(req, res) {
    try {
      const account = await Account.findById(req.user.userId); // Lấy user từ token
      if (!account) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Tìm tất cả danh sách yêu thích của người dùng
      const favorites = await WatchLater.find({ accountId: account._id })
        .populate('boardingHouseId', 'name price img rating detail timeAgo') // Lấy thông tin phòng trọ
        .lean();

      return res.status(200).json({
        message: 'Successfully',
        watchlaterlist: favorites.map((fav) => ({
          id: fav.boardingHouseId._id,
          name: fav.boardingHouseId.name,
          price: fav.boardingHouseId.price,
          img: fav.boardingHouseId.img,
          rating: fav.boardingHouseId.rating,
          detail: fav.boardingHouseId.detail,
          timeAgo: fav.boardingHouseId.timeAgo,
          isWatchLater: true,
        })),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async createWatchLater(req, res) {
    try {
      const account = await Account.findById(req.user.userId);
      if (!account) {
        return res.status(404).json({ message: 'User not found' });
      }

      let { boardingHouseId } = req.body;
      if (
        !boardingHouseId ||
        !mongoose.Types.ObjectId.isValid(boardingHouseId)
      ) {
        return res.status(400).json({ message: 'Invalid boardingHouseId' });
      }
      boardingHouseId = new mongoose.Types.ObjectId(boardingHouseId);

      const existingWatchLater = await WatchLater.findOne({
        accountId: account._id,
        boardingHouseId,
      });

      if (existingWatchLater) {
        await WatchLater.deleteOne({ _id: existingWatchLater._id });
        await BoardingHouse.updateOne(
          { _id: boardingHouseId },
          { $inc: { likes: -1 } },
          { timestamps: false }
        );
        return res.status(200).json({ isWatchLater: false }); // Trả về trạng thái mới
      }

      // Thêm vào danh sách yêu thích
      const newWatchLater = new WatchLater({
        accountId: account._id,
        boardingHouseId,
      });
      await newWatchLater.save();
      return res.status(201).json({ isWatchLater: true }); // Trả về trạng thái mới
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new watchLaterController();
