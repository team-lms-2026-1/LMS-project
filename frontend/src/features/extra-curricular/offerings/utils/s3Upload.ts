export async function uploadToS3PresignedUrl(params: {
  uploadUrl: string;
  file: File;
  contentType: string;
}) {
  const { uploadUrl, file, contentType } = params;

  // presigned PUT은 응답 body가 비어있는 경우가 많아서 text/json 파싱 금지
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }
}
