"use client";
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
import { signOut } from "next-auth/react";

export const LogoutModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "logout";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Logout
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Are you sure you want to logout?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={() => signOut()}>Logout</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
