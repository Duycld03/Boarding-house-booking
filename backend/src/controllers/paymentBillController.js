import PaymentBill from "../models/paymentBill.js";
import Revenue from "../models/revenue.js";
import Room from "../models/room.js";
import UserPayment from "../models/userPayment.js";

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
      })
        .populate("roomId")
        .sort({ createdAt: -1 });

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
          electricalBill: bill.electricalBill?.totalAmount || 0,
          waterBill: bill.waterBill?.totalAmount || 0,
          paymentAmount: bill.paymentAmount || 0,
        };
      });

      return res.status(200).json(formattedBills);
    } catch (error) {
      console.error("Error fetching payment bills:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async calculateMonthlyRoomRent(req, res) {
    try {
      const {
        roomId,
        paymentAmount,
        electricalBill,
        waterBill,
        additionalFees,
      } = req.body;

      const now = new Date();
      const month = now.getMonth() === 0 ? 12 : now.getMonth();
      const year =
        now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      const existingBills = await PaymentBill.find({ roomId, month, year });
      if (existingBills.length > 0) {
        return res
          .status(400)
          .json({ message: "This month's rent has been paid." });
      }

      const room = await Room.findById(roomId).populate("rentBy");
      if (!room) {
        return res.status(404).json({ message: "Not found room" });
      }

      console.log(additionalFees);

      const additionalFee = additionalFees.map((fee) => {
        return { feeName: fee.name, feeAmount: fee.amount };
      });

      // Tạo PaymentBill
      const newPaymentBill = await PaymentBill.create({
        roomId,
        paymentAmount,
        status: "pending",
        electricalBill: {
          oldNumber: electricalBill.oldNumber,
          newNumber: electricalBill.newNumber,
          quantityConsumed: electricalBill.newNumber - electricalBill.oldNumber,
          totalAmount: electricalBill.totalAmount,
        },
        waterBill: {
          oldNumber: waterBill.oldNumber,
          newNumber: waterBill.newNumber,
          quantityConsumed: waterBill.newNumber - waterBill.oldNumber,
          totalAmount: waterBill.totalAmount,
        },
        additionalFee: additionalFee,
        month,
        year,
      });

      // Chia tiền bill cho số lượng người ở phòng
      const totalPeople = room.rentBy.length;
      const splitAmount = paymentAmount / totalPeople;
      console.log(totalPeople, splitAmount);

      // Tạo UserPayment cho mỗi người ở trong phòng
      const userPayments = room.rentBy.map((user) => ({
        paymentBillId: newPaymentBill._id,
        accountId: user._id,
        paymentAmount: splitAmount,
        status: "Pending",
        paymentMethod: "",
      }));
      await UserPayment.insertMany(userPayments);

      let revenue = await Revenue.findOne({
        month,
        year,
        boardingHouseId: room.boardingHouseId,
      });
      if (!revenue) {
        revenue = await Revenue.create({
          boardingHouseId: room.boardingHouseId,
          month,
          year,
          totalRevenue: paymentAmount,
          transactionCount: 1,
          transactions: [newPaymentBill._id],
        });
      } else {
        revenue.transactions.push(newPaymentBill._id);
        revenue.totalRevenue += paymentAmount;
        revenue.transactionCount += 1;
        await revenue.save();
      }

      res.status(201).json({
        message: "Calculate monthly rent successfully",
        paymentBill: newPaymentBill,
      });
    } catch (error) {
      console.error("Error calculating monthly rent:", error);
      res
        .status(500)
        .json({ message: "Error calculate", error: error.message });
    }
  }
}

export default new PaymentBillController();
