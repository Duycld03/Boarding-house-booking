import { Owner } from '../models/account.js';
import BoardingHouse from '../models/boardingHouse.js';
import cron from 'node-cron';
import Room from '../models/room.js';

const LIMITS = {
    FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
    STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
    PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity }
};

export const runImmediateSubscriptionCheck = async () => {
    try {
        const expiredOwners = await Owner.find({
            'subscription.graceEndDate': { $lt: new Date() },
            'subscription.status': { $ne: 'DEACTIVATED' }
        });

        for (const owner of expiredOwners) {
            await deactivateExcessResources(owner._id);
            await Owner.findByIdAndUpdate(owner._id, {
                'subscription.status': 'DEACTIVATED'
            });
        }

        const activeOwners = await Owner.find({
            'subscription.status': 'ACTIVE',
            $or: [
                { 'subscription.endDate': { $gte: new Date() } },
                { 'subscription.plan': 'FREE' }
            ]
        });

        for (const owner of activeOwners) {
            await reactivateResourcesIfNeeded(owner._id, owner.subscription.plan);
        }

        return { success: true, processed: { expired: expiredOwners.length, active: activeOwners.length } };

    } catch (error) {
        console.error('Error in subscription check:', error);
        return { success: false, error: error.message };
    }
};

export const runImmediateFreeCheck = async () => {
    try {
        const freeOwners = await Owner.find({
            'subscription.plan': 'FREE',
            'subscription.status': 'ACTIVE'
        });

        for (const owner of freeOwners) {
            await deactivateExcessResources(owner._id);
        }

        return { success: true, processed: freeOwners.length };

    } catch (error) {
        console.error('Error in FREE check:', error);
        return { success: false, error: error.message };
    }
};

export const runAllImmediateChecks = async () => {
    const results = {};

    // Chạy subscription check
    results.subscriptionCheck = await runImmediateSubscriptionCheck();

    // Chạy FREE check
    results.freeCheck = await runImmediateFreeCheck();

    return results;
};

export const startSubscriptionJob = () => {
    // Job chạy hàng ngày để kiểm tra subscription hết hạn
    cron.schedule('0 0 * * *', async () => {
        await runImmediateSubscriptionCheck();
    });

    // Job kiểm tra định kỳ cho các owner có plan FREE
    cron.schedule('0 0 * * *', async () => {
        await runImmediateFreeCheck();
    });

    // Chạy kiểm tra ngay khi start server
    setTimeout(() => {
        runAllImmediateChecks();
    }, 5000); // Delay 5 giây để đảm bảo DB đã kết nối
};

export const deactivateExcessResources = async (ownerId) => {
    try {
        const owner = await Owner.findById(ownerId);
        if (!owner) return;

        const limits = LIMITS.FREE;

        // Deactivate excess boarding houses
        const boardingHouses = await BoardingHouse.find({
            ownerId,
            isActive: true
        }).sort({ createdAt: 1 });

        if (boardingHouses.length > limits.boardingHouses) {
            const toDeactivate = boardingHouses.slice(limits.boardingHouses);

            if (toDeactivate.length > 0) {
                await BoardingHouse.updateMany(
                    { _id: { $in: toDeactivate.map(bh => bh._id) } },
                    {
                        isActive: false,
                        deactivatedAt: new Date(),
                        deactivatedReason: 'SUBSCRIPTION_LIMIT_EXCEEDED'
                    }
                );

                await Room.updateMany(
                    { boardingHouseId: { $in: toDeactivate.map(bh => bh._id) } },
                    { isActive: false, deactivatedAt: new Date() }
                );
            }
        }

        // Deactivate excess rooms in active boarding houses
        const activeBoardingHouses = await BoardingHouse.find({
            ownerId,
            isActive: true
        });

        for (const bh of activeBoardingHouses) {
            const activeRooms = await Room.find({
                boardingHouseId: bh._id,
                isActive: true
            }).sort({ createdAt: 1 });

            if (activeRooms.length > limits.rooms) {
                const roomsToDeactivate = activeRooms.slice(limits.rooms);

                await Room.updateMany(
                    { _id: { $in: roomsToDeactivate.map(r => r._id) } },
                    {
                        isActive: false,
                        deactivatedAt: new Date(),
                        deactivatedReason: 'SUBSCRIPTION_LIMIT_EXCEEDED'
                    }
                );
            }
        }

    } catch (error) {
        console.error(`Error deactivating resources for owner ${ownerId}:`, error);
    }
};

