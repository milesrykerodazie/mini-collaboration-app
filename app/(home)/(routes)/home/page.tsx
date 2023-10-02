import { redirect } from "next/navigation";

import { MyServer } from "@/typings";
import InitialModal from "@/components/modals/initial-modal";
import { getOneServer, getSomeServers } from "@/app/actions";

export default async function Home() {
  const server = (await getOneServer()) as MyServer;
  const servers = (await getSomeServers()) as MyServer[];

  if (server) {
    return redirect(`/ca/server/${server.id}`);
  }

  return <InitialModal servers={servers} />;
}
