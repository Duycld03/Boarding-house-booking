import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { Owner } from '../models/account.js';
import BoardingHouse from '../models/boardingHouse.js';
import Room from '../models/room.js';

// Subscription limits
const LIMITS = {
    FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
    STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
    PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity }
};

// Auto-upgrade logic: nếu owner có resources vượt FREE thì auto upgrade
const determineSubscriptionPlan = (bhCount, roomCount, staffCount = 0) => {
    if (bhCount <= LIMITS.FREE.boardingHouses &&
        roomCount <= LIMITS.FREE.rooms &&
        staffCount <= LIMITS.FREE.staff) {
        return 'FREE';
    } else if (bhCount <= LIMITS.STANDARD.boardingHouses &&
        roomCount <= LIMITS.STANDARD.rooms &&
        staffCount <= LIMITS.STANDARD.staff) {
        return 'STANDARD';
    } else {
        return 'PREMIUM';
    }
};

export const migrateSubscription = async () => {
    try {



        // Step 1: Add isActive field to all BoardingHouses
        console.log('\n📋 Step 1: Migrating BoardingHouse schemas...');
        const bhUpdateResult = await BoardingHouse.updateMany(
            { isActive: { $exists: false } },
            {
                $set: {
                    isActive: true
                }
            }
        );
        console.log(`✅ Updated ${bhUpdateResult.modifiedCount} boarding houses with isActive field`);

        // Step 2: Add isActive field to all Rooms
        console.log('\n🏠 Step 2: Migrating Room schemas...');
        const roomUpdateResult = await Room.updateMany(
            { isActive: { $exists: false } },
            {
                $set: {
                    isActive: true
                }
            }
        );
        console.log(`✅ Updated ${roomUpdateResult.modifiedCount} rooms with isActive field`);

        // Step 3: Analyze and migrate Owner subscriptions
        console.log('\n👥 Step 3: Analyzing owners and determining subscription plans...');

        const owners = await Owner.find({ subscription: { $exists: false } });
        console.log(`📊 Found ${owners.length} owners without subscription`);

        let freeCount = 0;
        let standardCount = 0;
        let premiumCount = 0;
        const migrationStats = [];

        for (const owner of owners) {
            try {
                // Count resources for this owner
                const boardingHouses = await BoardingHouse.find({ ownerId: owner._id });
                const bhCount = boardingHouses.length;

                const bhIds = boardingHouses.map(bh => bh._id);
                const roomCount = await Room.countDocuments({
                    boardingHouseId: { $in: bhIds }
                });

                // TODO: Count staff when Staff model is available
                const staffCount = 0; // await Staff.countDocuments({ ownerId: owner._id });

                // Determine appropriate plan
                const recommendedPlan = determineSubscriptionPlan(bhCount, roomCount, staffCount);

                // Create subscription object
                const subscriptionData = {
                    plan: recommendedPlan,
                    startDate: new Date(),
                    endDate: recommendedPlan !== 'FREE' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                    graceEndDate: recommendedPlan !== 'FREE' ? new Date(Date.now() + 37 * 24 * 60 * 60 * 1000) : null,
                    status: 'ACTIVE',
                    isActive: true
                };

                // Update owner with subscription
                await Owner.findByIdAndUpdate(owner._id, {
                    $set: { subscription: subscriptionData }
                });

                // Track stats
                switch (recommendedPlan) {
                    case 'FREE': freeCount++; break;
                    case 'STANDARD': standardCount++; break;
                    case 'PREMIUM': premiumCount++; break;
                }

                migrationStats.push({
                    ownerId: owner._id,
                    ownerName: owner.name || owner.email,
                    boardingHouses: bhCount,
                    rooms: roomCount,
                    staff: staffCount,
                    assignedPlan: recommendedPlan
                });

                console.log(`✅ Owner ${owner._id}: ${bhCount} BH, ${roomCount} rooms → ${recommendedPlan}`);

            } catch (error) {
                console.error(`❌ Error processing owner ${owner._id}:`, error.message);
            }
        }

        // Step 4: Display migration summary
        console.log('\n📊 MIGRATION SUMMARY:');
        console.log('='.repeat(50));
        console.log(`📈 Total owners migrated: ${owners.length}`);
        console.log(`🆓 FREE plans assigned: ${freeCount}`);
        console.log(`⭐ STANDARD plans assigned: ${standardCount}`);
        console.log(`💎 PREMIUM plans assigned: ${premiumCount}`);

        console.log('\n📋 DETAILED BREAKDOWN:');
        console.log('Owner ID'.padEnd(25) + 'Name'.padEnd(20) + 'BH'.padEnd(5) + 'Rooms'.padEnd(7) + 'Plan');
        console.log('-'.repeat(65));

        migrationStats.forEach(stat => {
            const ownerIdShort = stat.ownerId.toString().substring(0, 24);
            const nameShort = (stat.ownerName || 'N/A').substring(0, 18);
            console.log(
                ownerIdShort.padEnd(25) +
                nameShort.padEnd(20) +
                stat.boardingHouses.toString().padEnd(5) +
                stat.rooms.toString().padEnd(7) +
                stat.assignedPlan
            );
        });

        // Step 5: Verify migration
        console.log('\n🔍 Step 5: Verifying migration...'); // Sửa Step 4 -> Step 5

        const totalOwners = await Owner.countDocuments();
        const ownersWithSubscription = await Owner.countDocuments({
            'subscription.plan': { $exists: true }
        });

        const totalBH = await BoardingHouse.countDocuments();
        const activeBH = await BoardingHouse.countDocuments({ isActive: true });

        const totalRooms = await Room.countDocuments();
        const activeRooms = await Room.countDocuments({ isActive: true });

        console.log(`✅ Owners with subscription: ${ownersWithSubscription}/${totalOwners}`);
        console.log(`✅ Active boarding houses: ${activeBH}/${totalBH}`);
        console.log(`✅ Active rooms: ${activeRooms}/${totalRooms}`);

        if (ownersWithSubscription === totalOwners && activeBH === totalBH && activeRooms === totalRooms) {
            console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
        } else {
            console.log('\n⚠️  Migration completed with some issues. Please check the data.');
        }

        // Thay thế Step 6 hiện tại bằng code này:

        // Step 6: Create backup info và verify final statistics
        console.log('\n💾 Step 6: Creating rollback information and final statistics...');

        // Query lại từ database để có số liệu chính xác
        const finalFreeCount = await Owner.countDocuments({ 'subscription.plan': 'FREE' });
        const finalStandardCount = await Owner.countDocuments({ 'subscription.plan': 'STANDARD' });
        const finalPremiumCount = await Owner.countDocuments({ 'subscription.plan': 'PREMIUM' });
        const totalOwnersWithSubscription = finalFreeCount + finalStandardCount + finalPremiumCount;

        console.log('\n📊 FINAL SUBSCRIPTION STATISTICS:');
        console.log('='.repeat(50));
        console.log(`🆓 FREE plans: ${finalFreeCount}`);
        console.log(`⭐ STANDARD plans: ${finalStandardCount}`);
        console.log(`💎 PREMIUM plans: ${finalPremiumCount}`);
        console.log(`📈 Total owners with subscription: ${totalOwnersWithSubscription}`);

        const rollbackInfo = {
            timestamp: new Date(),
            migratedOwners: owners.length, // Số owners được migrate trong lần chạy này
            totalOwnersWithSubscription: totalOwnersWithSubscription, // Tổng số owners có subscription
            finalPlans: {
                free: finalFreeCount,
                standard: finalStandardCount,
                premium: finalPremiumCount
            },
            migrationPlans: { // Số lượng được assign trong lần migration này
                free: freeCount,
                standard: standardCount,
                premium: premiumCount
            }
        };

        // Save rollback info
        console.log('💾 Rollback info:', JSON.stringify(rollbackInfo, null, 2));

        return {
            success: true,
            stats: {
                ownersProcessed: owners.length,
                finalPlans: {
                    free: finalFreeCount,
                    standard: finalStandardCount,
                    premium: finalPremiumCount
                },
                migrationPlans: {
                    free: freeCount,
                    standard: standardCount,
                    premium: premiumCount
                }
            }
        };

    } catch (error) {
        console.error('💥 Migration failed:', error);
        throw error;
    }
};

