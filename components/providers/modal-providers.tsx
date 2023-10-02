"use client";

import { CreateServerModal } from "../modals/create-server-modal";
import { LogoutModal } from "../modals/logout-modal";
import { MessageFileModal } from "../modals/message-file-modal";
import { DeleteMessageModal } from "../modals/delete-message-modal";
import { CreateChannelModal } from "../modals/create-channel-modal";
import { MembersModal } from "../modals/members-modal";
import { InviteModal } from "../modals/invite-modal";
import { EditServerModal } from "../modals/edit-server-modal";
import { DeleteServerModal } from "../modals/delete-server-modal";
import { DeleteChannelModal } from "../modals/delete-channel-modal";
import { EditChannelModal } from "../modals/edit-channel-modal";
import { LeaveServerModal } from "../modals/leave-server-modal";

export const ModalProvider = () => {
  return (
    <>
      <CreateServerModal />
      <LogoutModal />
      <MessageFileModal />
      <DeleteMessageModal />
      <CreateChannelModal />
      <MembersModal />
      <InviteModal />
      <EditServerModal />
      <DeleteServerModal />
      <DeleteChannelModal />
      <EditChannelModal />
      <LeaveServerModal />
    </>
  );
};
