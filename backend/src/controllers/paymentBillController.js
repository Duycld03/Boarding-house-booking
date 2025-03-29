import PaymentBill from "../models/paymentBill.js";
import Room from "../models/room.js";

class PaymentBillController {
  async getPaymentBillByBoardingHouseId(req, res) {
    try {
      const { boardingHouseId } = req.params;

      const rooms = await Room.find({ boardingHouseId });

      if (!rooms.length) {
        return res
          .status(404)
          .json({ message: "No rooms found for this boarding house." });
      }

      const roomIds = rooms.map((room) => room._id);

      const paymentBills = await PaymentBill.find({
        roomId: { $in: roomIds },
      }).populate("roomId");

      if (!paymentBills.length) {
        return res
          .status(404)
          .json({ message: "No payment bills found for this boarding house." });
      }

      const formattedBills = paymentBills.map((bill) => {
        if (!bill.month || !bill.year) {
          return res.status(400).json({
            message: `Invalid month/year for room ${bill.roomId?.roomNumber}`,
          });
        }

        let totalFee = 0;
        bill.additionalFee.forEach((fee) => {
          totalFee += fee.feeAmount || 0;
        });

        return {
          roomNumber: bill.roomId?.roomNumber || "N/A",
          rentMonth: `${bill.month}/${bill.year}`,
          status: bill.status,
          additionalFee: totalFee,
          electricalBill: bill.electricalBill?.totalAmount || 0, // Tiền điện (VND)
          waterBill: bill.waterBill?.totalAmount || 0, // Tiền nước (VND)
          paymentAmount: bill.paymentAmount || 0, // Tổng tiền thanh toán (VND)
        };
      });

      return res.status(200).json(formattedBills);
    } catch (error) {
      console.error("Error fetching payment bills:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new PaymentBillController();
