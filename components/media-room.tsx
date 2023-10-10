"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

import { Loader2 } from "lucide-react";
import { SessionTypes } from "@/typings";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  currentUser: SessionTypes;
}

export const MediaRoom = ({
  chatId,
  video,
  audio,
  currentUser,
}: MediaRoomProps) => {
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!currentUser?.user?.name) return;

    const name = currentUser?.user?.name;

    (async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${chatId}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-gray-500 animate-spin my-4" />
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
