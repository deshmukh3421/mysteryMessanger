import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      { new: true }
    );
    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "Error Updating user accept messages",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User's accept messages condition updated",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error Updating user accept messages to accept message", error);
    return Response.json(
      {
        success: false,
        message: "Error Updating user accept messages to accept message",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Not Authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const userId = user._id;

    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "Error getting user accept messages",
        },
        {
          status: 401,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User's accept messages condition",
        isAcceptingMessages: foundUser.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("Error getting user accept messages.", error);
    return Response.json(
      {
        success: false,
        message: "Error getting user accept messages.",
      },
      {
        status: 500,
      }
    );
  }
}