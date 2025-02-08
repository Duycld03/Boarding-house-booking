import Account from '../models/account.js';
import FavoriteBH from '../models/favoriteBH.js';
import BoardingHouse from '../models/boardingHouse.js';

class favoriteController {
  async createFavorite(req, res) {
    try {
      const account = await Account.findById(req.user.userId); // Lấy user từ token
      if (!account) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { boardingHouseId } = req.body;

      if (!boardingHouseId) {
        return res.status(400).json({ message: 'Missing boardingHouseId' });
      }

      // Kiểm tra xem đã có trong danh sách yêu thích chưa
      const existingFavorite = await FavoriteBH.findOne({
        accountId: account._id,
        boardingHouseId,
      });

      if (existingFavorite) {
        await FavoriteBH.deleteOne({ _id: existingFavorite._id });
        await BoardingHouse.findByIdAndUpdate(boardingHouseId, {
          $inc: { likes: -1 },
        });

        return res
          .status(200)
          .json({ message: 'Removed from favorites', isFavorite: false });
      }

      // Nếu chưa có thì thêm vào danh sách yêu thích
      const newFavorite = new FavoriteBH({
        accountId: account._id,
        boardingHouseId,
      });
      await newFavorite.save();
      await BoardingHouse.findByIdAndUpdate(boardingHouseId, {
        $inc: { likes: 1 },
      });

      return res
        .status(201)
        .json({ message: 'Added to favorites', isFavorite: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new favoriteController();
