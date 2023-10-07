"use client";

import { Member, MemberRole, user, Server } from "@prisma/client";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";

interface ServerMemberProps {
  member: Member & { user: user };
  server: Server;
}

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.MODERATOR]: (
    <ShieldCheck className="h-4 w-4 ml-2 text-gray-500" />
  ),
  [MemberRole.ADMIN]: <ShieldAlert className="h-4 w-4 ml-2 text-red-500" />,
};

export const ServerMember = ({ member, server }: ServerMemberProps) => {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap[member.role];

  const onClick = () => {
    router.push(`/ca/server/${params?.serverId}/conversations/${member.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-2 rounded-md flex items-center gap-x-2 w-full transition mb-1",
        params?.memberId === member.id && "bg-gray-700/10 dark:bg-gray-800"
      )}
    >
      <UserAvatar src={member?.user?.image} className="md:h-8 md:w-8" />
      <p
        className={cn(
          "font-semibold text-sm  group-hover:text-gray-600  dark:group-hover:text-gray-300 transition",
          params?.memberId === member?.id &&
            "text-primary dark:text-gray-200 dark:group-hover:text-white"
        )}
      >
        {member?.user?.name}
      </p>
      {icon}
    </button>
  );
};
