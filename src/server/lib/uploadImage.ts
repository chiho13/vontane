import { PrismaClient, Prisma } from "@prisma/client";
import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadImage(
  prisma: PrismaClient,
  supabaseServerClient: SupabaseClient,
  imageURL: string,
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
    const filePath = `${userFolder}/${workspaceId}/${fileName}`;

    // Check if the file already exists
    const { data: fileList, error: listError } =
      await supabaseServerClient.storage.from("dalle").list(userFolder);

    if (listError) {
      throw listError;
    }

    const fileExists = fileList.some((file) => file.name === filePath);

    if (!fileExists) {
      // If the file does not exist, upload it
      const response = await fetch(imageURL);
      const imageBlob = await response.blob();

      const { error: uploadError } = await supabaseServerClient.storage
        .from("dalle")
        .upload(filePath, imageBlob);

      if (uploadError) {
        throw uploadError;
      }
    }

    const expiresIn = 60 * 60 * 24 * 7; // 24 hours in seconds
    const response = await supabaseServerClient.storage
      .from("dalle")
      .getPublicUrl(filePath);

    return response.data.publicUrl;
  } catch (error) {
    console.error("Error uploading image file to Supabase:", error);
    throw new Error("Failed to upload image file to Supabase storage.");
  }
}

export async function uploadImageBlob(
  prisma: PrismaClient,
  supabaseServerClient: SupabaseClient,
  imageBlob: Blob,
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
    const filePath = `${userFolder}/${workspaceId}/${fileName}`;

    // Check if the file already exists
    const { data: fileList, error: listError } =
      await supabaseServerClient.storage.from("dalle").list(userFolder);

    if (listError) {
      throw listError;
    }

    const fileExists = fileList.some((file) => file.name === filePath);

    if (!fileExists) {
      // If the file does not exist, upload it
      const { error: uploadError } = await supabaseServerClient.storage
        .from("dalle")
        .upload(filePath, imageBlob);

      if (uploadError) {
        throw uploadError;
      }
    }

    const expiresIn = 60 * 60 * 24 * 7; // 24 hours in seconds
    const { data: signedURL, error: signedURLError } =
      await supabaseServerClient.storage
        .from("dalle")
        .createSignedUrl(filePath, expiresIn);

    if (signedURLError || !signedURL) {
      throw new Error("Failed to generate signed URL for the image file.");
    }

    return signedURL.signedUrl;
  } catch (error) {
    console.error("Error uploading image file to Supabase:", error);
    throw new Error("Failed to upload image file to Supabase storage.");
  }
}
