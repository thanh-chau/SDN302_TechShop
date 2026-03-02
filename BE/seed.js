const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI = "mongodb://localhost:27017/techshop";

const users = [
  {
    name: "Admin User",
    email: "admin@techshop.com",
    password: "Admin@123",
    phone: "0901234567",
    address: "123 Admin Street, Hanoi",
    role: "admin",
  },
  {
    name: "Staff Nguyen",
    email: "staff@techshop.com",
    password: "Staff@123",
    phone: "0912345678",
    address: "456 Le Loi, Ho Chi Minh City",
    role: "staff",
  },
  {
    name: "Buyer Tran",
    email: "buyer@techshop.com",
    password: "Buyer@123",
    phone: "0923456789",
    address: "789 Tran Hung Dao, Da Nang",
    role: "buyer",
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    console.log("Cleared existing users");

    for (const u of users) {
      const user = new User(u);
      await user.save();
      console.log(`Created ${user.role}: ${user.email}`);
    }

    console.log("\n=== Seed completed! ===");
    console.log("admin@techshop.com  / Admin@123");
    console.log("staff@techshop.com  / Staff@123");
    console.log("buyer@techshop.com  / Buyer@123");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
