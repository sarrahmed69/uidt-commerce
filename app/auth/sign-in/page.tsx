import SignIn from "@/screens/auth/widgets/SignIn";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SignIn />
    </Suspense>
  );
};

export default page;