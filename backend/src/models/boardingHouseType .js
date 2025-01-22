import mongoose from "mongoose";

const boardingHouseTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Account',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        roomSize: {
            type: String,
            required: true
        },
        peopleNumber: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true,
    }
);


const BoardingHouseType = mongoose.model('BoardingHouseType', boardingHouseTypeSchema);

module.exports = BoardingHouseType;
