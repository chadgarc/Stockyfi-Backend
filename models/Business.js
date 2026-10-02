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

businessSchema.pre("save", async function () {
    if (this.isModified("name") || this.isModified("streetAddress") || this.isModified("city") || this.isModified("state") || this.isModified("zip")) {
        this.name = this.name.trim();
        this.streetAddress = this.streetAddress.trim();
        this.city = this.city.trim();
        this.state = this.state.trim();
        this.zip = this.zip.trim();
    }
});

const Business = mongoose.model("Business", businessSchema);

export default Business;
