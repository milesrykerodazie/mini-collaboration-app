import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    const { name, imageUrl } = await req.json();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (name) {
      //check if name already exists
      const nameExists = await db.server.findUnique({
        where: {
          name: name,
        },
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, message: "Name already in use." },
          { status: 409 }
        );
      }
    }

    const server = await db.server.create({
      data: {
        userId: currentUser?.user?.id,
        name,
        inviteCode: nanoid(12),
        channels: {
          create: [{ name: "general", userId: currentUser?.user?.id }],
        },
        members: {
          create: [{ userId: currentUser?.user?.id, role: MemberRole.ADMIN }],
        },
      },
    });

    if (server && imageUrl) {
      //upload image
      const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
        folder: "collaboration/server/images",
      });

      //save server image to db
      await db.serverImage.create({
        data: {
          public_id: uploadedImage?.public_id,
          url: uploadedImage?.secure_url,
          serverId: server?.id,
        },
      });

      //update the server to include image url
      const completeServer = await db.server.update({
        where: {
          id: server?.id,
        },
        data: {
          imageUrl: uploadedImage?.secure_url,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: "Server created.",
          data: completeServer,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Server not created." },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Error" },
      { status: 500 }
    );
  }
}
