import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(JSON.stringify({ message: `Hello user ${userId}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
