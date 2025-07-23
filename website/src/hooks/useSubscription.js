import { useState, useEffect } from 'react';
import {
    getSubscriptionStatus,
    isExceedingLimit,
    getRemainingLimit,
    getGraceDaysRemaining,
} from '../utils/subscriptionUtils';
import { LIMITS, SUBSCRIPTION_STATUS } from '../constants/subscriptionConstants';

export const useSubscription = (user) => {
    const [subscriptionStatus, setSubscriptionStatus] = useState(SUBSCRIPTION_STATUS.EXPIRED);
    const [graceDaysRemaining, setGraceDaysRemaining] = useState(0);

    useEffect(() => {
        if (user?.subscription) {
            const status = getSubscriptionStatus(user.subscription);
            setSubscriptionStatus(status);

            if (status === SUBSCRIPTION_STATUS.GRACE_PERIOD) {
                setGraceDaysRemaining(getGraceDaysRemaining(user.subscription));
            }
        }
    }, [user]);

    const checkLimit = (limitType, currentCount) => {
        const plan = user?.subscription?.plan || 'FREE';
        return {
            isExceeding: isExceedingLimit(plan, limitType, currentCount),
            remaining: getRemainingLimit(plan, limitType, currentCount),
            limit: LIMITS[plan][limitType]
        };
    };

    const canPerformAction = (limitType, currentCount) => {
        const plan = user?.subscription?.plan || 'FREE';

        // Nếu đã hết hạn hoàn toàn
        if (subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED) {
            return false;
        }

        // Kiểm tra giới hạn
        return !isExceedingLimit(plan, limitType, currentCount);
    };

    return {
        subscriptionStatus,
        graceDaysRemaining,
        checkLimit,
        canPerformAction,
        isActive: subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE,
        isInGracePeriod: subscriptionStatus === SUBSCRIPTION_STATUS.GRACE_PERIOD,
        isExpired: subscriptionStatus === SUBSCRIPTION_STATUS.EXPIRED
    };
};