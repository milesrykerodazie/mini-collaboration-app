"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const RegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  //the registration data
  const regData = {
    name,
    email,
    username,
    password,
  };

  const canSubmit =
    name !== "" && email !== "" && username !== "" && password !== "";

  const handleRegister = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();

    try {
      if (!canSubmit) {
        toast({
          variant: "destructive",
          title: "Incomplete fields.",
          description: "Check all required fields.",
        });
      }
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Password Mismatch.",
          description: "The pasaswords do not match.",
        });
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const regData = {
        name,
        email,
        username,
        password,
      };

      const response = await axios.post("/api/register", regData);

      if (response?.data) {
        if (response?.data?.success === true) {
          toast({
            variant: "success",
            title: "Registration success.",
            description: response?.data?.message,
          });
          setName("");
          setEmail("");
          setUsername("");
          setPassword("");
          setConfirmPassword("");
          router.push("/login");
        }
      }
    } catch (error: any) {
      if (error instanceof axios.AxiosError) {
        // This error is an instance of AxiosError
        toast({
          variant: "destructive",
          title: "Registration error.",
          description: error?.response?.data?.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Registration error.",
          description: "Something went wrong.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card className="w-full">
      <CardContent className="bg-white text-black rounded-md">
        <CardHeader className="pt-8 px-6">
          <CardTitle className="text-2xl text-center font-bold text-primary">
            Register
          </CardTitle>
          <CardDescription className="text-center text-gray-700">
            We are happy to have you on our platform!
          </CardDescription>
        </CardHeader>
        <div className="space-y-3 w-full">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name" className="text-primary">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Name"
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email" className="text-primary">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="username" className="text-primary">
              Username
            </Label>
            <Input
              type="text"
              id="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password" className="text-primary">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="confirm-password" className="text-primary">
              Confirm-password
            </Label>
            <Input
              type="password"
              id="confirm-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Confirm-password"
              className="focus-visible:ring-0 focus-visible:ring-offset-0 bg-white border-primary text-gray-800"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-col items-center w-full justify-center">
          <CardFooter className="">
            <Button onClick={handleRegister} className="w-full">
              Register
            </Button>
          </CardFooter>

          <CardFooter className="">
            <Button onClick={() => signIn("google")} className="w-full">
              <FcGoogle className="mr-3" />
              Register With Google
            </Button>
          </CardFooter>
          <CardContent className="text-primary">
            <div className="text-center font-light">
              <p>
                Already have an account?
                <Link href="/login">
                  <span className="cursor-pointer hover:underline font-semibold">
                    Login
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
