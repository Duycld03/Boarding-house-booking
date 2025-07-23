export const LIMITS = {
    FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
    STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
    PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity }
};

export const SUBSCRIPTION_STATUS = {
    ACTIVE: 'ACTIVE',
    GRACE_PERIOD: 'GRACE_PERIOD',
    EXPIRED: 'EXPIRED'
};