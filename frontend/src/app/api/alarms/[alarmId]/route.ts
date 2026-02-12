import { proxyToBackend } from "@/lib/bff";

type RouteContext = {
  params: {
    alarmId: string;
  };
};

export async function DELETE(req: Request, ctx: RouteContext) {
  const alarmId = encodeURIComponent(ctx.params.alarmId);
  return proxyToBackend(req, `/api/v1/alarms/${alarmId}`, {
    method: "DELETE",
    forwardQuery: false,
    cache: "no-store",
  });
}
