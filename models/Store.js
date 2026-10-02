import mongoose from "mongoose";
import Business from "./Business.js";

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: Business.name,
        trim: true,
    },
    streetAddress: {
        type: String,
        required: true,
        default: Business.streetAddress,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        default: Business.city,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        default: Business.state,
        trim: true,
    },
    zip: {
        type: String,
        required: true,
        default: Business.zip,
        trim: true,
    },
}, { timestamps: true });

// Trim the store's name, street address, city, state, and zip before saving it to the database
storeSchema.pre("save", async function () {
    if (this.isModified("name") || this.isModified("streetAddress") || this.isModified("city") || this.isModified("state") || this.isModified("zip")) {
        this.name = this.name.trim();
        this.streetAddress = this.streetAddress.trim();
        this.city = this.city.trim();
        this.state = this.state.trim();
        this.zip = this.zip.trim();
    }
});

const Store = mongoose.model("Store", storeSchema);

export default Store;