export const reactivateResourcesIfNeeded = async (ownerId, plan) => {
    try {
        const limits = LIMITS[plan] || LIMITS.FREE;

        // Reactivate boarding houses if owner has capacity
        const allBoardingHouses = await BoardingHouse.find({ ownerId })
            .sort({ createdAt: 1 });

        const activeBoardingHouses = allBoardingHouses.filter(bh => bh.isActive);
        const inactiveBoardingHouses = allBoardingHouses.filter(bh => !bh.isActive);

        // Nếu số boarding houses active ít hơn giới hạn và có boarding houses inactive
        if (activeBoardingHouses.length < limits.boardingHouses && inactiveBoardingHouses.length > 0) {
            const canReactivate = Math.min(
                limits.boardingHouses - activeBoardingHouses.length,
                inactiveBoardingHouses.length
            );

            const toReactivate = inactiveBoardingHouses.slice(0, canReactivate);

            if (toReactivate.length > 0) {
                await BoardingHouse.updateMany(
                    { _id: { $in: toReactivate.map(bh => bh._id) } },
                    {
                        isActive: true,
                        $unset: { deactivatedAt: 1, deactivatedReason: 1 }
                    }
                );

                // Reactivate rooms in reactivated boarding houses
                for (const bh of toReactivate) {
                    const inactiveRooms = await Room.find({
                        boardingHouseId: bh._id,
                        isActive: false
                    }).sort({ createdAt: 1 });

                    const roomsToReactivate = inactiveRooms.slice(0, limits.rooms);

                    if (roomsToReactivate.length > 0) {
                        await Room.updateMany(
                            { _id: { $in: roomsToReactivate.map(r => r._id) } },
                            {
                                isActive: true,
                                $unset: { deactivatedAt: 1, deactivatedReason: 1 }
                            }
                        );
                    }
                }
            }
        }

        // Reactivate rooms trong các boarding houses đã active
        const currentActiveBoardingHouses = await BoardingHouse.find({
            ownerId,
            isActive: true
        });

        for (const bh of currentActiveBoardingHouses) {
            const activeRooms = await Room.find({
                boardingHouseId: bh._id,
                isActive: true
            });

            const inactiveRooms = await Room.find({
                boardingHouseId: bh._id,
                isActive: false
            }).sort({ createdAt: 1 });

            if (activeRooms.length < limits.rooms && inactiveRooms.length > 0) {
                const canReactivateRooms = Math.min(
                    limits.rooms - activeRooms.length,
                    inactiveRooms.length
                );

                const roomsToReactivate = inactiveRooms.slice(0, canReactivateRooms);

                if (roomsToReactivate.length > 0) {
                    await Room.updateMany(
                        { _id: { $in: roomsToReactivate.map(r => r._id) } },
                        {
                            isActive: true,
                            $unset: { deactivatedAt: 1, deactivatedReason: 1 }
                        }
                    );
                }
            }
        }

    } catch (error) {
        console.error(`Error reactivating resources for owner ${ownerId}:`, error);
    }
};

export const reactivateResources = async (ownerId, newPlan) => {
    await reactivateResourcesIfNeeded(ownerId, newPlan);
};

/**
 * Kích hoạt lại boarding houses và phòng khi người dùng đăng ký lại gói
 * @param {string} ownerId - ID của owner
 * @param {string} newPlan - Gói mới đăng ký (PREMIUM, STANDARD, FREE)
 * @returns {Promise<Object>} Kết quả kích hoạt
 */
