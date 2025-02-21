import BoardingHouseType from '../models/boardingHouseType.js';

class BoardingHouseTypeController {
    async getAllBoardingHouseTypesInUser(req, res) {
        try {
            const boardingHouseTypes = await BoardingHouseType.find();
            return res.status(200).json(boardingHouseTypes);
        } catch (error) {
            console.error('Error fetching boarding house types:', error.message);
            return res.status(500).json({
                success: false,
                message:
                    'Failed to fetch boarding house types. Please try again later.',
            });
        }
    }
}

export default new BoardingHouseTypeController();
