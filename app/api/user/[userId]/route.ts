import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }
    const { name, imageUrl, username, bio } = await req.json();

    //find the server and include the image
    const foundUser = await db.user.findUnique({
      where: {
        id: params.userId,
      },
      include: {
        userImage: true,
      },
    });

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "user not found.",
        },
        { status: 404 }
      );
    }

    //unique username
    const usernameExists = await db.user.findUnique({
      where: {
        username: username,
      },
    });

    console.log("the username => ", usernameExists);

    if (usernameExists && usernameExists?.id !== foundUser?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already in use.",
        },
        { status: 409 }
      );
    }

    if (imageUrl) {
      //delete the previous image from cloudinary and database
      if (foundUser?.userImage !== null) {
        await cloudinary.uploader.destroy(foundUser?.userImage?.public_id);

        //upload a new image
        const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
          folder: "collaboration/user/images",
        });

        //update the server image
        await db.userImage.update({
          where: {
            id: foundUser?.userImage?.id,
          },
          data: {
            public_id: uploadedImage?.public_id,
            url: uploadedImage?.secure_url,
          },
        });

        //update user profile
        const updateProfile = await db.user.update({
          where: {
            id: foundUser?.id,
          },
          data: {
            name: name,
            image: uploadedImage?.secure_url,
            username: username,
            bio: bio,
          },
        });

        if (updateProfile) {
          return NextResponse.json(
            { success: true, message: "User Profile Updated" },
            { status: 201 }
          );
        } else {
          return NextResponse.json(
            { success: false, message: "User Profile Not Updated" },
            { status: 400 }
          );
        }
      } else {
        //upload a new image
        const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
          folder: "collaboration/user/images",
        });

        //update the server image
        await db.userImage.create({
          data: {
            public_id: uploadedImage?.public_id,
            url: uploadedImage?.secure_url,
            userId: foundUser?.id,
          },
        });

        //update user profile
        const updateProfile = await db.user.update({
          where: {
            id: foundUser?.id,
          },
          data: {
            name: name,
            image: uploadedImage?.secure_url,
            username: username,
            bio: bio,
          },
        });

        if (updateProfile) {
          return NextResponse.json(
            { success: true, message: "User Profile Updated" },
            { status: 201 }
          );
        } else {
          return NextResponse.json(
            { success: false, message: "User Profile Not Updated" },
            { status: 400 }
          );
        }
      }
    } else {
      //update server
      const updateProfile = await db.user.update({
        where: {
          id: foundUser?.id,
        },
        data: {
          name: name,
          username: username,
          bio: bio,
        },
      });

      if (updateProfile) {
        return NextResponse.json(
          { success: true, message: "User profile Updated" },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: "User profile not Updated" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.log("[USER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    //find the server and include the image
    const foundUser = await db.user.findUnique({
      where: {
        id: params.userId,
      },
      include: {
        userImage: true,
      },
    });

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "user not found.",
        },
        { status: 404 }
      );
    }

    if (foundUser?.userImage !== null) {
      await cloudinary.uploader.destroy(foundUser?.userImage?.public_id);
    }

    //find the server and include the image
    const deletedUser = await db.user.delete({
      where: {
        id: foundUser?.id,
      },
    });

    if (deletedUser) {
      return NextResponse.json(
        {
          success: true,
          message: "User deleted.",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "User Not Deleted.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.log("[USER_PROFILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
