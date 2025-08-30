import type { ChangeEvent } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { pdfObjToArray } from "~/helpers/pdf-parse";
import { processInfo } from "~/helpers/trip-processor";
import "pdfjs-dist/webpack";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

function PdfUpload() {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const target = e.target;
        if (!(target instanceof HTMLInputElement)) return;

        const file = target.files && target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Please select a PDF file.");
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async function () {
            if (this.result instanceof ArrayBuffer) {
                const typedArray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                // get metadata
                interface PdfInfo {
                    CreationDate?: string;
                    ModDate?: string;
                }
                const info = (await pdf.getMetadata()).info as PdfInfo;
                const date = info.CreationDate?.slice(2, 8) ?? info.ModDate?.slice(2, 8) ?? null;

                const page = await pdf.getPage(1);
                const textContent = await page.getTextContent();
                const infoArr = pdfObjToArray(textContent);

                const trip = processInfo(
                    infoArr,
                    (textContent.items[0] as TextItem).width / (textContent.items[0] as TextItem).str.length,
                );
                if (trip === -1) {
                    return;
                }
                if (date === null) {
                    return;
                }
                trip._id = `${date}${trip.dutyPeriods[0].flights[0][0].DT}-${trip.SEQ}`;
                console.log(trip);
            }
        };
        fileReader.readAsArrayBuffer(file);
    };

    return <input type="file" accept="application/pdf" id="fileInput" onChange={handleFileChange} />;
}

export default PdfUpload;
