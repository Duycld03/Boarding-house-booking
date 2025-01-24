import BoardingHouse from '../models/boardingHouse.js'

class BoardingHouseController {
    async getAllBHOnDashBoard(req, res, next) {
        try {
            const boardingHData = await BoardingHouse.find(
            ).populate('boardingHouseType')
                .populate({
                    path: 'ownerId',
                });

            return res.status(200).json(boardingHData.sort());
        } catch (error) {
            console.error('Error fetching boarding house data:', error);
            return res.status(500).json({
                message: 'Failed to fetch boarding house data. Please try again later.',
                error: error.message,
            });
        }
    }
}

export default new BoardingHouseController();

