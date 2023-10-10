"use client";
import React, { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useModal } from "@/hooks/modal-hook";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";

//types for the form
interface FormData {
  name: string;
  image: File | null;
  username: string;
  bio: string;
  email: string;
  userImage: string;
  imageBase64: string;
}

const EditProfile = () => {
  const router = useRouter();
  const { isOpen, onClose, type, data } = useModal();
  const { user } = data;
  const isModalOpen = isOpen && type === "profile";
  const { toast } = useToast();

  //the states
  const [formData, setFormData] = useState<FormData>({
    name: user?.name!,
    username: user?.username!,
    bio: user?.bio!,
    email: user?.email!,
    image: null,
    userImage: "",
    imageBase64: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user?.name!,
        username: user?.username!,
        bio: user?.bio!,
        userImage: user?.image!,
        email: user?.email!,
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { name, username, bio, email, image, userImage, imageBase64 } =
    formData;

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
      const response = await axios.patch(`/api/user/${user?.id}`, {
        name: name,
        username: username,
        bio: bio,
        imageUrl: imageBase64,
      });

      if (response?.data) {
        if (response?.data?.success === true) {
          toast({
            variant: "success",
            title: "Profile Update success.",
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
          title: "Profile update error.",
          description: error?.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Profile update error.",
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
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-primary p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold text-primary">
            Edit Profile
          </DialogTitle>
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
                  src={userImage!}
                  alt="Upload"
                  className="rounded-full object-cover"
                />
              </div>
            </div>
          )}

          <p className="text-primary">Email: {email}</p>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Name</Label>
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
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              placeholder="Enter server name here."
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Input
              type="text"
              id="bio"
              value={bio}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  bio: e.target.value,
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

export default EditProfile;
