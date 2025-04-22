// app/components/realtime/ClientSideCredits.tsx

import React from "react";

// Define the type for the prop
interface ClientSideCreditsProps {
  creditsRow: { credits: number } | null; // Allow creditsRow to be null
}

const ClientSideCredits: React.FC<ClientSideCreditsProps> = ({ creditsRow }) => {
  return (
    <div>
      <h3>Your Credits</h3>
      <p>You have {creditsRow ? creditsRow.credits : 0} credits remaining.</p> {/* If creditsRow is null, show 0 */}
    </div>
  );
};

export default ClientSideCredits;
