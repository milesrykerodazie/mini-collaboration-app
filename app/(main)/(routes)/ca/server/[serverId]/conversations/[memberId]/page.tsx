import { getCurrentMember, getOrCreateConversation } from "@/app/actions";
import ChatHeader from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

interface MemberIdPageProps {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams: {
    video?: boolean;
  };
}

const MemberPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const currentUser = await getCurrentUser();
  const currentMember = await getCurrentMember(params);

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    params.memberId
  );

  if (!conversation) {
    return redirect(`/server/${params.serverId}`);
  }

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.userId === currentUser?.user?.id ? memberTwo : memberOne;

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember?.user?.image!}
        name={otherMember?.user?.name!}
        serverId={params.serverId}
        type="conversation"
      />
      {searchParams.video && (
        <MediaRoom
          chatId={conversation.id}
          video={true}
          audio={true}
          currentUser={currentUser}
        />
      )}
      {!searchParams.video && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember?.user?.name!}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-message"
            paramKey="conversationId"
            paramValue={conversation.id}
            messageUrl="/api/direct-message"
            messageQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            name={otherMember?.user?.name!}
            type="conversation"
            apiUrl="/api/direct-message/new-message"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberPage;
