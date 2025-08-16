import mongoose from "mongoose";

type ConnectionType = {
  isConnected?: number;
};

const connection: ConnectionType = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    console.log("Database is already connected");
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    connection.isConnected = db.connections[0].readyState;

    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Failed DB Connection", error);
    process.exit(1);
  }
}

export default dbConnect;