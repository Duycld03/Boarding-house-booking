// models/UtilitiesExpense.js
const mongoose = require('mongoose');

const OtherExpenseSchema = new mongoose.Schema({
    feeName: {
        type: String,
        required: true,
        trim: true
    },
    feeAmount: {
        type: Number,
        required: true,
        min: 0
    }
});

const MeterReadingSchema = new mongoose.Schema({
    oldNumber: {
        type: Number,
        required: true,
        min: 0
    },
    newNumber: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function (value) {
                return value >= this.oldNumber;
            },
            message: 'New meter reading must be greater than or equal to old reading'
        }
    },
    quantityConsumed: {
        type: Number,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    }
});

const UtilitiesExpenseSchema = new mongoose.Schema({
    boardingHouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BoardingHouse',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true,
        min: 2000
    },
    electricalExpense: {
        type: MeterReadingSchema,
        required: true
    },
    waterExpense: {
        type: MeterReadingSchema,
        required: true
    },
    otherExpenses: [OtherExpenseSchema],
    // Add additional fields for metadata
    createdAt: {
        type: Date,
        default: Date.now
    },

}, {
    timestamps: true,
});

UtilitiesExpenseSchema.index({ boardingHouseId: 1, month: 1, year: 1 }, { unique: true });

UtilitiesExpenseSchema.virtual('totalExpense').get(function () {
    let total = this.electricalExpense.totalAmount + this.waterExpense.totalAmount;

    if (this.otherExpenses && this.otherExpenses.length > 0) {
        total += this.otherExpenses.reduce((sum, expense) => sum + expense.feeAmount, 0);
    }
    return total;
});

UtilitiesExpenseSchema.pre('save', function (next) {
    if (this.electricalExpense) {
        this.electricalExpense.quantityConsumed =
            this.electricalExpense.newNumber - this.electricalExpense.oldNumber;
    }
    if (this.waterExpense) {
        this.waterExpense.quantityConsumed =
            this.waterExpense.newNumber - this.waterExpense.oldNumber;
    }
    next();
});

module.exports = mongoose.model('Expense', UtilitiesExpenseSchema);