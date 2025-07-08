import PaymentBill from "../models/paymentBill.js";
import Revenue from "../models/revenue.js";
import Room from "../models/room.js";
import UserPayment from "../models/userPayment.js";
import DepositRoom from "../models/depositRoom.js";
import paginate from "../utils/pagination.js";

class PaymentBillController {
  async getPaymentBillByBoardingHouseId(req, res) {
    try {
      const { boardingHouseId } = req.params;

      // First check if boarding house has rooms
      const rooms = await Room.find({ boardingHouseId });
      if (!rooms.length) {
        return res.status(404).json({
          success: false,
          message: "No rooms found for this boarding house.",
        });
      }

      const roomIds = rooms.map((room) => room._id);

      // Setup pagination options with filter for payment bills
      const paginationOptions = {
        defaultPage: 1,
        defaultLimit: 10,
        maxLimit: 100,
        sortField: "createdAt",
        sortOrder: "desc",
        filter: {
          roomId: { $in: roomIds },
        },
        allowQueryFilters: ["status", "month", "year"],
        allowSearchFields: ["roomId", "status"],
        populate: [
          {
            path: "roomId",
            select: "roomNumber price",
          },
        ],
        includeTotalData: true,
      };

      // Use pagination utility
      const result = await paginate(PaymentBill, paginationOptions, req);

      if (!result.success) {
        return res.status(500).json(result);
      }

      // Format the payment bills data
      const formattedBills = result.data.map((bill) => {
        let totalFee = 0;
        if (Array.isArray(bill.additionalFee)) {
          bill.additionalFee.forEach((fee) => {
            totalFee += fee.feeAmount || 0;
          });
        }

        return {
          _id: bill._id,
          roomNumber: bill.roomId?.roomNumber || "N/A",
          rentMonth: `${bill.month}/${bill.year}`,
          status: bill.status,
          additionalFee: totalFee,
          electricalBill: bill.electricalBill?.totalAmount || 0,
          waterBill: bill.waterBill?.totalAmount || 0,
          paymentAmount: bill.paymentAmount || 0,
          createdAt: bill.createdAt,
          month: bill.month,
          year: bill.year,
        };
      });

      return res.status(200).json({
        success: true,
        data: formattedBills,
        pagination: result.pagination,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        limit: result.limit,
        totalItems: result.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error in getPaymentBillByBoardingHouseId:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }

  async calculateMonthlyRoomRent(req, res) {
    try {
      const {
        roomId,
        paymentAmount,
        electricalBill,
        waterBill,
        additionalFees = [],
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
      res
        .status(500)
        .json({ message: "Error calculate", error: error.message });
    }
  }

  async updatePaymentBill(req, res) {
    try {
      const { paymentBillId } = req.params;

      if (!paymentBillId) {
        return res.status(400).json({ message: "Payment bill ID is required" });
      }

      // Extract update data
      const { electricalBill, waterBill, paymentAmount } = req.body;

      // Fetch the payment bill
      const paymentBill = await PaymentBill.findById(paymentBillId);
      if (!paymentBill) {
        return res.status(404).json({ message: "Payment bill not found" });
      }

      // Update electrical bill data
      if (electricalBill) {
        paymentBill.electricalBill = {
          ...(paymentBill.electricalBill || {}),
          ...electricalBill,
          oldNumber: electricalBill.oldNumber,
          newNumber: electricalBill.newNumber,
          quantityConsumed: electricalBill.quantityConsumed,
          totalAmount: electricalBill.totalAmount,
          price: electricalBill.price,
        };
      }

      // Update water bill data
      if (waterBill) {
        paymentBill.waterBill = {
          ...(paymentBill.waterBill || {}),
          ...waterBill,
          oldNumber: waterBill.oldNumber,
          newNumber: waterBill.newNumber,
          quantityConsumed: waterBill.quantityConsumed,
          totalAmount: waterBill.totalAmount,
          price: waterBill.price,
        };
      }

      // Update payment amount
      if (paymentAmount !== undefined) {
        paymentBill.paymentAmount = paymentAmount;
      }

      await paymentBill.save();

      res.status(200).json({
        message: "Payment bill updated successfully",
        paymentBill,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getPaymentBillById(req, res) {
    try {
      const { paymentBillId } = req.params;

      if (!paymentBillId) {
        return res.status(400).json({ message: "Payment bill ID is required" });
      }

      // Fetch the payment bill with populated roomId
      const paymentBill =
        await PaymentBill.findById(paymentBillId).populate("roomId");

      if (!paymentBill) {
        return res.status(404).json({ message: "Payment bill not found" });
      }

      // Process additional fees
      let additionalFeeTotal = 0;
      const additionalFees = paymentBill.additionalFee || [];
      if (Array.isArray(additionalFees)) {
        additionalFeeTotal = additionalFees.reduce(
          (sum, fee) => sum + (fee.feeAmount || 0),
          0
        );
      } else if (typeof additionalFees === "number") {
        additionalFeeTotal = additionalFees;
      }

      // Ensure electrical bill data is properly formatted
      let electricalBillFormatted = {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
        price: 0,
      };

      if (paymentBill.electricalBill) {
        if (typeof paymentBill.electricalBill === "object") {
          electricalBillFormatted = {
            ...electricalBillFormatted,
            ...paymentBill.electricalBill,
            oldNumber: paymentBill.electricalBill.oldNumber || 0,
            newNumber: paymentBill.electricalBill.newNumber || 0,
            price: paymentBill.electricalBill.price || 0,
            quantityConsumed: paymentBill.electricalBill.quantityConsumed || 0,
            totalAmount: paymentBill.electricalBill.totalAmount || 0,
          };
        } else if (typeof paymentBill.electricalBill === "number") {
          electricalBillFormatted.totalAmount = paymentBill.electricalBill;
        }
      }

      // Ensure water bill data is properly formatted
      let waterBillFormatted = {
        oldNumber: 0,
        newNumber: 0,
        quantityConsumed: 0,
        totalAmount: 0,
        price: 0,
      };

      if (paymentBill.waterBill) {
        if (typeof paymentBill.waterBill === "object") {
          waterBillFormatted = {
            ...waterBillFormatted,
            ...paymentBill.waterBill,
            oldNumber: paymentBill.waterBill.oldNumber || 0,
            newNumber: paymentBill.waterBill.newNumber || 0,
            price: paymentBill.waterBill.price || 0,
            quantityConsumed: paymentBill.waterBill.quantityConsumed || 0,
            totalAmount: paymentBill.waterBill.totalAmount || 0,
          };
        } else if (typeof paymentBill.waterBill === "number") {
          waterBillFormatted.totalAmount = paymentBill.waterBill;
        }
      }

      // Calculate room price by subtracting all costs from total payment
      const totalPayment = paymentBill.paymentAmount || 0;
      const electricalCost = electricalBillFormatted.totalAmount || 0;
      const waterCost = waterBillFormatted.totalAmount || 0;

      // Calculate room price by subtracting utility costs and additional fees
      const calculatedRoomPrice = Math.max(
        totalPayment - electricalCost - waterCost - additionalFeeTotal,
        0
      );

      // Prepare the response data with calculated room price instead of roomId.price
      const formattedBill = {
        _id: paymentBill._id,
        roomId: paymentBill.roomId._id,
        roomNumber: paymentBill.roomId.roomNumber,
        roomPrice: calculatedRoomPrice, // Use calculated room price instead of roomId.price
        boardingHouseId: paymentBill.roomId.boardingHouseId,
        rentMonth: `${paymentBill.month}/${paymentBill.year}`,
        month: paymentBill.month,
        year: paymentBill.year,
        status: paymentBill.status,
        additionalFee: paymentBill.additionalFee || [],
        additionalFeeTotal: additionalFeeTotal,
        electricalBill: electricalBillFormatted,
        waterBill: waterBillFormatted,
        paymentAmount: totalPayment,
        createdAt: paymentBill.createdAt,
      };

      return res.status(200).json(formattedBill);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getPaymentBillForRent(req, res) {
    try {
      const { paymentBillId } = req.params;
      const paymentBill = await PaymentBill.findOne({
        _id: paymentBillId,
      }).lean();
      if (!paymentBill) {
        return res.status(404).json({ message: "Payment bill not found" });
      }

      const depositRoom = await DepositRoom.findOne({
        roomId: paymentBill.roomId,
      })
        .populate({
          path: "roomId",
          populate: {
            path: "boardingHouseId",
            select: "name address",
          },
        })
        .lean();
      if (!depositRoom) {
        return res.status(404).json({ message: "Deposit room not found" });
      }
      return res.status(200).json({
        paymentBill,
        depositRoom: {
          ...depositRoom,
          name: depositRoom.roomId?.boardingHouseId?.name || "Unknown Property",
          roomNumber: depositRoom.roomId?.roomNumber || "Unknown Room",
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default new PaymentBillController();
