import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { addMemberToServer, existingServer } from "@/app/actions";

interface InviteCodePageProps {
  params: {
    inviteCode: string;
  };
}

const InviteCodePage = async ({ params }: InviteCodePageProps) => {
  if (!params.inviteCode) {
    return redirect("/");
  }

  const existingSver = await existingServer(params);

  if (existingSver) {
    return redirect(`/ca/server/${existingSver?.id}`);
  }

  const server = await addMemberToServer(params);

  if (server) {
    return redirect(`/ca/server/${server?.id}`);
  }

  return null;
};

export default InviteCodePage;
