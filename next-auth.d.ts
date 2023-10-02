import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    username: string;
    image: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username: string | undefined;
    image: string;
  }
}
