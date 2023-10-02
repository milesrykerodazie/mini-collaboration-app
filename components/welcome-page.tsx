import Link from "next/link";
import React from "react";

const WelcomePage = () => {
  return (
    <div className="space-y-4 flex flex-col">
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </div>
  );
};

export default WelcomePage;
