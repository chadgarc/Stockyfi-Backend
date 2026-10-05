import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    streetAddress: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    zip: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: false,
        trim: true,
        validate: {
            validator: function(phoneNumber) {
                return /^\d{10}$/.test(phoneNumber);
            },
            message: 'Phone number must be 10 digits'
        }
    },
}, { timestamps: true });

const Business = mongoose.model("Business", businessSchema);

export default Business;
