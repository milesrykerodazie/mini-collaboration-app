// import { redirect } from "next/navigation";
// import { getOneServer, getSomeServers } from "./actions";
// import { MyServer } from "@/typings";
// import InitialModal from "@/components/modals/initial-modal";

// export default async function Home() {
//   const server = (await getOneServer()) as MyServer;
//   const servers = (await getSomeServers()) as MyServer[];

//   if (server) {
//     return redirect(`/ca/server/${server.id}`);
//   }

//   return <InitialModal servers={servers} />;
// }

import React from "react";

const Welcome = () => {
  return <div className="h-screen w-full overflow-hidden"></div>;
};

export default Welcome;
