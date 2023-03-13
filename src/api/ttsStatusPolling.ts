interface StatusPollingResponse {
  preset: string;
  transcriptionId: string;
  audioUrl: string[];
  voice: string;
  transcriped: boolean;
}

export async function getTextSpeechStatusPolling(
  transcriptionId: string
): Promise<StatusPollingResponse> {
  const response = await fetch(
    `https://verbyttsapi.vercel.app/articleStatus/${transcriptionId}`
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
