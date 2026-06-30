// src/services/api.js
import { Platform } from "react-native";

const BASE_URL = "http://127.0.0.1:8000";

export const SUPPORTED_CROPS = ["maize", "potato", "beans"];

export const uploadLeafImage = async (
  imageUri,
  crop,
  endpoint = "/api/predict",
) => {
  if (!crop || !SUPPORTED_CROPS.includes(crop.toLowerCase())) {
    throw new Error(`Unsupported crop: ${crop}`);
  }

  const formData = new FormData();
  const filename = imageUri.split("/").pop() || "image.jpg";
  const ext = filename.split(".").pop().toLowerCase();
  const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`;

  if (Platform.OS === "web") {
    // On web, imageUri is typically a blob: or data: URL from the picker.
    // Browser FormData needs an actual Blob/File object, not the RN {uri, name, type} shape.
    const fileResponse = await fetch(imageUri);
    const blob = await fileResponse.blob();
    formData.append("file", blob, filename);
  } else {
    // Native (iOS/Android): RN's FormData polyfill understands this object shape.
    formData.append("file", {
      uri: imageUri,
      name: filename,
      type: mimeType,
    });
  }

  formData.append("crop", crop.toLowerCase());

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    // Do NOT manually set Content-Type — browser/RN sets the multipart boundary automatically
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return response.json();
};
