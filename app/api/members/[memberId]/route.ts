import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
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
        { success: false, message: "ServerId not found" },
        { status: 400 }
      );
    }
    if (!params.memberId) {
      return NextResponse.json(
        { success: false, message: "Member ID missing" },
        { status: 400 }
      );
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        userId: currentUser?.user?.id,
      },
      data: {
        members: {
          deleteMany: {
            id: params.memberId,
            userId: {
              not: currentUser?.user?.id,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[MEMBER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!serverId) {
      return NextResponse.json(
        { success: false, message: "ServerId not found" },
        { status: 400 }
      );
    }
    if (!params.memberId) {
      return NextResponse.json(
        { success: false, message: "Member ID missing" },
        { status: 400 }
      );
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        userId: currentUser?.user?.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: params.memberId,
              userId: {
                not: currentUser?.user?.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc",
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[MEMBERS_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
