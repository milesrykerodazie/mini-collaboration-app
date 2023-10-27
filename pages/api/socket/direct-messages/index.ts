import { NextApiRequest } from "next";

import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/typings";
import { getCurrentUser } from "@/lib/auth";
import { CurrentProfile } from "@/lib/get-user";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const profile = await CurrentProfile(req);
    const { content, fileName, fileUrl, fileType } = req.body;
    const { conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID missing" });
    }

    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId as string,
        OR: [
          {
            memberOne: {
              userId: profile?.id,
            },
          },
          {
            memberTwo: {
              userId: profile?.id,
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
      return res.status(404).json({ message: "Conversation not found" });
    }

    const member =
      conversation.memberOne.userId === profile?.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (fileUrl) {
      //upload to cloudinary
      const uploadedFile = await cloudinary.uploader.upload(fileUrl, {
        folder: "collaboration/direct-message/files",
      });

      const message = await db.directMessage.create({
        data: {
          content: uploadedFile?.secure_url,
          fileUrl: uploadedFile?.secure_url,
          fileName: fileName,
          fileType: fileType,
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

      //save server file to db
      await db.directMessageFile.create({
        data: {
          public_id: uploadedFile?.public_id,
          url: uploadedFile?.secure_url,
          directMessageId: message?.id,
        },
      });

      const channelKey = `chat:${conversationId}:messages`;

      res?.socket?.server?.io?.emit(channelKey, message);

      return res.status(201).json(message);
    } else {
      const message = await db.directMessage.create({
        data: {
          content,
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

      const channelKey = `chat:${conversationId}:messages`;

      res?.socket?.server?.io?.emit(channelKey, message);

      return res.status(201).json(message);
    }
  } catch (error) {
    console.log("[DIRECT_MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}
