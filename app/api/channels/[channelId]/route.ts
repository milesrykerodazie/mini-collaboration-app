import { NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (!serverId) {
      return NextResponse.json(
        {
          success: false,
          message: "Server Id not found.",
        },
        { status: 400 }
      );
    }

    if (!params.channelId) {
      return NextResponse.json(
        {
          success: false,
          message: "Channel Id not found.",
        },
        { status: 400 }
      );
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
          deleteMany: {
            id: params.channelId,
            name: {
              not: "general",
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNEL_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    if (!serverId) {
      return NextResponse.json(
        {
          success: false,
          message: "Server Id not found.",
        },
        { status: 400 }
      );
    }

    if (!params.channelId) {
      return NextResponse.json(
        {
          success: false,
          message: "Channel Id not found.",
        },
        { status: 400 }
      );
    }

    if (name === "general") {
      return NextResponse.json(
        {
          success: false,
          message: "Name cannot be 'general'",
        },
        { status: 400 }
      );
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
          update: {
            where: {
              id: params.channelId,
              NOT: {
                name: "general",
              },
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[CHANNEL_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
