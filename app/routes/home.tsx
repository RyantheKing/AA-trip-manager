import PdfUpload from "~/upload/upload";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Trip Calculator PWA" },
        { name: "description", content: "Offline Web App for flight schedule analysis" },
    ];
}

export default function Home() {
    return <PdfUpload />;
}
