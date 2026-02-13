import { proxyToBackend } from "@/lib/bff";
import { revalidateTag } from "next/cache";

const TAG = "student:diagnoses";

export async function GET(req: Request) {
  return proxyToBackend(req, "/api/v1/student/diagnoses", {
    method: "GET",
    cache: "no-store",
  });
}
