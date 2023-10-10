"use client";
import { Server } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ServerListProps {
  origin: string;
  inviteCode: string;
  serverName: string;
}

const ServerList = ({ origin, inviteCode, serverName }: ServerListProps) => {
  return (
    <Link href={`${origin}/invite/${inviteCode}`}>
      <ul className="capitalize text-sm flex items-center space-x-1">
        <Server className="w-4 h-4" />
        <span>{serverName}</span>
      </ul>
    </Link>
  );
};

export default ServerList;
