import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import * as argon from "argon2";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { SessionTypes } from "@/typings";
// import { SessionInterface } from "@/types";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },

      //@ts-ignore
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        //finding if user exists
        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.password) {
          throw new Error("Invalid credentials");
        }

        //comparing password
        const isCorrectPassword = await argon.verify(
          user.password,
          credentials.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          username: user?.username,
        };
      }
      return token;
    },

    async session({ session }: any) {
      const email = session?.user?.email as string;
      try {
        const data = await db.user.findUnique({
          where: {
            email: email,
          },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            bio: true,
            createdAt: true,
          },
        });

        if (data) {
          const newSession = {
            ...session,
            user: {
              ...session.user,
              ...data,
            },
          };

          //   return newSession as SessionInterface;
          return newSession as SessionTypes;
        }
      } catch (error: any) {
        console.error("Error retrieving user data: ", error.message);
        return session;
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  return session as SessionTypes;
}
