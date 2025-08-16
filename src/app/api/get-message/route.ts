import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Build query using email (preferred) or _id
    const query = session.user.email
      ? { email: session.user.email }
      : { _id: session.user._id };

    // Fetch user with only required fields
    const user = await UserModel.findOne(query, {
      messages: 1,
      username: 1,
      email: 1,
      isAcceptingMessage: 1,
      isVerified: 1,
    }).lean();

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Sort messages by createdAt (latest first)
    const sortedMessages = [...(user.messages || [])].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return Response.json(
      {
        success: true,
        messages: sortedMessages,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          isAcceptingMessage: user.isAcceptingMessage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
