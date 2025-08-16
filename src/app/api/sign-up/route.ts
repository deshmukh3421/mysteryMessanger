import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    const existingUserVerifiedByusername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByusername) {
      return Response.json(
        {
          success: false,
          message: "username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await UserModel.findOne({
      email,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      //condition
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "Email is already used",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = otp;
        existingUserByEmail.verifyCodeExpiry = expiryDate;

        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username: username,
        email: email,
        password: hashedPassword,
        verifyCode: otp,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });

      await newUser.save();
    }

    const emailResponse = await sendVerificationEmail(email, username, otp);

    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User Registered Successfully. Please Verify Your Email",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error Registering User", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}