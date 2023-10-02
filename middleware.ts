import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  //is user authenticated
  const isAuth = await getToken({ req, secret });

  const pathname = req.nextUrl.pathname;

  const pathsToCheck = ["/home", "/ca", "/invite"];

  if (isAuth === null && pathsToCheck.some((path) => pathname.includes(path))) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isAuth !== null && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if (isAuth !== null && pathname === "/register") {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if (pathname === "/" && isAuth !== null) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/register/:path*",
    "/home/:path*",
    "/ca/:path*",
    "/invite/:path*",
  ],
};
