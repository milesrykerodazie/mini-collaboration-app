import { MemberRole } from "@prisma/client";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
interface MessageParams {
  messageId: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: MessageParams }
) {
  try {
    const user = await getCurrentUser();

    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");
    const channelId = searchParams.get("channelId");

    const body = await req.json();
    const { messageId } = params;

    if (!user) {
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
    if (!channelId) {
      return NextResponse.json(
        { success: false, message: "Channel not found" },
        { status: 400 }
      );
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            userId: user?.user?.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return NextResponse.json(
        { success: false, message: "Server not found" },
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
        { success: false, message: "Channel not found" },
        { status: 404 }
      );
    }

    const member = server.members.find(
      (member) => member.userId === user?.user?.id
    );

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!isMessageOwner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const messageUpdate = await db.message.update({
      where: {
        id: messageId as string,
      },
      data: {
        content: body?.content,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (messageUpdate) {
      return NextResponse.json(
        { success: true, message: "Message Updated" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Messagenot updated." },
        { status: 400 }
      );
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: MessageParams }
) {
  const user = await getCurrentUser();

  const { searchParams } = new URL(req.url);

  const serverId = searchParams.get("serverId");
  const channelId = searchParams.get("channelId");

  const { messageId } = params;
  try {
    if (!user) {
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
    if (!channelId) {
      return NextResponse.json(
        { success: false, message: "Channel not found" },
        { status: 400 }
      );
    }

    const server = await db.server.findFirst({
      where: {
        id: serverId as string,
        members: {
          some: {
            userId: user?.user?.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      return NextResponse.json(
        { success: false, message: "Server not found" },
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
        { success: false, message: "Channel not found" },
        { status: 404 }
      );
    }

    const member = server.members.find(
      (member) => member.userId === user?.user?.id
    );

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    let message = await db.message.findFirst({
      where: {
        id: messageId as string,
        channelId: channelId as string,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    const isMessageOwner = message.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    if (!canModify) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const messageDeleted = await db.message.update({
      where: {
        id: messageId as string,
      },
      data: {
        fileUrl: null,
        fileName: null,
        fileType: null,
        content: "This message has been deleted.",
        deleted: true,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (messageDeleted) {
      return NextResponse.json(
        { success: true, message: "Message deleted." },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Message not deleted." },
        { status: 400 }
      );
    }
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
