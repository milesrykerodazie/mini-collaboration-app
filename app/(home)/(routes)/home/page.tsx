import { redirect } from "next/navigation";

import { MyServer } from "@/typings";
import InitialModal from "@/components/modals/initial-modal";
import { getOneServer, getSomeServers } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const session = await getCurrentUser();
  const server = (await getOneServer()) as MyServer;
  const servers = (await getSomeServers()) as MyServer[];

  if (!session) {
    return redirect("/");
  }
  if (server && session) {
    return redirect(`/ca/server/${server.id}`);
  }

  return <>{session !== null && <InitialModal servers={servers} />}</>;
}
