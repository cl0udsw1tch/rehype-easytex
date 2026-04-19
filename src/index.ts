import { unified } from 'unified';
import rehypeParse from 'rehype-parse'
import rehypeDocument from "rehype-document";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeStringify from 'rehype-stringify'
import remarkMath from "remark-math"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { read, write } from "to-vfile"
import type { Node } from 'unist';
import type { VFile } from 'vfile'
import type { Plugin, Processor, Transformer } from 'unified'
import { visit } from 'unist-util-visit'
import type { Root } from 'hast';
import type { Doctype } from 'hast';
import type { ElementContent } from 'hast';

const regexCheck = /^((\s*\$[^\$]+\$\s*)|(\s*\$\$[^\$]+\$\$\s*))*$/
const regexFind = /(?:\s*\$([^\$]+)\$\s*)|(?:\s*\$\$([^\$]+)\$\$\s*)/g
const regexFindTex = /(?:(?<!\\)(?:\$)([^\$]+)(?<!\\)(?:\$))|(?:(?<!\\)(?:\$\$)([^\$]+)(?<!\\)(?:\$\$))/g
const regexSplitText = /(?:(?<!\\)(?:\$)(?:[^\$]+)(?<!\\)(?:\$))|(?:(?<!\\)(?:\$\$)(?:[^\$]+)(?<!\\)(?:\$\$))/g



function rehypeTex$(this: Processor, options?: any): Transformer | void {

    const transformer = (tree: Node, file: VFile): Node | void | Promise<Node | void> => {
        //console.log(JSON.stringify(tree, null, 2))
        visit(tree, 'text', (node, index, parent) => {
            const _input: string = node.value
            //const istexsection: Boolean = regexCheck.test(val)
            const matches = [..._input.matchAll(regexFindTex)]
            //console.log(_input)
            if (matches.length === 0) {
                return
            }

            const nodes: any[] = []
            let prev = 0

            for (const match of matches) {
                //console.log(match)
                const _match = match[0]
                const _index = match.index
                const _len = _match.length
                const [texdisplay, cgrp] = match[1] ? ['inline', match[1]] : ['multiline', match[2]]
                const texcontent = cgrp.trim()
                if (_index !== 0) {
                    const textNode = {
                        type: 'text',
                        value: _input.substring(prev, _index)
                    }
                    nodes.push(textNode)
                }
                const texNode = {
                    type: 'element',
                    tagName: texdisplay === 'inline' ? 'span' : 'div',
                    children: [
                        { type: 'text', 'value': texcontent }
                    ],
                    properties: {
                        className: [texdisplay === 'inline' ? "math-inline" : "math-display"]
                    }
                }
                nodes.push(texNode)
                prev = _index + _len
            }
            if (prev < _input.length) {
                const textNode = {
                    type: 'text',
                    value: _input.substring(prev)
                }
                nodes.push(textNode)
                prev = _input.length
            }
            //console.log('before')
            //console.log(parent.children)
            parent.children.splice(index, 1, ...nodes)
            //console.log('after')
            //console.log(parent.children)
        })
    }

    return transformer
}

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
    .process(await read("./input.html"))

file.basename = "output_html.html"
await write(file)


