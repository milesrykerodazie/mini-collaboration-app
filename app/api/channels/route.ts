import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!serverId) {
      return NextResponse.json(
        { success: false, message: "Server not found" },
        { status: 400 }
      );
    }

    if (name === "general") {
      return NextResponse.json(
        { success: false, message: "Name cannot be 'general'" },
        { status: 400 }
      );
    }

    //check if a channel name exists
    if (name) {
      const nameExists = await db.channel.findUnique({
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

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId: currentUser?.user?.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          create: {
            userId: currentUser?.user?.id,
            name,
            type,
          },
        },
      },
    });

    if (server) {
      return NextResponse.json(
        {
          success: true,
          message: "Channel created.",
          server,
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Channel not created.",
          server,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log("CHANNELS_POST", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
