"use client";

import axios from "axios";
import { MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/modal-hook";
import { useToast } from "../ui/use-toast";
import { signOut } from "next-auth/react";

export const DeleteProfileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const { toast } = useToast();

  const isModalOpen = isOpen && type === "deleteProfile";
  const { user } = data;

  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const response = await axios.delete(`/api/user/${user?.id}`);
      if (response?.data?.success === true) {
        signOut();
        toast({
          variant: "success",
          title: "Server success.",
          description: response?.data?.message,
        });
      }
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        // This error is an instance of AxiosError
        toast({
          variant: "destructive",
          title: "Delete error.",
          description: error?.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Server update error.",
          description: "Something went wrong.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-primary p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Account
          </DialogTitle>
          <DialogDescription className="text-center text-gray-700">
            <span className="text-gray-500 font-bold capitalize">
              {user?.name}
            </span>{" "}
            Are you sure you want to delete your account ? <br />
            this is a permanent action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isLoading} onClick={handleDelete}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
