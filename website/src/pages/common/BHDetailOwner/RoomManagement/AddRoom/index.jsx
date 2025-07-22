import { useEffect, useState } from "react";
import { Modal, Form } from "antd";
import { Button, ConfirmModal } from "@/component";
import { toast } from "react-toastify";
import { addRoom, getRoomTypeByBhId } from "@/api/ownerUser/boardingHouseAPI";
import { useTranslation } from "react-i18next";

import ConfigurationStep from "./ConfigurationStep";
import ReviewStep from "./ReviewStep";
import { checkDuplicates } from "@/utils/roomUtils";
import "./AddRoom.css"; // Import custom styles

function AddRoom({ boardingHouseId, refreshRoomData, onSwitchToRoomType }) {
  const [form] = Form.useForm();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [visible, setVisible] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [step, setStep] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [editingRoom, setEditingRoom] = useState(null);
  const [duplicateRooms, setDuplicateRooms] = useState(new Set());
  const [existingRoomNumbers, setExistingRoomNumbers] = useState(new Set());
  const [addMode, setAddMode] = useState("bulk"); // "bulk" or "single"
  // Thêm state mới để điều khiển ConfirmModal
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const { t } = useTranslation("bhManagement");

  // Fetch room types when modal opens
  const fetchRoomTypes = async () => {
    if (!visible) return;
    try {
      const res = await getRoomTypeByBhId(boardingHouseId);
      setRoomTypes(res.data);
      if (res.data.length === 0) {
        throw new Error("No room type found");
      }
    } catch (error) {
      // Thay vì sử dụng Modal.confirm, hiển thị ConfirmModal
      setConfirmModalVisible(true);
    }
  };

  // Xử lý các hành động cho ConfirmModal
  const handleConfirmOk = () => {
    setVisible(false);
    setConfirmModalVisible(false);
    if (onSwitchToRoomType) {
      onSwitchToRoomType();
    }
  };

  const handleConfirmCancel = () => {
    setConfirmModalVisible(false);
    setVisible(false);
  };

  useEffect(() => {
    fetchRoomTypes();
  }, [visible]);

  // Generate room number based on format
  const generateRoomNumber = (floor, roomIndex, format, prefix = "") => {
    const roomNumber = roomIndex + 1;
    // Bỏ dấu gạch ngang "-" khi thêm prefix
    const prefixStr = prefix ? `${prefix}` : "";

    switch (format) {
      case "floor-room":
        return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;

      case "sequential":
        return `${prefixStr}${roomNumber}`;

      case "padded-sequential":
        return `${prefixStr}${roomNumber.toString().padStart(2, "0")}`;

      case "letter":
        const floorLetter = String.fromCharCode(64 + parseInt(floor)); // A=65, B=66, etc.
        return `${prefixStr}${floorLetter}${roomNumber}`;

      default:
        return `${prefixStr}${floor}${roomNumber.toString().padStart(2, "0")}`;
    }
  };

  // Handle configuration step submit
  const onConfigurationSubmit = (values) => {
    if (addMode === "single") {
      // Single room mode
      const { roomNumber, roomTypeId, description, image } = values;

      // Xử lý image có thể là object hoặc File
      let processedImage = null;
      if (image) {
        if (image.preview) {
          // Nếu là object chứa preview
          processedImage = {
            file: image.file,
            preview: image.preview,
            name: image.name,
            size: image.size,
          };
        } else if (image instanceof File) {
          // Nếu là File trực tiếp
          processedImage = image;
        }
      }

      const singleRoom = {
        id: `single-${Date.now()}`,
        floor: "1", // Default floor for single room
        roomNumber: roomNumber,
        roomTypeId: roomTypeId,
        description: description,
        image: processedImage,
        hasError: false,
        errorMessage: "",
      };

      const duplicates = new Set();
      if (existingRoomNumbers.has(singleRoom.roomNumber)) {
        duplicates.add(singleRoom.roomNumber);
        singleRoom.hasError = true;
        singleRoom.errorMessage = "Room number already exists";
      }

      setRooms([singleRoom]);
      setDuplicateRooms(duplicates);
    } else {
      // Bulk mode
      const { numberingFormat, floorConfigs } = values; // Không còn customFormat

      // Generate rooms from floor configurations
      const generatedRooms = generateRoomsFromFloorConfigs(
        floorConfigs,
        numberingFormat
      );

      const duplicates = checkDuplicates(generatedRooms, existingRoomNumbers);

      const roomsWithErrors = generatedRooms.map((room) => ({
        ...room,
        hasError: duplicates.has(room.roomNumber),
        errorMessage: duplicates.has(room.roomNumber)
          ? "Room number already exists"
          : "",
      }));

      setRooms(roomsWithErrors);
      setDuplicateRooms(duplicates);
    }
    setStep(2);
  };

  // Generate rooms from floor configurations
  const generateRoomsFromFloorConfigs = (floorConfigs, numberingFormat) => {
    const rooms = [];
    let sequentialCounter = 0; // Counter for sequential numbering across floors

    // Sort floor configs by floor number to ensure correct sequential numbering
    const sortedFloorConfigs = [...floorConfigs].sort(
      (a, b) => a.floor - b.floor
    );

    sortedFloorConfigs.forEach((config, configIndex) => {
      const { floor, roomCount, roomType, namePrefix } = config;

      // Validate required fields
      if (!floor || !roomCount || !roomType) {
        console.warn(
          `Skipping floor config ${configIndex} due to missing required fields:`,
          config
        );
        return;
      }

      // Generate rooms for this floor
      for (let i = 0; i < roomCount; i++) {
        // For sequential formats, use the sequential counter instead of i
        const roomIndex =
          numberingFormat === "sequential" ||
          numberingFormat === "padded-sequential"
            ? sequentialCounter
            : i;

        const roomNumber = generateRoomNumber(
          floor,
          roomIndex,
          numberingFormat,
          namePrefix || ""
        );

        // Tạo mô tả tự động dựa trên thông tin có sẵn
        let description = "";
        if (namePrefix) {
          description = `${namePrefix} Room ${roomNumber} on floor ${floor}`;
        } else {
          description = `Room ${roomNumber} on floor ${floor}`;
        }

        rooms.push({
          id: `bulk-${floor}-${i + 1}-${Date.now()}-${configIndex}`,
          floor: floor.toString(),
          roomNumber: roomNumber,
          roomTypeId: roomType,
          description: description,
          image: null,
          hasError: false,
          errorMessage: "",
        });

        // Increment the sequential counter for each room
        sequentialCounter++;
      }
    });

    return rooms;
  };

  // Handle final submission
  const onBulkSubmit = async () => {
    // Kiểm tra nếu không còn phòng nào
    if (rooms.length === 0) {
      toast.error("No rooms to create. Please add some rooms first.");
      return;
    }

    // Validation
    const hasErrors = rooms.some((room) => room.hasError);
    if (hasErrors) {
      toast.error(t("roomManagement.bulkAddRoom.validation.fixErrorsFirst"));
      return;
    }

    // Kiểm tra chi tiết các trường bắt buộc
    const missingFields = rooms.filter((room) => {
      // Kiểm tra chi tiết từng trường một
      const missingType = !room.roomTypeId;
      const missingDescription =
        !room.description || room.description.trim() === "";

      return missingType || missingDescription;
    });

    if (missingFields.length > 0) {
      // Hiển thị thông báo cụ thể hơn
      const roomNumbers = missingFields.map((r) => r.roomNumber).join(", ");
      toast.error(
        `${t(
          "roomManagement.bulkAddRoom.validation.missingRequiredFields"
        )} for rooms: ${roomNumbers}`
      );
      return;
    }

    setLoadingSubmit(true);

    try {
      // Submit rooms (can handle both single and multiple)
      const roomsToSubmit = rooms.map((room) => ({
        roomNumber: room.roomNumber,
        boardingHouseId: boardingHouseId,
        description: room.description,
        roomTypeId: room.roomTypeId,
        image: room.image,
      }));

      // Process each room
      const promises = roomsToSubmit.map((roomData) => {
        const formData = new FormData();
        formData.append("roomNumber", roomData.roomNumber);
        formData.append("boardingHouseId", roomData.boardingHouseId);
        formData.append("description", roomData.description);
        formData.append("roomTypeId", roomData.roomTypeId);

        // Xử lý ảnh - hỗ trợ nhiều trường hợp
        if (roomData.image) {
          if (roomData.image instanceof File) {
            formData.append("Room", roomData.image);
          } else if (roomData.image.file instanceof File) {
            formData.append("Room", roomData.image.file);
          } else if (
            roomData.image.preview &&
            roomData.image.file instanceof File
          ) {
            formData.append("Room", roomData.image.file);
          } else if (roomData.image.originFileObj instanceof File) {
            formData.append("Room", roomData.image.originFileObj);
          } else if (
            typeof roomData.image === "string" &&
            roomData.image.startsWith("data:")
          ) {
            // Handle base64 image - convert back to file
            const arr = roomData.image.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }

            const imageFile = new File([u8arr], "image.jpg", { type: mime });
            formData.append("Room", imageFile);
          } else if (
            typeof roomData.image.preview === "string" &&
            roomData.image.preview.startsWith("data:")
          ) {
            // Handle base64 preview
            const arr = roomData.image.preview.split(",");
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }

            const imageFile = new File(
              [u8arr],
              roomData.image.name || "image.jpg",
              { type: mime }
            );
            formData.append("Room", imageFile);
            console.log("Converting preview base64 to File for upload");
          } else {
            console.warn("Unhandled image type:", roomData.image);
          }
        }

        return addRoom(formData);
      });

      await Promise.all(promises);

      refreshRoomData();
      toast.success(
        t("roomManagement.bulkAddRoom.success", { count: rooms.length })
      );
      onCancel();
    } catch (error) {
      console.error("Error submitting rooms:", error);
      toast.error(
        error.response?.data?.message || t("roomManagement.bulkAddRoom.error")
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Reset modal state
  const onCancel = () => {
    setVisible(false);
    setStep(1);
    setAddMode("bulk");
    form.resetFields();
    setRooms([]);
    setSelectedRooms([]);
    setEditingRoom(null);
    setDuplicateRooms(new Set());
  };

  // Room update handler
  const handleRoomUpdate = (roomId, updatedData, options = {}) => {
    // Thay đổi cách cập nhật để nhận toàn bộ object thay vì từng field
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, ...updatedData } : room
      )
    );

    // Nếu là thay đổi roomNumber, kiểm tra trùng lặp
    if (updatedData.roomNumber) {
      const otherRooms = rooms.filter((r) => r.id !== roomId);
      const allRoomNumbers = [
        ...otherRooms.map((r) => r.roomNumber),
        updatedData.roomNumber,
      ];
      const duplicates = checkDuplicates(allRoomNumbers, existingRoomNumbers);

      if (duplicates.has(updatedData.roomNumber)) {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  ...updatedData,
                  hasError: true,
                  errorMessage: "Room number already exists",
                }
              : room
          )
        );
      }
    }
  };

  // Bulk update handler
  const handleBulkUpdate = (selectedRoomIds, updateData) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (selectedRoomIds.includes(room.id || room._id)) {
          const updatedRoom = { ...room };

          // Cập nhật từng trường một, không ghi đè toàn bộ
          if ("roomTypeId" in updateData) {
            updatedRoom.roomTypeId = updateData.roomTypeId;
          }

          if ("description" in updateData) {
            updatedRoom.description = updateData.description;
          }

          if ("image" in updateData) {
            if (updateData.image === null) {
              // Xóa ảnh
              updatedRoom.image = null;
            } else if (updateData.image instanceof File) {
              updatedRoom.image = updateData.image;
            } else if (updateData.image.file instanceof File) {
              updatedRoom.image = updateData.image.file;
            }
          }

          return updatedRoom;
        }
        return room;
      })
    );
  };

  // Room selection handlers
  const handleRoomSelection = (roomId, checked) => {
    setSelectedRooms((prev) =>
      checked ? [...prev, roomId] : prev.filter((id) => id !== roomId)
    );
  };

  const handleFloorSelection = (newSelectedRooms) => {
    // Cập nhật trực tiếp danh sách phòng đã chọn
    setSelectedRooms(newSelectedRooms);
  };

  const getModalTitle = () => {
    if (step === 1) {
      return addMode === "single"
        ? t("roomManagement.addRoom.modal.singleModeTitle")
        : t("roomManagement.addRoom.modal.bulkModeTitle");
    }
    return addMode === "single"
      ? t("roomManagement.addRoom.modal.singleModeReviewTitle")
      : t("roomManagement.addRoom.modal.bulkModeReviewTitle");
  };

  return (
    <div>
      <div className="flex justify-between mb-4 ml-2">
        <Button
          title={t("roomManagement.addRoom.button.bulkAddRoom")}
          btnAdd
          size="large"
          onClick={() => setVisible(true)}
        />
      </div>

      {/* Thêm ConfirmModal component */}
      <ConfirmModal
        title={t("roomManagement.addRoom.noRoomType.title")}
        content={t("roomManagement.addRoom.noRoomType.content")}
        isOpen={confirmModalVisible}
        onOk={handleConfirmOk}
        onCancel={handleConfirmCancel}
        confirmLoading={false}
      />

      {/* Modal hiện tại giữ nguyên */}
      <Modal
        confirmLoading={loadingSubmit}
        title={getModalTitle()}
        onCancel={onCancel}
        open={visible}
        width={step === 1 ? 800 : 1200}
        footer={
          <div className="flex justify-between items-center">
            <div>
              {step === 2 && (
                <Button
                  title={t("roomManagement.addRoom.backToConfiguration")}
                  onClick={() => setStep(1)}
                />
              )}
            </div>
            <div className="flex space-x-3 items-center">
              <Button
                title={t("roomManagement.addRoom.button.btnCancel")}
                btnCancel
                onClick={onCancel}
              />
              {step === 1 ? (
                <Button
                  onClick={() => form.submit()}
                  btnAdd
                  loading={loadingSubmit}
                  title={
                    addMode === "single"
                      ? t("roomManagement.addRoom.reviewRoom")
                      : t("roomManagement.addRoom.generateRooms")
                  }
                />
              ) : (
                <Button
                  onClick={onBulkSubmit}
                  btnAdd
                  loading={loadingSubmit}
                  disabled={
                    rooms.some((room) => room.hasError) || rooms.length === 0
                  }
                  title={
                    addMode === "single"
                      ? t("roomManagement.addRoom.createRoom")
                      : t("roomManagement.addRoom.createAllRooms", {
                          count: rooms.length,
                        })
                  }
                />
              )}
            </div>
          </div>
        }
        destroyOnClose
      >
        {step === 1 ? (
          <ConfigurationStep
            form={form}
            roomTypes={roomTypes}
            addMode={addMode}
            setAddMode={setAddMode}
            onSubmit={onConfigurationSubmit}
          />
        ) : (
          <ReviewStep
            rooms={rooms}
            roomTypes={roomTypes}
            selectedRooms={selectedRooms}
            editingRoom={editingRoom}
            duplicateRooms={duplicateRooms}
            addMode={addMode}
            onRoomUpdate={handleRoomUpdate}
            onBulkUpdate={handleBulkUpdate}
            onRoomSelection={handleRoomSelection}
            onFloorSelection={handleFloorSelection}
            setEditingRoom={setEditingRoom}
            onBulkSubmit={onBulkSubmit}
          />
        )}
      </Modal>
    </div>
  );
}

export default AddRoom;
