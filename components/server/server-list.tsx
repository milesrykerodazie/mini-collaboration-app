"use client";
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
      <span className="capitalize text-sm">{serverName}</span>
    </Link>
  );
};

export default ServerList;
