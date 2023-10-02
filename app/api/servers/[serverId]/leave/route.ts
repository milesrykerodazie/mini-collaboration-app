import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!params.serverId) {
      return NextResponse.json(
        { success: false, message: "ServerId not found" },
        { status: 400 }
      );
    }

    const server = await db.server.delete({
      where: {
        id: params.serverId,
        userId: currentUser?.user?.id,
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID_DELETE]", error);
    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!params.serverId) {
      return NextResponse.json(
        { success: false, message: "ServerId not found" },
        { status: 400 }
      );
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        userId: {
          not: currentUser?.user?.id,
        },
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            userId: currentUser?.user?.id,
          },
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[SERVER_ID_LEAVE]", error);
    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}
