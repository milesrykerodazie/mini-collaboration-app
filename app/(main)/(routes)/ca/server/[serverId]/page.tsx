import { getSpecificServer } from "@/app/actions";
import { redirect } from "next/navigation";
import React from "react";

interface ServerIdPageProps {
  params: {
    serverId: string;
  };
}

const ServerPage = async ({ params }: ServerIdPageProps) => {
  const server = await getSpecificServer(params);

  const initialChannel = server?.channels[0];

  if (initialChannel?.name !== "general") {
    return null;
  }
  return redirect(
    `/ca/server/${params.serverId}/channels/${initialChannel?.id}`
  );
};

export default ServerPage;
