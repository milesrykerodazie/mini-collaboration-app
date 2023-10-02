import React from "react";
import NavigationAction from "./navigation-action";
import { getServers } from "@/app/actions";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { MyServer } from "@/typings";
import { NavigationItem } from "./navigation-item";
import { ThemeToggle } from "../theme-toggle";
import UserAction from "./user-action";
import { getCurrentUser } from "@/lib/auth";

const NavigationSidebar = async () => {
  const currentUser = await getCurrentUser();
  const servers = (await getServers()) as MyServer[];

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full py-3 border-r border-r-gray-200 dark:border-r-gray-700">
      <NavigationAction />
      <Separator className="h-[2px] bg-gray-300 dark:bg-gray-700 rounded-md w-10 mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {servers?.map((server) => (
          <div key={server?.id} className="mb-4">
            <NavigationItem
              id={server.id}
              name={server.name}
              imageUrl={server.imageUrl}
            />
          </div>
        ))}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ThemeToggle />
        <UserAction userImage={currentUser?.user?.image} />
      </div>
    </div>
  );
};

export default NavigationSidebar;
