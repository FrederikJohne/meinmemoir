import { RecordingPage } from "@/components/recording/recording-page";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function MagicLinkRecordingPage({ params }: PageProps) {
  const { token } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/magic-links/${token}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return <RecordingPage token={token} expired />;
  }

  const data = await response.json();

  return (
    <RecordingPage
      token={token}
      storytellerName={data.storyteller_name}
      question={data.question}
      language={data.language}
    />
  );
}
