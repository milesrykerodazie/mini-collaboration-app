"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    signIn("credentials", {
      email: email,
      password: password,
      redirect: false,
    })
      .then((response) => {
        if (response?.error === null) {
          toast({
            variant: "success",
            title: "Login success",
            description: "You are logged in.",
          });
          router.push("/");
          router.refresh();
        }
        if (response?.error !== null) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: response?.error,
          });
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
        setEmail("");
        setPassword("");
      });
  };
  return (
    <Card className="w-full md:w-4/5 lg:w-1/2">
      <CardContent className="bg-white text-black">
        <CardHeader className="pt-8 px-6">
          <CardTitle className="text-2xl text-center font-bold">
            Login
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Welcome back
          </CardDescription>
        </CardHeader>
        <div className="space-y-3 w-full">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-col items-center w-full justify-center">
          <CardFooter className="w-full">
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
          </CardFooter>

          <CardFooter className="w-full">
            <Button onClick={() => signIn("google")} className="w-full">
              <FcGoogle className="mr-3" />
              Login With Google
            </Button>
          </CardFooter>
          <CardContent>
            <div className="text-center font-light">
              <p>
                Dont have an account?
                <Link href="/register">
                  <span className="cursor-pointer hover:underline font-semibold">
                    Register
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

export default LoginForm;
