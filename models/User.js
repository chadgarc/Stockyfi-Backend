import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Store from "./Store.js";

const validRoles = ['owner', 'manager', 'associate']

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: function () {
            // Only require storeId if the user is not the owner
            return this.role !== validRoles[0];
        },
    },
    role: {
        type: String,
        required: true,
        enum: validRoles,
        default: validRoles[2],
    },
}, { timestamps: true } );

// Hash the user's password before saving it to the database, check if the store exists, and trim the user's name and email before saving it to the database
userSchema.pre("save", async function () {
    // If the user's password has been modified, hash it
    if (this.isModified("password")) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
    }

    // If the user's role is owner, set storeId to null
    if(this.role === validRoles[0]) this.storeId = null;

    // If the user's storeId has been modified, check if it exists and if not, create it
    if (this.isModified("storeId") && this.role !== validRoles[0]) {
        const store = await Store.findById(this.storeId);
        if (!store) throw new Error("Store not found");
        this.storeId = store._id;
    }
});

// Compare the user's password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export { User, validRoles };