export const reactivateAfterRenew = async (ownerId, newPlan) => {
    try {
        const owner = await Owner.findById(ownerId);
        if (!owner) {
            return { success: false, message: 'Owner not found' };
        }

        const limits = LIMITS[newPlan] || LIMITS.FREE;

        // Lấy tất cả boarding houses của owner
        const allBoardingHouses = await BoardingHouse.find({ ownerId })
            .sort({ deactivatedAt: -1, createdAt: -1 });

        const activeBoardingHouses = allBoardingHouses.filter(bh => bh.isActive);
        const inactiveBoardingHouses = allBoardingHouses.filter(bh => !bh.isActive);

        // Xác định số lượng boarding houses có thể kích hoạt lại
        const canReactivate = Math.min(
            limits.boardingHouses - activeBoardingHouses.length,
            inactiveBoardingHouses.length
        );

        if (canReactivate <= 0) {
            return {
                success: true,
                message: 'No boarding houses to reactivate',
                reactivated: {
                    boardingHouses: 0,
                    rooms: 0
                }
            };
        }

        // Ưu tiên kích hoạt các boarding houses bị vô hiệu hóa do hết hạn subscription
        const deactivatedDueToSubscription = inactiveBoardingHouses.filter(
            bh => bh.deactivatedReason === 'SUBSCRIPTION_LIMIT_EXCEEDED'
        );

        let toReactivate = [];
        if (deactivatedDueToSubscription.length > 0) {
            toReactivate = deactivatedDueToSubscription.slice(0, canReactivate);
        } else {
            toReactivate = inactiveBoardingHouses.slice(0, canReactivate);
        }

        // Kích hoạt lại các boarding houses
        await BoardingHouse.updateMany(
            { _id: { $in: toReactivate.map(bh => bh._id) } },
            {
                isActive: true,
                $unset: { deactivatedAt: 1, deactivatedReason: 1 },
                $set: { reactivatedAt: new Date(), reactivatedReason: 'SUBSCRIPTION_RENEWED' }
            }
        );

        // Đếm số phòng đã kích hoạt lại
        let totalRoomsReactivated = 0;

        // Kích hoạt lại các phòng trong các boarding houses đã kích hoạt lại
        for (const bh of toReactivate) {
            const inactiveRooms = await Room.find({
                boardingHouseId: bh._id,
                isActive: false,
                deactivatedReason: { $in: ['SUBSCRIPTION_LIMIT_EXCEEDED', null, undefined] }
            }).sort({ deactivatedAt: -1, createdAt: -1 });

            const roomsToReactivate = inactiveRooms.slice(0, limits.rooms);

            if (roomsToReactivate.length > 0) {
                await Room.updateMany(
                    { _id: { $in: roomsToReactivate.map(r => r._id) } },
                    {
                        isActive: true,
                        $unset: { deactivatedAt: 1, deactivatedReason: 1 },
                        $set: { reactivatedAt: new Date(), reactivatedReason: 'SUBSCRIPTION_RENEWED' }
                    }
                );

                totalRoomsReactivated += roomsToReactivate.length;
            }
        }

        return {
            success: true,
            reactivated: {
                boardingHouses: toReactivate.length,
                rooms: totalRoomsReactivated
            }
        };

    } catch (error) {
        console.error(`Error reactivating resources after renewal for owner ${ownerId}:`, error);
        return { success: false, error: error.message };
    }
};

export const handleExpiredPremium = async (ownerId) => {
    try {
        const owner = await Owner.findById(ownerId);
        if (!owner) {
            return { success: false, message: 'Owner not found' };
        }

        if (!['PREMIUM', 'STANDARD'].includes(owner.subscription?.plan)) {
            return { success: false, message: 'Not a PREMIUM/STANDARD subscription' };
        }

        // Lưu thông tin plan cũ
        const oldPlan = owner.subscription.plan;

        // Chuyển về FREE
        await Owner.findByIdAndUpdate(ownerId, {
            'subscription.plan': 'FREE',
            'subscription.status': 'ACTIVE',  // FREE không hết hạn
            'subscription.endDate': null,
            'subscription.graceEndDate': null,
            'subscription.previousPlan': oldPlan,
            'subscription.downgradeDate': new Date(),
            'subscription.downgradeReason': 'SUBSCRIPTION_EXPIRED'
        });

        // Giới hạn tài nguyên theo FREE
        await deactivateExcessResources(ownerId);

        return {
            success: true,
            message: `Downgraded from ${oldPlan} to FREE`,
            previousPlan: oldPlan
        };
    } catch (error) {
        console.error(`Error handling expired Premium/Standard for owner ${ownerId}:`, error);
        return { success: false, error: error.message };
    }
};

