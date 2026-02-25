import { http } from "./http";

export async function uploadMedia(file: File) {
  const form = new FormData();
  form.append("file", file);

  const { data } = await http.post("/media", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}
