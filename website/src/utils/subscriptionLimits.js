// utils/subscriptionLimits.js
const LIMITS = {
    FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
    STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
    PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity }
};

export const canCreateNew = (resource, currentCount, userPlan, isExpired) => {
    const planToCheck = isExpired ? 'FREE' : userPlan;
    const limit = LIMITS[planToCheck][resource];
    return currentCount < limit;
};

