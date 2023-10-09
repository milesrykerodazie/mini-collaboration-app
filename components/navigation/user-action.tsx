"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../user-avatar";
import { LogOut, User } from "lucide-react";
import { useModal } from "@/hooks/modal-hook";

const UserAction = ({
  userImage,
}: {
  userImage: string | null | undefined;
}) => {
  const { onOpen } = useModal();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar src={userImage} />
        <span className="sr-only">User action</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onOpen("profile")}
          className="flex items-center space-x-2"
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpen("logout")}
          className="flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAction;
