import { TTSResponse } from "../types/ttsresponse";

export async function ttsApi(requestBody: object): Promise<TTSResponse> {
  const response = await fetch("https://verbyttsapi.vercel.app/convert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
