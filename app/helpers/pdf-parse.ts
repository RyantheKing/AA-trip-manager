import type { TextContent, TextItem } from "pdfjs-dist/types/src/display/api";

export function pdfObjToArray(textContent: TextContent): [string, number, number][] {
    const startIndex = textContent.items.findIndex((item): item is TextItem => "str" in item && item.str === "SEQ");
    const itemArr: TextItem[] =
        startIndex >= 0 ? textContent.items.filter((item): item is TextItem => "str" in item).slice(startIndex) : [];

    const charWidth = itemArr[0].width / itemArr[0].str.length;
    const infoArr: [string, number, number][] = [];

    for (const item of itemArr) {
        const str = item.str.trim();
        if (str === "") {
            continue;
        }
        const x = item.transform[4];
        const y = item.transform[5];

        let offset = 0;
        for (const word of str.split(/\s+/)) {
            if (word === "") {
                continue;
            }
            infoArr.push([word, x + offset, y]);
            offset += (word.length + 1) * charWidth;
        }
    }
    return infoArr;
}

