'use client'
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useState } from "react"
import { generatePromQL } from "@/lib/utils"
import { IconSparkles2 } from "@tabler/icons-react"

const placeholders = [
    "Check CPU usage,",
    "View available memory size",
    "Monitor network traffic (outgoing)",
    "Check disk I/O",
    "Monitor network traffic (incoming)",
];

export function PromAISearch({
    handleChange = (e) => {
        setUserPrompt(e.target.value);
    },
    onSubmit = (e) => {
        e.preventDefault();
        generatePromQL(userPrompt).then((res) => {
            console.log(res);
        });
    },
}) {
    const [userPrompt, setUserPrompt] = useState("");
    return (
        <div className="px-5 flex items-center gap-2">
            <IconSparkles2 className="size-6 text-[#FE8FB5]" />
            <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
            />
        </div>
    )
}