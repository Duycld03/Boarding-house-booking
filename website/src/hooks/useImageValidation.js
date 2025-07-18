// hooks/useImageValidation.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook để kiểm tra tính hợp lệ của đường dẫn ảnh
 * @param {string} imageSrc - Đường dẫn ảnh cần kiểm tra
 * @param {string} fallbackSrc - Đường dẫn ảnh dự phòng
 * @returns {Object} - { src, isValid, isLoading, checkImage }
 */
export const useImageValidation = (imageSrc, fallbackSrc = null) => {
    const [src, setSrc] = useState(imageSrc);
    const [isValid, setIsValid] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Kiểm tra tính hợp lệ của đường dẫn ảnh
     * @param {string} imageUrl - URL ảnh cần kiểm tra
     * @returns {Promise<boolean>} - true nếu ảnh hợp lệ, false nếu không
     */
    const checkImageUrl = useCallback((imageUrl) => {
        return new Promise((resolve) => {
            if (!imageUrl) {
                resolve(false);
                return;
            }

            const img = new Image();

            // Timeout sau 5 giây
            const timeoutId = setTimeout(() => {
                img.onload = null;
                img.onerror = null;
                resolve(false);
            }, 5000);

            img.onload = () => {
                clearTimeout(timeoutId);
                resolve(true);
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                resolve(false);
            };

            img.src = imageUrl;
        });
    }, []);

    /**
     * Kiểm tra và cập nhật src
     */
    const checkImage = useCallback(async (imageUrl = imageSrc) => {
        if (!imageUrl) {
            setSrc(fallbackSrc);
            setIsValid(false);
            return false;
        }

        setIsLoading(true);

        try {
            const isValidImage = await checkImageUrl(imageUrl);

            if (isValidImage) {
                setSrc(imageUrl);
                setIsValid(true);
                return true;
            } else {
                setSrc(fallbackSrc);
                setIsValid(false);
                return false;
            }
        } catch (error) {
            console.error('Error checking image:', error);
            setSrc(fallbackSrc);
            setIsValid(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [imageSrc, fallbackSrc, checkImageUrl]);

    // Kiểm tra ảnh khi imageSrc thay đổi
    useEffect(() => {
        checkImage();
    }, [imageSrc, checkImage]);

    return {
        src,
        isValid,
        isLoading,
        checkImage
    };
};


