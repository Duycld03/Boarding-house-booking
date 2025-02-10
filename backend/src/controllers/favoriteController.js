import Account from '../models/account.js';
import FavoriteBH from '../models/favoriteBH.js';
import BoardingHouse from '../models/boardingHouse.js';

class favoriteController {
  async getFavorites(req, res) {
    try {
      const account = await Account.findById(req.user.userId); // Lấy user từ token
      if (!account) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Tìm tất cả danh sách yêu thích của người dùng
      const favorites = await FavoriteBH.find({ accountId: account._id })
        .populate('boardingHouseId', 'name price img rating detail timeAgo') // Lấy thông tin phòng trọ
        .lean();

      return res.status(200).json({
        message: 'Successfully retrieved favorites',
        favorites: favorites.map((fav) => ({
          id: fav.boardingHouseId._id,
          name: fav.boardingHouseId.name,
          price: fav.boardingHouseId.price,
          img: fav.boardingHouseId.img,
          rating: fav.boardingHouseId.rating,
          detail: fav.boardingHouseId.detail,
          timeAgo: fav.boardingHouseId.timeAgo,
          isFavorite: true, // Mặc định là yêu thích
        })),
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  async createFavorite(req, res) {
    try {
      const account = await Account.findById(req.user.userId);
      if (!account) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { boardingHouseId } = req.body;
      if (!boardingHouseId) {
        return res.status(400).json({ message: 'Missing boardingHouseId' });
      }

      const existingFavorite = await FavoriteBH.findOne({
        accountId: account._id,
        boardingHouseId,
      });

      if (existingFavorite) {
        await FavoriteBH.deleteOne({ _id: existingFavorite._id });

        // Giảm số like mà không cập nhật `updatedAt`
        await BoardingHouse.updateOne(
          { _id: boardingHouseId },
          { $inc: { likes: -1 } },
          { timestamps: false }
        );

        return res
          .status(200)
          .json({ message: 'Removed from favorites', isFavorite: false });
      }

      // Thêm vào danh sách yêu thích
      const newFavorite = new FavoriteBH({
        accountId: account._id,
        boardingHouseId,
      });
      await newFavorite.save();

      // Tăng số like mà không cập nhật `updatedAt`
      await BoardingHouse.updateOne(
        { _id: boardingHouseId },
        { $inc: { likes: 1 } },
        { timestamps: false }
      );

      return res
        .status(201)
        .json({ message: 'Added to favorites', isFavorite: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new favoriteController();
