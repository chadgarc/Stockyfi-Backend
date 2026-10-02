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
}, { timestamps: true });

const Business = mongoose.model("Business", businessSchema);

export default Business;
