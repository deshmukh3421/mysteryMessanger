import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, content, sender } = await request.json();

    const user = await UserModel.findOne({ username });
    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        { success: false, message: "User does not accept messages" },
        { status: 403 }
      );
    }

    user.messages.push({
      content,
      createdAt: new Date(),
      sender: sender || null,
    });

    await user.save();

    return Response.json(
      { success: true, message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending messages", error);
    return Response.json(
      { success: false, message: "Error sending messages" },
      { status: 500 }
    );
  }
}
