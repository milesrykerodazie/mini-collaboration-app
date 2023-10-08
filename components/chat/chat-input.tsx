"use client";

import React, { useState } from "react";
import * as z from "zod";
import qs from "query-string";

import { Input } from "../ui/input";
import { Plus, Send } from "lucide-react";
import EmojiPicker from "../emoji-picker";
import axios from "axios";
import { useRouter } from "next/navigation";

import { useModal } from "@/hooks/modal-hook";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

interface ChatInputProps {
  apiUrl: string;
  id?: string;
  query: Record<string, any>;
  name: string;
  type: "conversation" | "channel";
}

const ChatInput = ({ apiUrl, query, name, type, id }: ChatInputProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { onOpen } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");

  const queryClient = useQueryClient();

  //send message function
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });

      const response = await axios.post(url, {
        content: content,
      });

      if (response?.data) {
        if (response?.data?.success === true) {
          setContent("");
          router.refresh();
        }
      }
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        // This error is an instance of AxiosError
        toast({
          variant: "destructive",
          title: "Sending error.",
          description: error?.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sending error.",
          description: "Something went wrong.",
        });
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <form
      onSubmit={handleSendMessage}
      className="flex items-center p-4 pb-6 space-x-2"
    >
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => onOpen("messageFile", { apiUrl, query })}
          className="absolute top-2 left-2 h-[24px] w-[24px] bg-gray-500 dark:bg-gray-300 hover:bg-gray-600 dark:hover:bg-gray-200 transition rounded-full p-1 flex items-center justify-center"
        >
          <Plus className="text-white dark:text-gray-800 transition" />
        </button>
        <Input
          disabled={isLoading}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="px-10 py-5 bg-gray-200/90 dark:bg-gray-700/75 border-none border-0 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 dark:text-gray-200"
          placeholder={`Message ${type === "conversation" ? name : "#" + name}`}
        />
        <div className="absolute top-2 right-2">
          <EmojiPicker
            onChange={(emoji: string) => {
              setContent((prevContent) => `${prevContent} ${emoji}`);
            }}
          />
        </div>
      </div>
      <Button disabled={isLoading} type="submit" size="sm">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
