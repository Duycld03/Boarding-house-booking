import { LIMITS, SUBSCRIPTION_STATUS } from '@/constants/subscriptionConstants';

/**
 * Kiểm tra trạng thái subscription hiện tại
 * @param {Object} subscription - subscription object từ user data
 * @returns {string} - ACTIVE | GRACE_PERIOD | EXPIRED
 */
export const getSubscriptionStatus = (subscription) => {
    if (!subscription || !subscription.endDate) {
        return SUBSCRIPTION_STATUS.EXPIRED;
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const graceEndDate = new Date(subscription.graceEndDate);

    if (now <= endDate) {
        return SUBSCRIPTION_STATUS.ACTIVE;
    } else if (now <= graceEndDate) {
        return SUBSCRIPTION_STATUS.GRACE_PERIOD;
    } else {
        return SUBSCRIPTION_STATUS.EXPIRED;
    }
};

/**
 * Kiểm tra xem có vượt quá giới hạn không
 * @param {string} plan - FREE | STANDARD | PREMIUM
 * @param {string} limitType - boardingHouses | rooms | staff
 * @param {number} currentCount - số lượng hiện tại
 * @returns {boolean} - true nếu vượt quá giới hạn
 */
export const isExceedingLimit = (plan, limitType, currentCount) => {
    const limit = LIMITS[plan]?.[limitType];
    if (limit === Infinity) return false;
    return currentCount >= limit;
};

/**
 * Lấy thông tin giới hạn còn lại
 * @param {string} plan - FREE | STANDARD | PREMIUM  
 * @param {string} limitType - boardingHouses | rooms | staff
 * @param {number} currentCount - số lượng hiện tại
 * @returns {number} - số lượng còn có thể tạo thêm
 */
export const getRemainingLimit = (plan, limitType, currentCount) => {
    const limit = LIMITS[plan]?.[limitType];
    if (limit === Infinity) return Infinity;
    return Math.max(0, limit - currentCount);
};

/**
 * Tính số ngày còn lại trong grace period
 * @param {Object} subscription
 * @returns {number} - số ngày còn lại (0 nếu hết hạn)
 */
export const getGraceDaysRemaining = (subscription) => {
    if (!subscription?.graceEndDate) return 0;

    const now = new Date();
    const graceEndDate = new Date(subscription.graceEndDate);
    const diffTime = graceEndDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};