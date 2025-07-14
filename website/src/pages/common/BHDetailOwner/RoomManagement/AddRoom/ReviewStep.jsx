import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Collapse,
  Alert,
  Checkbox,
  Image,
  Tag,
  Spin,
  Modal,
  message,
} from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useTheme } from "@/context/ThemeContext";
import BulkEditControls from "./BulkEditControls";
import RoomCard from "./RoomCard";
import EditRoomModal from "./EditRoomModal";
import PropTypes from "prop-types";
import { Toast } from "@chakra-ui/react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Button } from "@/component";

const { Text, Title } = Typography;
const { Panel } = Collapse;

function ReviewStep({
  rooms,
  roomTypes,
  selectedRooms,
  editingRoom,
  duplicateRooms,
  addMode,
  onRoomUpdate,
  onBulkUpdate,
  onRoomSelection,
  onFloorSelection,
  setEditingRoom,
  onBulkSubmit,
}) {
  const { darkMode } = useTheme();
  const [localRooms, setLocalRooms] = useState(rooms);
  const [updatingRooms, setUpdatingRooms] = useState(new Set());
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const { t } = useTranslation("bhManagement");

  // Thêm dòng này để tạo imageUrlCache
  const imageUrlCache = useRef(new Map()).current;

  // Sync local rooms with props
  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  const getCardClasses = () => {
    return darkMode
      ? "bg-gray-800 border-gray-600"
      : "bg-white border-gray-200";
  };

  // Enhanced room update handler with real-time preview and better persistence
  const handleRoomUpdate = useCallback(
    async (roomId, updatedRoomData, options = {}) => {
      const { isRealTime = false, isFinal = false } = options;

      try {
        // Luôn cập nhật localRooms để có real-time preview
        setLocalRooms((prevRooms) =>
          prevRooms.map((room) =>
            room._id === roomId || room.id === roomId
              ? { ...room, ...updatedRoomData }
              : room
          )
        );

        if (isFinal) {
          // Final update - show loading and call parent
          setUpdatingRooms((prev) => new Set([...prev, roomId]));

          // Đảm bảo đồng bộ lên state gốc
          if (onRoomUpdate) {
            await onRoomUpdate(roomId, updatedRoomData);
          }
        } else if (isRealTime) {
          // Đối với real-time updates, vẫn nên cập nhật lên state gốc
          // để đảm bảo dữ liệu không bị mất khi chuyển sang phòng khác
          if (onRoomUpdate) {
            onRoomUpdate(roomId, updatedRoomData, { keepLocalChanges: true });
          }
        }
      } catch (error) {
        console.error("Error updating room:", error);
        // Revert local changes on error
        setLocalRooms(rooms);
      } finally {
        if (isFinal) {
          setUpdatingRooms((prev) => {
            const newSet = new Set(prev);
            newSet.delete(roomId);
            return newSet;
          });
        }
      }
    },
    [onRoomUpdate, rooms]
  );

  // Handle bulk submit for multiple rooms
  const handleBulkSubmit = useCallback(async () => {
    if (addMode !== "bulk" || !onBulkSubmit) return;

    setIsBulkSubmitting(true);
    try {
      // Prepare rooms data as array
      const roomsToSubmit = localRooms.map((room) => ({
        roomNumber: room.roomNumber,
        floor: room.floor,
        description: room.description,
        roomTypeId: room.roomTypeId,
        image: room.image,
      }));

      // Call bulk submit function with array
      await onBulkSubmit(roomsToSubmit);
    } catch (error) {
      console.error("Error in bulk submit:", error);
    } finally {
      setIsBulkSubmitting(false);
    }
  }, [addMode, localRooms, onBulkSubmit]);

  // Enhanced bulk update handler
  const handleBulkUpdate = useCallback(
    async (updateData) => {
      if (!onBulkUpdate || selectedRooms.length === 0) return;

      setIsBulkSubmitting(true);

      try {
        // Xử lý đặc biệt cho dữ liệu hình ảnh
        let processedUpdateData = { ...updateData };

        // Đảm bảo giữ lại đúng cấu trúc dữ liệu phòng
        const updatedRooms = localRooms.map((room) => {
          const roomId = room.id || room._id;
          if (selectedRooms.includes(roomId)) {
            const updatedRoom = { ...room };

            // Cập nhật từng trường một, giữ lại các trường cũ
            if ("roomTypeId" in updateData) {
              updatedRoom.roomTypeId = updateData.roomTypeId;
            }

            if ("description" in updateData) {
              updatedRoom.description = updateData.description;
            }

            if ("image" in updateData) {
              // Xử lý ảnh
              if (updateData.image) {
                if (updateData.image instanceof File) {
                  updatedRoom.image = updateData.image;
                } else if (
                  updateData.image.file &&
                  updateData.image.file instanceof File
                ) {
                  updatedRoom.image = updateData.image.file;
                } else if (updateData.image.previewUrl) {
                  updatedRoom.image = updateData.image;
                  updatedRoom.imageDisplay = updateData.image.previewUrl;
                }
              } else {
                // Nếu xóa ảnh
                updatedRoom.image = null;
                updatedRoom.imageDisplay = null;
              }
            }

            return updatedRoom;
          }
          return room;
        });

        // Cập nhật local state
        setLocalRooms(updatedRooms);

        // Gọi hàm cập nhật của component cha
        // Đảm bảo chỉ gửi các trường đã thay đổi
        await onBulkUpdate(selectedRooms, processedUpdateData);
      } catch (error) {
        console.error("Error in bulk update:", error);
        Toast.error("Failed to update rooms");
        setLocalRooms(rooms); // Revert on error
      } finally {
        setIsBulkSubmitting(false);
      }
    },
    [onBulkUpdate, selectedRooms, localRooms, rooms]
  );

  // Group rooms by floor for display
  const roomsByFloor = localRooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {});

  // Sửa hàm getImagePreview để xử lý nhiều loại dữ liệu hình ảnh
  const getImagePreview = (imageData) => {
    if (!imageData) return null;

    // Xử lý nhiều trường hợp khác nhau

    // Trường hợp 1: Nếu là string (URL hoặc base64)
    if (typeof imageData === "string") {
      return imageData;
    }

    // Trường hợp 2: Nếu là object với preview (từ ConfigurationStep)
    if (imageData.preview) {
      return imageData.preview;
    }

    // Trường hợp 3: Nếu là File
    if (imageData instanceof File) {
      // Tạo cache cho URL để tránh memory leak
      if (!imageUrlCache.has(imageData)) {
        const url = URL.createObjectURL(imageData);
        imageUrlCache.set(imageData, url);
      }
      return imageUrlCache.get(imageData);
    }

    // Trường hợp 4: Nếu là object từ bulk edit
    if (imageData && imageData.previewUrl) {
      return imageData.previewUrl;
    }

    // Trường hợp 5: Handle blob URLs
    if (imageData && imageData.url) {
      return imageData.url;
    }

    // Debug log để xác định loại dữ liệu không được xử lý
    console.log("Unhandled image data type:", typeof imageData, imageData);

    return null;
  };

  // Thêm một cleanup effect cho URL đã tạo
  useEffect(() => {
    return () => {
      // Cleanup all created URLs on unmount
      imageUrlCache.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Handle floor selection with improved performance
  const handleFloorSelection = useCallback(
    (floor, checked) => {
      const floorRooms = roomsByFloor[floor];

      // Lấy IDs của các phòng trong tầng, xử lý cả id và _id
      const floorRoomIds = floorRooms.map((room) => room.id || room._id);

      if (checked) {
        // Thêm tất cả các ID của tầng vào selectedRooms
        const newSelectedRooms = [
          ...selectedRooms,
          ...floorRoomIds.filter((id) => !selectedRooms.includes(id)),
        ];

        if (onFloorSelection) {
          onFloorSelection(newSelectedRooms);
        } else {
          // Fallback nếu không có onFloorSelection
          floorRoomIds.forEach((id) => {
            if (!selectedRooms.includes(id)) {
              onRoomSelection(id, true);
            }
          });
        }
      } else {
        // Loại bỏ tất cả các ID của tầng khỏi selectedRooms
        const newSelectedRooms = selectedRooms.filter(
          (id) => !floorRoomIds.includes(id)
        );

        if (onFloorSelection) {
          onFloorSelection(newSelectedRooms);
        } else {
          // Fallback nếu không có onFloorSelection
          floorRoomIds.forEach((id) => {
            if (selectedRooms.includes(id)) {
              onRoomSelection(id, false);
            }
          });
        }
      }
    },
    [roomsByFloor, selectedRooms, onFloorSelection, onRoomSelection]
  );

  // Check if all rooms in a floor are selected
  const isFloorFullySelected = (floorRooms) => {
    return (
      floorRooms.length > 0 &&
      floorRooms.every((room) => selectedRooms.includes(room.id || room._id))
    );
  };

  // Check if some rooms in a floor are selected
  const isFloorPartiallySelected = (floorRooms) => {
    return (
      floorRooms.some((room) => selectedRooms.includes(room.id || room._id)) &&
      !floorRooms.every((room) => selectedRooms.includes(room.id || room._id))
    );
  };

  // Tính toán số phòng đã chọn trong từng tầng
  const countSelectedRoomsInFloor = useCallback(
    (floorRooms) => {
      return floorRooms.filter((room) =>
        selectedRooms.includes(room.id || room._id)
      ).length;
    },
    [selectedRooms]
  );

  const renderErrorSummary = () => {
    if (duplicateRooms.size === 0) return null;

    return (
      <Alert
        message={t("roomManagement.errorSummary.duplicateRoomsTitle")}
        description={t("roomManagement.errorSummary.duplicateRoomsContent", {
          rooms: Array.from(duplicateRooms).join(", "),
        })}
        type="error"
        showIcon
        className="mb-4"
      />
    );
  };

  const renderValidationSummary = () => {
    const totalRooms = localRooms.length;
    const roomsWithErrors = localRooms.filter((room) => room.hasError).length;
    const roomsWithoutType = localRooms.filter(
      (room) => !room.roomTypeId
    ).length;
    const roomsWithoutDescription = localRooms.filter(
      (room) => !room.description
    ).length;
    const roomsWithoutImage = localRooms.filter((room) => !room.image).length;

    if (
      roomsWithErrors === 0 &&
      roomsWithoutType === 0 &&
      roomsWithoutDescription === 0 &&
      roomsWithoutImage === 0
    ) {
      return (
        <Alert
          message={t("roomManagement.validationSummary.allRoomsReady")}
          description={t(
            "roomManagement.validationSummary.allRoomsReadyDescription"
          )}
          type="success"
          showIcon
          className="mb-4"
        />
      );
    }

    return (
      <Alert
        message={t("roomManagement.validationSummary.title")}
        description={
          <div className="space-y-1">
            <div>
              {t("roomManagement.validationSummary.totalRooms", {
                count: totalRooms,
              })}
            </div>
            {roomsWithErrors > 0 && (
              <div className="text-red-500">
                {t("roomManagement.validationSummary.roomsWithErrors", {
                  count: roomsWithErrors,
                })}
              </div>
            )}
            {roomsWithoutType > 0 && (
              <div className="text-orange-500">
                {t("roomManagement.validationSummary.roomsWithoutType", {
                  count: roomsWithoutType,
                })}
              </div>
            )}
            {roomsWithoutDescription > 0 && (
              <div className="text-orange-500">
                {t("roomManagement.validationSummary.roomsWithoutDescription", {
                  count: roomsWithoutDescription,
                })}
              </div>
            )}
            {roomsWithoutImage > 0 && (
              <div className="text-orange-500">
                {t("roomManagement.validationSummary.roomsWithoutImage", {
                  count: roomsWithoutImage,
                })}
              </div>
            )}
          </div>
        }
        type="warning"
        showIcon
        className="mb-4"
      />
    );
  };

  const renderSingleRoomReview = () => {
    const room = localRooms[0];
    if (!room) return null; // Phòng đã bị xóa

    const roomType = roomTypes.find((t) => t._id === room.roomTypeId);
    const imagePreviewUrl = getImagePreview(room.image);
    const isUpdating = updatingRooms.has(room._id || room.id);
    const roomId = room.id || room._id;

    return (
      <div>
        {renderErrorSummary()}
        {renderValidationSummary()}

        <Card className={getCardClasses()}>
          <Spin
            spinning={isUpdating}
            tip={t("roomManagement.reviewStep.updatingRoom")}
          >
            <div className="flex justify-between items-center mb-4">
              <Title level={4}>
                {t("roomManagement.reviewStep.roomDetailsPreview")}
              </Title>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteRoom(roomId)}
              >
                {t("roomManagement.reviewStep.deleteRoom")}
              </Button>
            </div>

            <Row gutter={24}>
              <Col span={12}>
                <RoomCard
                  room={room}
                  roomTypes={roomTypes}
                  isSelected={false}
                  onSelect={() => {}}
                  onEdit={() => setEditingRoom(room.id || room._id)}
                  showCheckbox={false}
                />
              </Col>
              <Col span={12}>
                <div className="space-y-4">
                  <div>
                    <Text strong>{t("roomManagement.reviewStep.floor")}:</Text>
                    <Text className="ml-2">{room.floor}</Text>
                  </div>
                  <div>
                    <Text strong>{t("roomManagement.table.roomNumber")}:</Text>
                    <Text
                      className={`ml-2 ${room.hasError ? "text-red-500" : ""}`}
                    >
                      {room.roomNumber}
                    </Text>
                    {room.hasError && (
                      <div className="text-red-500 text-xl">
                        {room.errorMessage}
                      </div>
                    )}
                  </div>
                  <div>
                    <Text strong>{t("roomManagement.table.roomType")}:</Text>
                    <Tag color={roomType ? "blue" : "red"} className="ml-2">
                      {roomType
                        ? roomType.typeName
                        : t("roomManagement.common.unknown")}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>
                      {t("roomManagement.reviewStep.description")}:
                    </Text>
                    <div className="ml-2 mt-1 p-2 bg-gray-50 rounded text-xl">
                      {room.description || t("roomManagement.common.unknown")}
                    </div>
                  </div>
                  <div>
                    <Text strong>{t("roomManagement.reviewStep.image")}:</Text>
                    <div className="ml-2 mt-2">
                      {imagePreviewUrl ? (
                        <div>
                          <Image
                            width={150}
                            height={100}
                            src={imagePreviewUrl}
                            alt={`Room ${room.roomNumber}`}
                            className="rounded border object-cover"
                            preview={{
                              mask: (
                                <div className="text-xl">
                                  {t(
                                    "roomManagement.reviewStep.clickToPreview"
                                  )}
                                </div>
                              ),
                            }}
                          />
                          <div className="text-xl text-gray-500 mt-1">
                            {room.image?.name ||
                              t("roomManagement.reviewStep.imageUploaded")}
                          </div>
                        </div>
                      ) : (
                        <Tag color="orange">
                          {t("roomManagement.reviewStep.noImageUploaded")}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Spin>
        </Card>
      </div>
    );
  };

  const renderBulkRoomReview = () => (
    <div>
      {renderErrorSummary()}
      {renderValidationSummary()}

      {/* Bulk Edit Controls */}
      <BulkEditControls
        selectedRooms={selectedRooms}
        roomTypes={roomTypes}
        onBulkUpdate={handleBulkUpdate}
        onBulkDelete={handleBulkDeleteRooms}
        cardClasses={getCardClasses()}
        isSubmitting={isBulkSubmitting}
      />

      {/* Bulk Submit Button */}
      {addMode === "bulk" && onBulkSubmit && (
        <Card className={`${getCardClasses()} mb-4`}>
          <div className="flex justify-between items-center">
            <div>
              <Text strong>
                {t("roomManagement.bulkCreationCard.readyToCreate", {
                  count: localRooms.length,
                })}
              </Text>
              <div className="text-xl text-gray-500 mt-1">
                {t("roomManagement.bulkCreationCard.batchDescription")}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Rooms by Floor */}
      <Collapse defaultActiveKey={Object.keys(roomsByFloor)}>
        {Object.entries(roomsByFloor).map(([floor, floorRooms]) => {
          const floorStats = {
            total: floorRooms.length,
            withErrors: floorRooms.filter((room) => room.hasError).length,
            withoutType: floorRooms.filter((room) => !room.roomTypeId).length,
            withoutImage: floorRooms.filter((room) => !room.image).length,
          };

          const selectedRoomsInFloor = countSelectedRoomsInFloor(floorRooms);
          console.log(floor, "selectedRoomsInFloor:", selectedRoomsInFloor);

          return (
            <Panel
              key={floor}
              header={
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Text strong>
                      {t("roomManagement.reviewStep.floorWith", {
                        floor: floor || "Không xác định",
                        count: floorRooms?.length || 0,
                      })}
                    </Text>
                    {/* Floor stats */}
                    <div className="flex space-x-2">
                      {floorStats.withErrors > 0 && (
                        <Tag color="red" size="small">
                          {t("roomManagement.reviewStep.errors", {
                            count: floorStats.withErrors,
                          })}
                        </Tag>
                      )}
                      {floorStats.withoutType > 0 && (
                        <Tag color="orange" size="small">
                          {t("roomManagement.reviewStep.noType", {
                            count: floorStats.withoutType,
                          })}
                        </Tag>
                      )}
                      {floorStats.withoutImage > 0 && (
                        <Tag color="blue" size="small">
                          {t("roomManagement.reviewStep.noImage", {
                            count: floorStats.withoutImage,
                          })}
                        </Tag>
                      )}
                    </div>
                  </div>
                  <Checkbox
                    checked={isFloorFullySelected(floorRooms)}
                    indeterminate={isFloorPartiallySelected(floorRooms)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleFloorSelection(floor, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isBulkSubmitting}
                  >
                    {t("roomManagement.reviewStep.selectAll", {
                      selected: selectedRoomsInFloor,
                      total: floorRooms.length,
                    })}
                  </Checkbox>
                </div>
              }
            >
              <Row gutter={16}>
                {floorRooms.map((room) => {
                  const roomId = room.id || room._id;
                  const isUpdating = updatingRooms.has(roomId);

                  return (
                    <Col span={12} key={roomId} className="mb-4">
                      <Spin
                        spinning={isUpdating || isBulkSubmitting}
                        size="small"
                      >
                        <RoomCard
                          room={room}
                          roomTypes={roomTypes}
                          isSelected={selectedRooms.includes(roomId)}
                          onSelect={(checked) =>
                            onRoomSelection(roomId, checked)
                          }
                          onEdit={() => setEditingRoom(roomId)}
                          onDelete={() => handleDeleteRoom(roomId)}
                          showCheckbox={true}
                          disabled={isBulkSubmitting}
                        />
                      </Spin>
                    </Col>
                  );
                })}
              </Row>
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );

  // Thêm hàm xử lý xóa một phòng
  const handleDeleteRoom = useCallback(
    (roomId) => {
      Modal.confirm({
        title: t("roomManagement.reviewStep.confirmDeleteTitle"),
        icon: <ExclamationCircleOutlined />,
        content: t("roomManagement.reviewStep.confirmDeleteContent"),
        okText: t("roomManagement.common.delete"),
        okType: "danger",
        cancelText: t("roomManagement.common.cancel"),
        onOk() {
          // Xóa phòng khỏi localRooms
          setLocalRooms((prevRooms) =>
            prevRooms.filter(
              (room) => room.id !== roomId && room._id !== roomId
            )
          );

          // Xóa khỏi selectedRooms nếu đã được chọn
          if (selectedRooms.includes(roomId)) {
            if (onFloorSelection) {
              onFloorSelection(selectedRooms.filter((id) => id !== roomId));
            } else {
              onRoomSelection(roomId, false);
            }
          }

          toast.success(t("roomManagement.reviewStep.roomDeletedSuccess"));
        },
      });
    },
    [selectedRooms, onFloorSelection, onRoomSelection, t]
  );

  // Thêm hàm xóa nhiều phòng đã chọn cùng lúc
  const handleBulkDeleteRooms = useCallback(() => {
    if (selectedRooms.length === 0) {
      message.info(t("roomManagement.reviewStep.selectRoomsToDelete"));
      return;
    }

    Modal.confirm({
      title: t("roomManagement.reviewStep.confirmBulkDeleteTitle"),
      icon: <ExclamationCircleOutlined />,
      content: t("roomManagement.reviewStep.confirmBulkDeleteContent", {
        count: selectedRooms.length,
      }),
      okText: t("roomManagement.common.delete"),
      okType: "danger",
      cancelText: t("roomManagement.common.cancel"),
      onOk() {
        // Xóa tất cả các phòng đã chọn
        setLocalRooms((prevRooms) =>
          prevRooms.filter(
            (room) =>
              !selectedRooms.includes(room.id) &&
              !selectedRooms.includes(room._id)
          )
        );

        // Xóa tất cả phòng khỏi danh sách đã chọn
        if (onFloorSelection) {
          onFloorSelection([]);
        }

        message.success(
          t("roomManagement.reviewStep.roomsDeletedSuccess", {
            count: selectedRooms.length,
          })
        );
      },
    });
  }, [selectedRooms, onFloorSelection, t]);

  return (
    <div>
      <Spin
        spinning={isBulkSubmitting}
        tip={t("roomManagement.reviewStep.processingRooms")}
      >
        {addMode === "single"
          ? renderSingleRoomReview()
          : renderBulkRoomReview()}
      </Spin>

      {/* Edit Room Modal */}
      <EditRoomModal
        room={
          editingRoom && localRooms.length > 0
            ? localRooms.find(
                (r) => r.id === editingRoom || r._id === editingRoom
              )
            : null
        }
        roomTypes={roomTypes || []}
        onClose={() => setEditingRoom(null)}
        onUpdate={handleRoomUpdate}
        visible={!!editingRoom}
      />
    </div>
  );
}

export default ReviewStep;

ReviewStep.propTypes = {
  rooms: PropTypes.array.isRequired,
  roomTypes: PropTypes.array.isRequired,
  selectedRooms: PropTypes.array.isRequired,
  editingRoom: PropTypes.string,
  duplicateRooms: PropTypes.instanceOf(Set).isRequired,
  addMode: PropTypes.string.isRequired,
  onRoomUpdate: PropTypes.func.isRequired,
  onBulkUpdate: PropTypes.func.isRequired,
  onRoomSelection: PropTypes.func.isRequired,
  onFloorSelection: PropTypes.func.isRequired,
  setEditingRoom: PropTypes.func.isRequired,
  onBulkSubmit: PropTypes.func, // Optional for bulk mode
};
