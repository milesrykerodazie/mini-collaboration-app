import { NextResponse } from "next/server";
import * as argon from "argon2";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, username, password } = body;

  //checking if email already exists
  const emailExists = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  //checking if email already exists
  const usernameExists = await db.user.findUnique({
    where: {
      username: username,
    },
  });

  if (emailExists) {
    return NextResponse.json(
      {
        success: false,
        message: "Email Already Exists.",
      },
      { status: 409 }
    );
  }

  if (usernameExists)
    return NextResponse.json(
      {
        success: false,
        message: "Username Already In Use.",
      },
      { status: 409 }
    );

  //encrypting password
  const hashedPassword = await argon.hash(password);

  const defaultImage =
    "https://icon-library.com/images/no-user-image-icon/no-user-image-icon-0.jpg";

  const newUser = await db.user.create({
    data: {
      name,
      email,
      username: username && username,
      image: defaultImage,
      password: hashedPassword,
    },
  });

  if (newUser) {
    return NextResponse.json(
      {
        success: true,
        message: `${newUser.username} registered successfully.`,
      },
      { status: 201 }
    );
  }
}
