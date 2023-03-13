export async function downloadAudio(transcriptionId: string): Promise<Blob> {
  const response = await fetch(
    `https://verbyttsapi.vercel.app/download/${transcriptionId}`
  );
  const blob = await response.blob();
  return blob;
}
