"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Separator } from "../ui/separator";
import { MyServer } from "@/typings";
import { ScrollArea } from "../ui/scroll-area";
import ServerList from "../server/server-list";
import { useOrigin } from "@/hooks/use-origin";

const InitialModal = ({ servers }: { servers: MyServer[] }) => {
  const origin = useOrigin();

  return (
    <Dialog open>
      <DialogContent className="bg-white text-black p-3 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Join a server OR Create your server
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Join a server or you can create your own personal server and invite
            your friends.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center px-5 py-2">
          <h3 className="capitalize font-semibold">Create Server</h3>
          <Button>Create</Button>
        </div>
        <Separator className="bg-gray-300 rounded-md my-2" />
        <div className="flex flex-col px-5 py-2">
          <h3 className="capitalize font-semibold">Join Server</h3>
          <ScrollArea className="h-auto max-h-[72] space-y-1">
            {servers?.map((server) => (
              <div
                key={server?.id}
                className="hover:bg-gray-200 px-2 py-1 rounded-md transition"
              >
                <ServerList
                  origin={origin}
                  inviteCode={server?.inviteCode}
                  serverName={server?.name}
                />
              </div>
            ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialModal;
