import React, { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import {
  GracePeriodModal,
  ExpiredModal,
  LimitExceededModal,
} from "../SubscriptionModals";

const SubscriptionChecker = ({
  user,
  children,
  limitType,
  currentCount,
  onUpgrade,
}) => {
  const subscription = useSubscription(user);
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const navigate = useNavigate();

  // Hàm mặc định khi nâng cấp gói
  const handleUpgrade = () => {
    if (typeof onUpgrade === "function") {
      onUpgrade();
    } else {
      // Chuyển hướng đến trang subscription
      navigate("/subscription");
    }
    setShowModal(false);
  };

  const handleActionClick = (e) => {
    // Ngăn chặn hành động mặc định
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Lưu lại event và hành động để có thể sử dụng sau
    const originalAction = () => {
      if (children.props.onClick) {
        // Tạo một bản sao của event hoặc tạo event mới nếu cần
        const syntheticEvent = e || { defaultPrevented: false };
        children.props.onClick(syntheticEvent);
      }
    };

    setPendingAction(() => originalAction);

    // Nếu đã hết hạn hoàn toàn
    if (subscription.isExpired) {
      setShowModal("expired");
      return; // Không tiếp tục xử lý, chờ người dùng quyết định
    }

    // Kiểm tra giới hạn
    const limitCheck = subscription.checkLimit(limitType, currentCount);
    if (limitCheck.isExceeding) {
      setShowModal("limit");
      return; // Không tiếp tục xử lý
    }

    // Nếu trong grace period, hiển thị cảnh báo và KHÔNG thực hiện action
    if (subscription.isInGracePeriod) {
      setShowModal("grace");
      return; // Chờ người dùng quyết định, không thực hiện hành động ngay
    }

    // Nếu mọi thứ OK, thực hiện action ban đầu
    originalAction();
    setPendingAction(null); // Xóa action đang chờ vì đã thực hiện xong
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingAction(null); // Xóa action đang chờ khi đóng modal mà không thực hiện
  };

  // Thực hiện action ban đầu khi người dùng chọn "Tiếp tục"
  const executePendingAction = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const limitCheck = subscription.checkLimit(limitType, currentCount);

  return (
    <>
      {React.cloneElement(children, { onClick: handleActionClick })}

      <GracePeriodModal
        isOpen={showModal === "grace"}
        onClose={closeModal}
        graceDaysRemaining={subscription.graceDaysRemaining}
        onUpgrade={handleUpgrade} // Chuyển hàm xử lý nâng cấp
        onContinue={executePendingAction} // Chỉ khi người dùng chọn "Tiếp tục" thì action mới được thực hiện
      />

      <ExpiredModal
        isOpen={showModal === "expired"}
        onClose={closeModal}
        onUpgrade={handleUpgrade} // Chuyển hàm xử lý nâng cấp
        onContinue={executePendingAction} // Thêm onContinue để người dùng có thể tiếp tục nếu muốn
      />

      <LimitExceededModal
        isOpen={showModal === "limit"}
        onClose={closeModal}
        limitType={limitType}
        currentCount={currentCount}
        maxLimit={limitCheck.limit}
        onUpgrade={handleUpgrade} // Chuyển hàm xử lý nâng cấp
        // KHÔNG có onContinue ở đây, người dùng không thể vượt quá giới hạn
      />
    </>
  );
};

export default SubscriptionChecker;
