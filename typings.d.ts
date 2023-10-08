import { Channel, MemberRole, user } from "@prisma/client";
import { Session } from "next-auth";
import { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer, Socket } from "net";

export type NextApiResponseServerIo = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

export interface SessionTypes extends Session {
  user: user;
}

export interface MyServer {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  userId: string;
}

export interface MemberTypes {
  id: string;
  role: MemberRole;
  userId: string;
  serverId: string;
  createdAt: Date;
  updatedAt: Date;
  user: user;
}

export interface ServerWithDetails {
  id: string;
  name: string;
  imageUrl: string;
  inviteCode: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  channels: Channel[];
  members: MemberTypes[];
}
