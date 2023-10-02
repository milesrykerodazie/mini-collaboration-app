import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const channelId = req.nextUrl.searchParams.get("channelId") as string;
  const serverId = req.nextUrl.searchParams.get("serverId") as string;

  try {
    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return NextResponse.json(
        { success: false, message: "You are not a member of this server." },
        { status: 404 }
      );
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return NextResponse.json(
        { success: false, message: "Channel not found." },
        { status: 404 }
      );
    }

    const member = server.members.find(
      (member) => member.userId === currentUser?.user?.id
    );
    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found." },
        { status: 404 }
      );
    }

    if (body?.fileUrl) {
      //upload to cloudinary
      const uploadedFile = await cloudinary.uploader.upload(body?.fileUrl, {
        folder: "collaboration/message/files",
      });

      const message = await db.message.create({
        data: {
          content: uploadedFile?.secure_url,
          fileUrl: uploadedFile?.secure_url,
          fileName: body?.fileName,
          fileType: body?.fileType,
          channelId: channelId as string,
          memberId: member.id,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });
      if (message) {
        //save server file to db
        await db.messageFile.create({
          data: {
            public_id: uploadedFile?.public_id,
            url: uploadedFile?.secure_url,
            messageId: message?.id,
          },
        });
        return NextResponse.json(
          {
            success: true,
            message: "Message sent.",
          },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: "Message not sent." },
          { status: 500 }
        );
      }
    } else {
      const message = await db.message.create({
        data: {
          content: body?.content,
          channelId: channelId as string,
          memberId: member.id,
        },
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      });

      if (message) {
        return NextResponse.json(
          {
            success: true,
            message: "Message sent.",
          },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: "Message not sent." },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal Error" },
      { status: 500 }
    );
  }
}
