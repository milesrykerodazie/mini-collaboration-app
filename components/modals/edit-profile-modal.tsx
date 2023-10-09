import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useModal } from "@/hooks/modal-hook";

const EditProfile = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "profile";
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
