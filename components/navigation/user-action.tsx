"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "../user-avatar";
import { LogOut, Trash, User } from "lucide-react";
import { useModal } from "@/hooks/modal-hook";
import { user } from "@prisma/client";

const UserAction = ({ user }: { user: user }) => {
  const { onOpen } = useModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar src={user?.image} />
        <span className="sr-only">User action</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => onOpen("profile", { user })}
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
        <DropdownMenuItem
          onClick={() => onOpen("deleteProfile", { user })}
          className="flex items-center space-x-2"
        >
          <Trash className="w-4 h-4 text-red-500" />
          <span className="text-red-500">Delete Account</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAction;
