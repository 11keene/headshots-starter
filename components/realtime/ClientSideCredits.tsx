interface ClientSideCreditsProps {
  creditsRow: { credits: number } | null; // Accepts either an object or null
}

const ClientSideCredits = ({ creditsRow }: ClientSideCreditsProps) => {
  return (
    <div>
      {creditsRow ? (
        <span>{creditsRow.credits} Credits</span>
      ) : (
        <span>No credits available</span>
      )}
    </div>
  );
};

export default ClientSideCredits;
