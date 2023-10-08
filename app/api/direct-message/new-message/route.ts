import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { pusherServer } from "@/lib/pusher";

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
  const conversationId = req.nextUrl.searchParams.get(
    "conversationId"
  ) as string;

  try {
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              userId: currentUser?.user?.id,
            },
          },
          {
            memberTwo: {
              userId: currentUser?.user?.id,
            },
          },
        ],
      },
      include: {
        memberOne: {
          include: {
            user: true,
          },
        },
        memberTwo: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: "Conversation not found." },
        { status: 404 }
      );
    }

    const member =
      conversation?.memberOne?.userId === currentUser?.user?.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found." },
        { status: 404 }
      );
    }

    //creating the message
    if (body?.fileUrl) {
      //upload to cloudinary
      const uploadedFile = await cloudinary.uploader.upload(body?.fileUrl, {
        folder: "collaboration/direct-message/files",
      });

      const message = await db.directMessage.create({
        data: {
          content: uploadedFile?.secure_url,
          fileUrl: uploadedFile?.secure_url,
          fileName: body?.fileName,
          fileType: body?.fileType,
          conversationId: conversationId as string,
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
        await db.directMessageFile.create({
          data: {
            public_id: uploadedFile?.public_id,
            url: uploadedFile?.secure_url,
            directMessageId: message?.id,
          },
        });

        //pusher trigger
        // await pusherServer.trigger(conversationId, "incoming-message", message);
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
      const message = await db.directMessage.create({
        data: {
          content: body?.content,
          conversationId: conversationId as string,
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
        //pusher trigger
        // await pusherServer.trigger(conversationId, "incoming-message", message);
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
