import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ServerSidebar from "@/components/server/server-sidebar";
import { getServerById } from "@/app/actions";
import { MyServer } from "@/typings";

const ServerIdLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { serverId: string };
}) => {
  const server = (await getServerById(params)) as MyServer;

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="h-full">
      <div className="hidden md:flex h-full w-60 z-20 flex-col fixed inset-y-0">
        <ServerSidebar serverId={params.serverId} />
      </div>
      <main className="h-screen md:pl-60">{children}</main>
    </div>
  );
};

export default ServerIdLayout;
