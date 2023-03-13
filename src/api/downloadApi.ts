export async function downloadAudio(transcriptionId: string): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TTS_ENDPOINT}/download/${transcriptionId}`
  );
  const blob = await response.blob();
  return blob;
}
