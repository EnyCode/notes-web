import type { APIRoute } from "astro"
import type { Root } from "mdast";
import {toMarkdown} from 'mdast-util-to-markdown'

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let rtf = await (await request.blob()).text();
  //console.log(rtf);
  let md = parseRtf(rtf);
  console.log(toMarkdown(md));

  return new Response(JSON.stringify({
      message: "This was a POST!"
    })
  )
}

const fontMap: { [key: string]: number } = {
  "56": 1,
  "44": 2,
  "34": 3,
  "24": 0,
}

const content = /(\\f[^]+?) (?:\\\n)?((?:[^\\]+|\\\n)+)/g;
//(\\f[^]+?)(?:\\pard|(?!\\pard)(?:\\f))
const fontSize = /\\fs(.+?) /;
const appleGarbage = /\\AppleTypeServices(?:.+? )/g;

function parseRtf(file: string) {
  let better = file.replaceAll(appleGarbage, "");
  console.log(file.match(appleGarbage));
  let lines = better.split(/(\\f[^]+?)(?:\\pard|})/);
  console.log(better);
  console.log("-".repeat(50));
  let md: Root = {
    type: 'root',
    children: []
  };
  lines.forEach((line) => {
    if (line.startsWith("\\f") && !line.endsWith(";")) {
      console.log("start :" + line + ": end");
      let reg = [...line.matchAll(content)];

      let children = [];

      reg.forEach((r) => {
        if (!r) {
          return;
        }
        let tags = r[1].split("\\");
        console.log(tags); 

        console.log(":" + r[2] + ":");
        let split = false;
        split = r[2].includes("\\") || r[2].includes("\n");
        let regDone = r[2].replace(/\\/, "").replace(/\\$/, "");
        console.log(":" + regDone + ":");
        let size = fontMap[(r[1].match(fontSize) || ["0", "24"])[1]];

        if (0 < size && size < 4) {
          md.children.push({
            type: 'heading',
            depth: size as 2 | 1 | 3 | 4 | 5 | 6,
            children: [{
              type: 'text',
              value: regDone
            }]
          });
        } else if (size == 0) {
          children.push({
            type: 'text',
            value: regDone
          });
        }
        if (split && children.length > 0) {
          md.children.push({
            type: 'paragraph',
            children: children
          })
        }
        children = [];
      })

      if (children.length > 0) {
        md.children.push({
          type: 'paragraph',
          children: children
        })
      }
    }
  })

  return md;
}