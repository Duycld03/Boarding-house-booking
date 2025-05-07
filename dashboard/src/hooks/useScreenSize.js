import { useState, useEffect } from "react";

const useScreenSize = (size) => {
    const [isMatch, setIsMatch] = useState(window.innerWidth >= size);

    useEffect(() => {
        const handleResize = () => setIsMatch(window.innerWidth >= size);

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [size]);

    return isMatch;
};

export default useScreenSize;
