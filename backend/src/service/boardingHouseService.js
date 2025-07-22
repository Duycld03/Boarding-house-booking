// boardingHouseService.js
import mongoose from 'mongoose';
import Room from '../models/room.js';
import BoardingHouse from '../models/boardingHouse.js';

class BoardingHouseService {
    /**
     * Lấy thống kê chi tiết cho một boarding house
     */
    async getBoardingHouseStats(boardingHouseId) {
        try {
            const stats = await Room.aggregate([
                {
                    $match: {
                        boardingHouseId: new mongoose.Types.ObjectId(boardingHouseId),
                        isActive: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRooms: { $sum: 1 },
                        availableRooms: {
                            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
                        },
                        occupiedRooms: {
                            $sum: { $cond: [{ $eq: ['$isAvailable', false] }, 1, 0] }
                        }
                    }
                }
            ]);

            return stats[0] || { totalRooms: 0, availableRooms: 0, occupiedRooms: 0 };
        } catch (error) {
            console.error(`Error getting boarding house stats: ${error.message}`);
            throw new Error(`Error getting boarding house stats: ${error.message}`);
        }
    }

    /**
     * Lấy thống kê cho nhiều boarding house (cho dashboard owner)
     */
    async getMultipleBoardingHouseStats(boardingHouseIds) {
        try {
            const stats = await Room.aggregate([
                {
                    $match: {
                        boardingHouseId: { $in: boardingHouseIds.map(id => new mongoose.Types.ObjectId(id)) },
                        isActive: true
                    }
                },
                {
                    $group: {
                        _id: '$boardingHouseId',
                        totalRooms: { $sum: 1 },
                        availableRooms: {
                            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
                        },
                        occupiedRooms: {
                            $sum: { $cond: [{ $eq: ['$isAvailable', false] }, 1, 0] }
                        }
                    }
                }
            ]);

            // Convert array to object for easy lookup
            const statsMap = {};
            stats.forEach(stat => {
                statsMap[stat._id.toString()] = {
                    totalRooms: stat.totalRooms,
                    availableRooms: stat.availableRooms,
                    occupiedRooms: stat.occupiedRooms
                };
            });

            return statsMap;
        } catch (error) {
            throw new Error(`Error getting multiple boarding house stats: ${error.message}`);
        }
    }

    /**
     * Lấy danh sách boarding house kèm thống kê
     */
    async getBoardingHousesWithStats(ownerId) {
        try {
            const boardingHouses = await BoardingHouse.find({ ownerId, isActive: true });
            const boardingHouseIds = boardingHouses.map(bh => bh._id);

            const statsMap = await this.getMultipleBoardingHouseStats(boardingHouseIds);

            const boardingHousesWithStats = boardingHouses.map(bh => ({
                ...bh.toObject(),
                stats: statsMap[bh._id.toString()] || { totalRooms: 0, availableRooms: 0, occupiedRooms: 0 }
            }));

            return boardingHousesWithStats;
        } catch (error) {
            throw new Error(`Error getting boarding houses with stats: ${error.message}`);
        }
    }

    /**
     * Mới: Thêm tính toán thống kê vào boarding house object
     */
    async addStatsToBoaringHouse(boardingHouse) {
        if (!boardingHouse) return null;

        try {
            const stats = await this.getBoardingHouseStats(boardingHouse._id);

            // Nếu là single object
            if (!Array.isArray(boardingHouse)) {
                const bhWithStats = boardingHouse.toObject ? boardingHouse.toObject() : { ...boardingHouse };
                return {
                    ...bhWithStats,
                    totalRooms: stats.totalRooms,
                    availableRooms: stats.availableRooms
                };
            }

            // Nếu là array
            return boardingHouse;
        } catch (error) {
            console.error(`Error adding stats to boarding house: ${error.message}`);
            return boardingHouse;
        }
    }

    /**
     * Mới: Thêm tính toán thống kê vào nhiều boarding house objects
     */
    async addStatsToBoaringHouses(boardingHouses) {
        if (!boardingHouses || !Array.isArray(boardingHouses) || boardingHouses.length === 0) {
            return [];
        }

        try {
            const boardingHouseIds = boardingHouses.map(bh => bh._id);
            const statsMap = await this.getMultipleBoardingHouseStats(boardingHouseIds);

            return boardingHouses.map(bh => {
                const bhObject = bh.toObject ? bh.toObject() : { ...bh };
                const stats = statsMap[bhObject._id.toString()] || { totalRooms: 0, availableRooms: 0 };

                return {
                    ...bhObject,
                    totalRooms: stats.totalRooms,
                    availableRooms: stats.availableRooms
                };
            });
        } catch (error) {
            console.error(`Error adding stats to boarding houses: ${error.message}`);
            return boardingHouses;
        }
    }
}

export default new BoardingHouseService();