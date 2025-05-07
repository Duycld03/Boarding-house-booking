import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import NotificationModal from '@/components/feedback/NotificationModal';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        autoClose: true,
        duration: 3000,
    });

    const pendingNotificationRef = useRef(null);

    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (notification.visible && notification.autoClose) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                hideNotification();
                timeoutRef.current = null;
            }, notification.duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [notification.visible, notification.autoClose, notification.duration]);

    // Process pending notifications
    useEffect(() => {
        if (pendingNotificationRef.current && !notification.visible) {
            const pendingNotification = pendingNotificationRef.current;
            pendingNotificationRef.current = null;

            // Use setTimeout to avoid React update cycle issues
            setTimeout(() => {
                setNotification({
                    ...pendingNotification,
                    visible: true
                });
            }, 0);
        }
    }, [notification.visible]);

    const showNotification = useCallback(({
        title = 'Notification',
        message,
        type = 'info',
        autoClose = true,
        duration = 3000,
    }) => {
        const notificationData = {
            title,
            message,
            type,
            autoClose,
            duration,
        };

        if (notification.visible) {
            pendingNotificationRef.current = notificationData;
            hideNotification();
            return;
        }

        setNotification({
            ...notificationData,
            visible: true,
        });
    }, [notification.visible]);

    const showSuccess = useCallback((message, options = {}) => {
        showNotification({
            title: options.title || 'Success',
            message,
            type: 'success',
            ...options
        });
    }, [showNotification]);

    const showError = useCallback((message, options = {}) => {
        showNotification({
            title: options.title || 'Error',
            message,
            type: 'error',
            autoClose: options.autoClose !== undefined ? options.autoClose : false,
            ...options
        });
    }, [showNotification]);

    const showWarning = useCallback((message, options = {}) => {
        showNotification({
            title: options.title || 'Warning',
            message,
            type: 'warning',
            ...options
        });
    }, [showNotification]);

    const showInfo = useCallback((message, options = {}) => {
        showNotification({
            title: options.title || 'Information',
            message,
            type: 'info',
            ...options
        });
    }, [showNotification]);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({
            ...prev,
            visible: false,
        }));
    }, []);

    const contextValue = {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationModal
                visible={notification.visible}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                autoClose={notification.autoClose}
                duration={notification.duration}
                onClose={hideNotification}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};