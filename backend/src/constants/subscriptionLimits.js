// Định nghĩa giới hạn cho mỗi loại subscription
export const LIMITS = {
    FREE: { boardingHouses: 1, rooms: 5, staff: 0 },
    STANDARD: { boardingHouses: 5, rooms: 30, staff: 3 },
    PREMIUM: { boardingHouses: Infinity, rooms: Infinity, staff: Infinity }
};