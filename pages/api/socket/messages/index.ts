import { NextApiRequest } from "next";

import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "@/typings";
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
    const { serverId, channelId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID missing" });
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            userId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }

    const channel = await db.channel.findFirst({
      where: {
        id: channelId as string,
        serverId: serverId as string,
      },
    });

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const member = server.members.find(
      (member) => member.userId === profile.id
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (fileUrl) {
      //upload to cloudinary
      const uploadedFile = await cloudinary.uploader.upload(fileUrl, {
        folder: "collaboration/message/files",
      });
      const message = await db.message.create({
        data: {
          content: uploadedFile?.secure_url,
          fileUrl: uploadedFile?.secure_url,
          fileName: fileName,
          fileType: fileType,
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

      //save server file to db
      await db.messageFile.create({
        data: {
          public_id: uploadedFile?.public_id,
          url: uploadedFile?.secure_url,
          messageId: message?.id,
        },
      });

      const channelKey = `chat:${channelId}:messages`;

      res?.socket?.server?.io?.emit(channelKey, message);

      return res.status(201).json(message);
    } else {
      const message = await db.message.create({
        data: {
          content: content,
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

      const channelKey = `chat:${channelId}:messages`;

      res?.socket?.server?.io?.emit(channelKey, message);

      return res.status(201).json(message);
    }
  } catch (error) {
    console.log("[MESSAGES_POST]", error);
    return res.status(500).json({ message: "Internal Error" });
  }
}

// const message = await db.message.create({
//   data: {
//     content,
//     fileUrl,
//     channelId: channelId as string,
//     memberId: member.id,
//   },
//   include: {
//     member: {
//       include: {
//         user: true,
//       },
//     },
//   },
// });

// const channelKey = `chat:${channelId}:messages`;

// res?.socket?.server?.io?.emit(channelKey, message);

// return res.status(200).json(message);
