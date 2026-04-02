import { ListenPage } from "@/components/recording/listen-page";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListenRecordingPage({ params }: PageProps) {
  const { id } = await params;
  return <ListenPage recordingId={id} />;
}
