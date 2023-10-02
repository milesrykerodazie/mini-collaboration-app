import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface ServerParams {
  inviteCode: string;
}

interface UniqueServerParams {
  serverId: string;
}

export async function getServers() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }
  try {
    const servers = await db.server.findMany({
      where: {
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return servers;
  } catch {
    return null;
  }
}

export async function getOneServer() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  try {
    const server = await db.server.findFirst({
      where: {
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
    });
    return server;
  } catch (error) {
    return null;
  }
}

export async function getSomeServers() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  try {
    const servers = await db.server.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return servers;
  } catch {
    return null;
  }
}

export async function existingServer(params: ServerParams) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { inviteCode } = params;

  try {
    const existingServer = await db.server.findFirst({
      where: {
        inviteCode: inviteCode,
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
    });

    return existingServer;
  } catch (error) {
    return null;
  }
}

export async function addMemberToServer(params: ServerParams) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { inviteCode } = params;

  try {
    const server = await db.server.update({
      where: {
        inviteCode: inviteCode,
      },
      data: {
        members: {
          create: [
            {
              userId: currentUser?.user?.id,
            },
          ],
        },
      },
    });

    return server;
  } catch (error) {
    return null;
  }
}

export async function getServerById(params: UniqueServerParams) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { serverId } = params;

  try {
    const server = await db.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
    });
    return server;
  } catch (error) {
    return null;
  }
}

export async function getUniqueServer(serverId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  try {
    const server = await db.server.findUnique({
      where: {
        id: serverId,
      },
      include: {
        channels: {
          orderBy: {
            createdAt: "asc",
          },
        },
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
    return server;
  } catch (error) {
    return null;
  }
}

interface CheckMemberParams {
  serverId: string;
  channelId: string;
}

interface CheckChannelParams {
  channelId: string;
  serverId: string;
}

export async function checkMember(params: CheckMemberParams) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { serverId } = params;

  try {
    const member = await db.member.findFirst({
      where: {
        serverId: serverId,
        userId: currentUser?.user?.id,
      },
    });

    return member;
  } catch (error) {
    return null;
  }
}

export async function checkChannel(params: CheckChannelParams) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { channelId } = params;

  try {
    const channel = await db.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    return channel;
  } catch (error) {
    return null;
  }
}

interface SpecificServerParams {
  serverId: string;
}
export async function getSpecificServer(params: SpecificServerParams) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { serverId } = params;

  try {
    const server = await db.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            userId: currentUser?.user?.id,
          },
        },
      },
      include: {
        channels: {
          where: {
            name: "general",
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    return server;
  } catch (error) {
    return null;
  }
}

interface MemberIdPageProps {
  memberId: string;
  serverId: string;
}
export async function getCurrentMember(params: MemberIdPageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const { serverId, memberId } = params;

  try {
    const currentMember = await db.member.findFirst({
      where: {
        serverId: params.serverId,
        userId: currentUser?.user?.id,
      },
      include: {
        user: true,
      },
    });

    return currentMember;
  } catch (error) {
    return null;
  }
}

export async function getOrCreateConversation(
  memberOneId: string,
  memberTwoId: string
) {
  let conversation =
    (await findConversation(memberOneId, memberTwoId)) ||
    (await findConversation(memberTwoId, memberOneId));

  if (!conversation) {
    conversation = await createNewConversation(memberOneId, memberTwoId);
  }

  return conversation;
}

const findConversation = async (memberOneId: string, memberTwoId: string) => {
  try {
    return await db.conversation.findFirst({
      where: {
        AND: [{ memberOneId: memberOneId }, { memberTwoId: memberTwoId }],
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
  } catch {
    return null;
  }
};

const createNewConversation = async (
  memberOneId: string,
  memberTwoId: string
) => {
  try {
    return await db.conversation.create({
      data: {
        memberOneId,
        memberTwoId,
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
  } catch {
    return null;
  }
};
