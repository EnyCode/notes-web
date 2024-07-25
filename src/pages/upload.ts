import type { APIRoute } from "astro"
import {toMarkdown} from 'mdast-util-to-markdown'

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let rtf = await (await request.blob()).text();
  //console.log(rtf);
  parseRtf(rtf);

  return new Response(JSON.stringify({
      message: "This was a POST!"
    })
  )
}

const fontSize = {
  "56": "h1"
}

function parseRtf(file: string) {
  let lines = file.split("\n");
  lines.forEach((line) => {
    //console.log("start :" + line + ": end");
    if (line.startsWith("\\f")) {
      console.log(line);
    }
  })
}