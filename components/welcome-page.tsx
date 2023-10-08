import Image from "next/image";
import Link from "next/link";
import React from "react";

const WelcomePage = () => {
  return (
    <div className="w-full fixed inset-0 flex items-center justify-center h-screen bg-black overflow-hidden">
      <main className="w-full mx-auto md:max-w-6xl flex flex-col lg:flex-row p-6 xl:p-0 lg:justify-between lg:space-x-10">
        <div className="flex justify-center items-center w-full">
          <div className="h-[300px] w-[300px] lg:h-[600px] md:h-[400px] md:w-[500px] relative trans">
            <Image
              fill
              src="/images/community.jpg"
              alt="logo"
              className="object-cover rounded-lg"
              priority={true}
            />
          </div>
        </div>
        <div className=" flex flex-col space-y-5 w-full">
          <h3 className="text-white text-xl sm:text-3xl md:text-5xl font-bold text-center">
            Welcome To Miles Collaboration{" "}
          </h3>
          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/login"
              className="bg-white text-gray-700 px-4 py-2 rounded-md"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-gray-700 px-4 py-2 rounded-md"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WelcomePage;
