"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/modal-hook";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { Label } from "../ui/label";
import { useDropzone } from "react-dropzone";
import { useToast } from "../ui/use-toast";

//types for the form
interface FormData {
  name: string;
  image: File | null;
  serverImage: string | null;
  imageBase64: string;
}

export const EditServerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const isModalOpen = isOpen && type === "editServer";
  const { server } = data;
  const { toast } = useToast();

  //the states
  const [formData, setFormData] = useState<FormData>({
    name: server?.name!,
    image: null,
    serverImage: "",
    imageBase64: "",
  });

  useEffect(() => {
    if (server) {
      setFormData((prev) => ({
        ...prev,
        name: server?.name,
        serverImage: server?.imageUrl,
      }));
    }
  }, [server]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, image, imageBase64, serverImage } = formData;

  //react dropzone image handling
  const handleImageDrop = (acceptedFiles: File[]) => {
    const selectedImage = acceptedFiles[0];

    // Convert the selected image to a Base64 string
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const base64String = event.target.result.toString();
        setFormData({
          ...formData,
          image: selectedImage,
          imageBase64: base64String,
        });
      }
    };
    reader.readAsDataURL(selectedImage);
  };

  //drop zone hook
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleImageDrop,
    accept: {
      "image/*": [],
    },
    multiple: false,
  });

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await axios.patch(`/api/servers/${server?.id}`, {
        name: name,
        imageUrl: imageBase64,
      });
      if (response?.data) {
        if (response?.data?.success === true) {
          toast({
            variant: "success",
            title: "Server success.",
            description: response?.data?.message,
          });
          setFormData((prev) => ({
            ...prev,
            image: null,
            imageBase64: "",
          }));
          setIsSubmitting(false);
          router.refresh();
          onClose();
        }
      }
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        // This error is an instance of AxiosError
        toast({
          variant: "destructive",
          title: "Server update error.",
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
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
      imageBase64: "",
    }));
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-primary p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold primary">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-gray-700">
            Give your server a personality with a name and an image. You can
            always change it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="mx-5 space-y-4">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-primary flex flex-col justify-center items-center rounded-lg p-10 cursor-pointer"
          >
            <input {...getInputProps()} />
            <UploadCloud className="h-10 w-10 fill-white stroke-gray-400" />
            {image !== null ? (
              <p className="text-center font-thin">{image?.name}</p>
            ) : (
              <p className="text-center font-thin">
                Drag 'n' drop an image here,
                <br /> or click to select one
              </p>
            )}
          </div>
          {imageBase64 && (
            <div className="flex justify-center items-center">
              <div className="relative h-32 w-32">
                <Image
                  fill
                  src={imageBase64}
                  alt="Upload"
                  className="rounded-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setFormData((prev) => ({
                      ...prev,
                      image: null,
                      imageBase64: "",
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
          {imageBase64 === "" && (
            <div className="flex justify-center items-center">
              <div className="relative h-32 w-32">
                <Image
                  fill
                  src={serverImage!}
                  alt="Upload"
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          )}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Server name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Enter server name here."
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
          <DialogFooter className="px-1 py-3 rounded-md">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
