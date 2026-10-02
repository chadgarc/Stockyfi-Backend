import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    upc: {
        type: String,
        required: true,
        trim: true,
    },
    department: {
        type: String,
        required: false,
        trim: true,
    },
    inStock: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: "inStock must be a value greater than or equal to 0",
        },
    },
    inShelf: {
        type: Number,
        required: true,
        default: 0,
        validate: {
            validator: function (value) {
                return value >= 0 && value <= this.inStock;
            },
            message: "inShelf must be a value greater than or equal to 0 and less than or equal to inStock",
        },
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
    },
}, { timestamps: true });

// Create a compound index to ensure that each item has a unique upc within each store
// With this, we can have the same item with the same upc in different stores
// If not using this index, we would need to check if the item exists in the store before creating it
// This also ensures that each item has a unique upc within each store
itemSchema.index({ upc: 1, storeId: 1 }, { unique: true });

const Item = mongoose.model("Item", itemSchema);

export default Item;