// Rollback function (in case needed)
export const rollbackMigration = async () => {
    try {
        console.log('⏪ Starting rollback...');

        // Remove subscription fields from owners
        const ownerRollback = await Owner.updateMany(
            { 'subscription.plan': { $exists: true } },
            { $unset: { subscription: 1 } }
        );

        // Remove isActive fields from boarding houses
        const bhRollback = await BoardingHouse.updateMany(
            { isActive: { $exists: true } },
            { $unset: { isActive: 1, deactivatedAt: 1, deactivatedReason: 1 } }
        );

        // Remove isActive fields from rooms
        const roomRollback = await Room.updateMany(
            { isActive: { $exists: true } },
            { $unset: { isActive: 1, deactivatedAt: 1 } }
        );

        console.log(`✅ Rollback completed:`);
        console.log(`   - ${ownerRollback.modifiedCount} owners restored`);
        console.log(`   - ${bhRollback.modifiedCount} boarding houses restored`);
        console.log(`   - ${roomRollback.modifiedCount} rooms restored`);

        return {
            success: true,
            stats: {
                owners: ownerRollback.modifiedCount,
                boardingHouses: bhRollback.modifiedCount,
                rooms: roomRollback.modifiedCount
            }
        };

    } catch (error) {
        console.error('💥 Rollback failed:', error);
        throw error;
    }
};
