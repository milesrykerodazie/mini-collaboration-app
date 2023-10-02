"use client";

import axios from "axios";
import qs from "query-string";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/modal-hook";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { File, UploadCloud, X } from "lucide-react";
import { useToast } from "../ui/use-toast";

//types for the form
interface FormData {
  fileName: string;
  rawFile: File | null;
  fileUrl: string;
}

export const MessageFileModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const { toast } = useToast();

  const isModalOpen = isOpen && type === "messageFile";
  const { apiUrl, query } = data;

  const [formData, setFormData] = useState<FormData>({
    fileName: "",
    rawFile: null,
    fileUrl: "",
  });
  const [isSending, setIsSending] = useState(false);

  const { fileName, fileUrl, rawFile } = formData;

  //react dropzone image handling
  const handleImageDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];

    // Convert the selected image to a Base64 string
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const base64String = event.target.result.toString();
        setFormData({
          ...formData,
          fileName: selectedFile?.name,
          rawFile: selectedFile,
          fileUrl: base64String,
        });
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  //drop zone hook
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleImageDrop,
    multiple: false,
  });

  //check if file is image or pdf
  const fileType = rawFile?.name?.split(".").pop();

  const handleClose = () => {
    setFormData({
      fileName: "",
      rawFile: null,
      fileUrl: "",
    });
    onClose();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSending(true);
      const url = qs.stringifyUrl({
        url: apiUrl || "",
        query,
      });

      const response = await axios.post(url, {
        fileName: fileName,
        fileType: fileType,
        fileUrl: fileUrl,
        rawFile: rawFile,
      });

      if (response?.data) {
        if (response?.data?.success === true) {
          setFormData({
            fileName: "",
            rawFile: null,
            fileUrl: "",
          });
          router.refresh();
          onClose();
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
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Send a file
          </DialogTitle>
          <DialogDescription className="text-center text-gray-500">
            Send a file as a message
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mx-5 space-y-4">
          <div
            {...getRootProps()}
            className="border-2 border-dashed flex flex-col justify-center items-center rounded-lg p-10 cursor-pointer"
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 fill-gray-200 stroke-gray-400" />
            {rawFile !== null ? (
              <p className="text-center font-thin">{rawFile?.name}</p>
            ) : (
              <p className="text-center font-thin">
                Drag 'n' drop an image or pdf here,
                <br /> or click to select one
              </p>
            )}
          </div>

          {fileUrl && fileType === "pdf" && (
            <div className="flex justify-center items-center">
              <div className="w-20 h-20 relative">
                <File className="h-14 w-14 fill-gray-200 stroke-gray-400" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData((prev) => ({
                      ...prev,
                      rawFile: null,
                      fileUrl: "",
                    }));
                  }}
                  className="bg-red-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          <DialogFooter className="px-1 py-3 rounded-md">
            <Button type="submit" disabled={isSending} className="w-full">
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
