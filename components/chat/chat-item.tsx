"use client";
import axios from "axios";
import qs from "query-string";
import { Member, MemberRole, user } from "@prisma/client";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserAvatar } from "@/components/user-avatar";
import { ActionTooltip } from "@/components/action-tooltip";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/modal-hook";
import EmojiPicker from "../emoji-picker";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    user: user;
  };
  timestamp: string;
  fileUrl: string | null;
  fileType: string | null;
  fileName: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  messageUrl: string;
  messageQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-gray-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-red-500" />,
};

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  fileType,
  fileName,
  deleted,
  currentMember,
  isUpdated,
  messageUrl,
  messageQuery,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newContent, setNewContent] = useState(content);
  const { onOpen } = useModal();
  const params = useParams();
  const router = useRouter();

  const onMemberClick = () => {
    if (member.id === currentMember.id) {
      return;
    }

    router.push(`/servers/${params?.serverId}/conversations/${member.id}`);
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keyDown", handleKeyDown);
  }, []);

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `${messageUrl}/${id}`,
        query: messageQuery,
      });

      const response = await axios.patch(url, {
        content: newContent,
      });

      if (response?.status === 200) {
        setIsLoading(false);
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  // const fileType = fileUrl?.split(".").pop();

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;
  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;
  const isPDF = fileType === "pdf" && fileUrl;
  const isImage = !isPDF && fileUrl;

  return (
    <div className="relative group flex items-center hover:bg-black/5 dark:hover:bg-white/10  p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          onClick={onMemberClick}
          className="cursor-pointer hover:drop-shadow-md transition"
        >
          <UserAvatar src={member?.user?.image} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={onMemberClick}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {member?.user?.name}
              </p>
              <ActionTooltip label={member?.role}>
                {roleIconMap[member?.role]}
              </ActionTooltip>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timestamp}
            </span>
          </div>
          {isImage && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square rounded-md mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={fileUrl}
                alt="message-file"
                fill
                className="object-cover"
              />
            </a>
          )}
          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-gray-200 stroke-gray-400" />
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-gray-500 dark:text-gray-400 hover:underline"
              >
                {fileName}-(PDF File)
              </a>
            </div>
          )}
          {!fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-gray-600 dark:text-gray-300",
                deleted &&
                  "italic text-gray-500 dark:text-gray-400 text-xs mt-1"
              )}
            >
              {content}
              {isUpdated && !deleted && (
                <span className="text-[10px] mx-2 text-gray-500 dark:text-gray-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!fileUrl && isEditing && (
            <form onSubmit={handleEdit}>
              <div className=" flex items-center w-full gap-x-2 pt-2">
                <div className="relative w-full">
                  <Input
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="pl-3 pr-10 py-5 bg-gray-200/90 dark:bg-gray-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 dark:text-gray-200"
                    placeholder="...update message"
                  />
                  <div className="absolute top-2 right-2">
                    <EmojiPicker
                      onChange={(emoji: string) => {
                        setNewContent(
                          (prevContent) => `${prevContent} ${emoji}`
                        );
                      }}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} size="sm">
                  Save
                </Button>
              </div>
              <span className="text-[12px] mt-1 text-gray-400">
                Press escape to cancel, enter to save
              </span>
            </form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-gray-300 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-gray-600 hover:text-gray-700 dark:hover:text-gray-800 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  apiUrl: `${messageUrl}/${id}`,
                  query: messageQuery,
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-red-500 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};
