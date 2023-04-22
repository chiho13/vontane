import { PrismaClient, Prisma } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadAudioToSupabase(
  prisma: PrismaClient,
  supabaseServerClient: SupabaseClient,
  audioUrl: string,
  fileName: string,
  workspaceId: string
): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabaseServerClient.auth.getUser();
    const userId = user?.id;
    if (!userId) {
      throw new Error("User is not authenticated.");
    }

    const userFolder = userId;
    const filePath = `${userFolder}/${fileName}`;

    // Check if the file already exists
    const { data: fileList, error: listError } =
      await supabaseServerClient.storage.from("tts-audio").list(userFolder);

    if (listError) {
      throw listError;
    }

    const fileExists = fileList.some((file) => file.name === filePath);

    if (!fileExists) {
      // If the file does not exist, upload it
      const response = await fetch(audioUrl);
      const audioBlob = await response.blob();

      const { error: uploadError } = await supabaseServerClient.storage
        .from("tts-audio")
        .upload(filePath, audioBlob);

      if (uploadError) {
        throw uploadError;
      }
    }

    const expiresIn = 60 * 60 * 24; // 24 hours in seconds
    const { data: signedURL, error: signedURLError } =
      await supabaseServerClient.storage
        .from("tts-audio")
        .createSignedUrl(filePath, expiresIn);

    if (signedURLError || !signedURL) {
      throw new Error("Failed to generate signed URL for the audio file.");
    }

    await prisma.texttospeech.create({
      data: {
        file_name: fileName,
        creator_id: userId,
        workspace_id: workspaceId,
      },
    });

    return signedURL.signedUrl;
  } catch (error) {
    console.error("Error uploading audio file to Supabase:", error);
    throw new Error("Failed to upload audio file to Supabase storage.");
  }
}
