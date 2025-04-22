import React from "react";

type WaitingForMagicLinkProps = {
  toggleState: () => void;
};

export const WaitingForMagicLink: React.FC<WaitingForMagicLinkProps> = ({ toggleState }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Check your email!</h1>
      <p className="text-gray-600 mb-6">
        We've sent you a magic link to sign in. Please check your inbox.
      </p>
      <button
        onClick={toggleState}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Resend Magic Link
      </button>
    </div>
  );
};