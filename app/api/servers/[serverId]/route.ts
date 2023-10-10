import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const server = await db.server.delete({
      where: {
        id: params.serverId,
        userId: currentUser?.user?.id,
      },
    });

    if (server) {
      return NextResponse.json(server);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Server not found.",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.log("[SERVER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
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
    const { name, imageUrl } = await req.json();

    //find the server and include the image
    const foundServer = await db.server.findUnique({
      where: {
        id: params.serverId,
      },
      include: {
        serverImage: true,
      },
    });

    if (!foundServer) {
      return NextResponse.json(
        {
          success: false,
          message: "Server not found.",
        },
        { status: 404 }
      );
    }

    if (imageUrl) {
      //delete the previous image from cloudinary and database
      if (foundServer?.serverImage !== null) {
        await cloudinary.uploader.destroy(foundServer?.serverImage?.public_id);
      }

      //upload a new image
      const uploadedImage = await cloudinary.uploader.upload(imageUrl, {
        folder: "collaboration/server/images",
      });

      //update the server image
      await db.serverImage.update({
        where: {
          id: foundServer?.serverImage?.id,
        },
        data: {
          public_id: uploadedImage?.public_id,
          url: uploadedImage?.secure_url,
        },
      });

      if (name) {
        //update server
        const updateServer = await db.server.update({
          where: {
            id: foundServer?.id,
          },
          data: {
            name: name,
            imageUrl: uploadedImage?.secure_url,
          },
        });

        if (updateServer) {
          return NextResponse.json(
            { success: true, message: "Server Updated" },
            { status: 201 }
          );
        } else {
          return NextResponse.json(
            { success: false, message: "Server not Updated" },
            { status: 400 }
          );
        }
      } else {
        //update server
        const updateServer = await db.server.update({
          where: {
            id: foundServer?.id,
          },
          data: {
            imageUrl: uploadedImage?.secure_url,
          },
        });

        if (updateServer) {
          return NextResponse.json(
            { success: true, message: "Server Updated" },
            { status: 201 }
          );
        } else {
          return NextResponse.json(
            { success: false, message: "Server not Updated" },
            { status: 400 }
          );
        }
      }
    } else {
      //update server
      const updateServer = await db.server.update({
        where: {
          id: foundServer?.id,
        },
        data: {
          name: name,
        },
      });

      if (updateServer) {
        return NextResponse.json(
          { success: true, message: "Server Updated" },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: "Server not Updated" },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.log("[SERVER_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
