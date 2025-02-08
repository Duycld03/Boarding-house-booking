import favoriteBH from '../models/favoriteBH.js';
import BoardingHouse from '../models/boardingHouse.js';
class favoriteController {
  async createFavorite(req, res) {
    try {
      const { userId } = req.params;
      const { boardingHouseId } = req.body;

      const existingFavorite = await favoriteBH.findOne({
        accountId: userId,
        boardingHouseId,
      });

      if (existingFavorite) {
        await favoriteBH.deleteOne({ _id: existingFavorite._id });
        await BoardingHouse.findByIdAndUpdate(boardingHouseId, {
          $inc: { likes: -1 },
        });
        return res
          .status(200)
          .json({ message: 'Removed from favorites', isFavorite: false });
      }

      const newFavorite = new favoriteBH({
        accountId: userId,
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
