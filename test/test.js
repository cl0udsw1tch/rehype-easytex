import { unified } from 'unified';
import rehypeTex$ from "../dist/index.js"
import rehypeParse from 'rehype-parse'
import rehypeDocument from "rehype-document";
import rehypeKatex from "rehype-katex";
import rehypeStringify from 'rehype-stringify'
import { read, write } from "to-vfile"
import path from "node:path"


const file = await unified()
    .use(rehypeParse, {
        fragment: true
    })
    .use(rehypeTex$)
    .use(rehypeKatex)
    .use(rehypeDocument, {
        css: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
    })
    .use(rehypeStringify)
    .process(await read(path.join(process.cwd(), "test", "input.html")))

file.path = path.join(process.cwd(), "test", "output.html")
await write(file)
