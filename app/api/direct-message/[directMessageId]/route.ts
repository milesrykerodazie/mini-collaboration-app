import { MemberRole } from "@prisma/client";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
interface MessageParams {
  directMessageId: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: MessageParams }
) {
  try {
    const currentUser = await getCurrentUser();

    const { searchParams } = new URL(req.url);

    const conversationId = searchParams.get("conversationId");

    const body = await req.json();
    const { directMessageId } = params;

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "Conversation not found" },
        { status: 400 }
      );
    }

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
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }

    const member =
      conversation.memberOne.userId === currentUser?.user?.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    const isMessageOwner = directMessage.memberId === member.id;
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

    // update message here
    const messageUpdate = await db.directMessage.update({
      where: {
        id: directMessageId as string,
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
  try {
    const currentUser = await getCurrentUser();

    const { searchParams } = new URL(req.url);

    const conversationId = searchParams.get("conversationId");

    const { directMessageId } = params;

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }

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
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }

    const member =
      conversation.memberOne.userId === currentUser?.user?.id
        ? conversation.memberOne
        : conversation.memberTwo;

    if (!member) {
      return NextResponse.json(
        { success: false, message: "Member not found" },
        { status: 404 }
      );
    }

    let directMessage = await db.directMessage.findFirst({
      where: {
        id: directMessageId as string,
        conversationId: conversationId as string,
      },
      include: {
        member: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!directMessage || directMessage.deleted) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    const isMessageOwner = directMessage.memberId === member.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canModify = isMessageOwner || isAdmin || isModerator;

    //   if (!canModify) {
    //     return NextResponse.json(
    //       { success: false, message: "Unauthorized" },
    //       { status: 401 }
    //     );
    //   }

    if (!isMessageOwner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // delete message
    const messageDeleted = await db.directMessage.update({
      where: {
        id: directMessageId as string,
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
