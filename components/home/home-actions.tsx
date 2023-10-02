"use client";
import React from "react";
import { ActionTooltip } from "../action-tooltip";
import { useModal } from "@/hooks/modal-hook";
import { Key, LogInIcon } from "lucide-react";
import Link from "next/link";

const HomeActions = () => {
  return (
    <div>
      <ActionTooltip side="right" align="center" label="Register">
        <Link href="/register" className="group flex items-center">
          <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-gray-500">
            <LogInIcon
              className="group-hover:text-white transition text-gray-500"
              size={25}
            />
          </div>
        </Link>
      </ActionTooltip>

      <ActionTooltip side="right" align="center" label="Login">
        <Link href="/login" className="group flex items-center">
          <div className="flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-gray-500">
            <Key
              className="group-hover:text-white transition text-gray-500"
              size={25}
            />
          </div>
        </Link>
      </ActionTooltip>
    </div>
  );
};

export default HomeActions;
