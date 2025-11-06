// roomUtils.js - Updated version

export const numberingFormats = [
    { value: "floor-room", label: "Floor + Room (e.g., 101, 102)" },
    { value: "sequential", label: "Sequential (e.g., 1, 2, 3)" },
    { value: "padded-sequential", label: "Padded Sequential (e.g., 01, 02, 03)" },
    { value: "letter_number", label: "Letter + Number (e.g., A1, B1)" },
];

// utils/roomUtils.js

export const generateRooms = (values) => {
    const { floors, roomsPerFloor, roomTypes, numberingFormat, prefix } = values;
    const rooms = [];


    for (let floor = 1; floor <= floors; floor++) {
        for (let roomIndex = 1; roomIndex <= roomsPerFloor; roomIndex++) {
            const prefixStr = prefix || ""; // Sử dụng prefix nếu có

            // Sử dụng hàm generateRoomNumber để tạo số phòng
            const roomNumber = generateRoomNumber(floor, roomIndex - 1, numberingFormat, prefixStr);

            const room = {
                id: `room-${floor}-${roomIndex}-${Date.now()}-${Math.random()}`,
                floor: floor,
                roomNumber: roomNumber,
                roomTypeId: Array.isArray(roomTypes) ?
                    roomTypes[(roomIndex - 1) % roomTypes.length] : // Distribute room types evenly
                    roomTypes, // Single room type
                description: '',
                image: null,
                hasError: false,
                errorMessage: ''
            };

            rooms.push(room);
        }
    }

    return rooms;
};





export const checkDuplicates = (rooms, existingRoomNumbers) => {
    const duplicates = new Set();
    const roomNumbers = Array.isArray(rooms)
        ? rooms.map(room => room.roomNumber || room)
        : rooms;

    const allNumbers = new Set([...existingRoomNumbers]);

    roomNumbers.forEach(number => {
        if (allNumbers.has(number)) {
            duplicates.add(number);
        } else {
            allNumbers.add(number);
        }
    });

    return duplicates;
};

// Thay thế hàm generateRoomNumber
export const generateRoomNumber = (
    floor,
    roomIndex,
    format,
    prefix = ""
) => {
    const roomNumber = roomIndex + 1;
    // Bỏ dấu gạch ngang "-" khi thêm prefix
    const prefixStr = prefix ? `${prefix}` : '';

    switch (format) {
        case "floor-room":
            return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;

        case "sequential":
            return `${prefixStr}${roomNumber}`;

        case "padded-sequential":
            return `${prefixStr}${roomNumber.toString().padStart(2, "0")}`;

        case "letter":
        case "letter_number":
            const floorLetter = String.fromCharCode(64 + parseInt(floor)); // A=65, B=66, etc.
            return `${prefixStr}${floorLetter}${roomNumber}`;

        default:
            return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;
    }
};