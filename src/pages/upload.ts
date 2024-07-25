import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request }) => {
  console.log(request.body);
  return new Response(JSON.stringify({
      message: "This was a POST!"
    })
  )
}