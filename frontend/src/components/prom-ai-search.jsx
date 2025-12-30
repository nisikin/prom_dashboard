'use client'
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useState } from "react"
import { generatePromQL } from "@/lib/utils"
import { IconSparkles2 } from "@tabler/icons-react"
import { CodeBlock } from "@/components/ui/code-block";
import { LoaderOne } from "@/components/ui/loader";

const placeholders = [
    "Check CPU usage",
    "View available memory size",
    "Monitor network traffic (outgoing)",
    "Check disk I/O",
    "Monitor network traffic (incoming)",
];

export function PromAISearch() {
    const [userPrompt, setUserPrompt] = useState("");
    const [promQL, setPromQL] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setUserPrompt(e.target.value);
    };
    const onSubmit = (e) => {
        setIsLoading(true);
        generatePromQL(userPrompt).then((res) => {
            setPromQL(res);
            setIsLoading(false);
        });
    };

    return (
        <div className="w-full">
            <div className="px-5 flex items-center gap-2">
                <IconSparkles2 className="size-6 text-[#FE8FB5]" />
                <PlaceholdersAndVanishInput
                    placeholders={placeholders}
                    onChange={handleChange}
                    onSubmit={onSubmit}
                />
            </div>
            {isLoading &&
                <div className="w-full flex items-center justify-center py-4">
                    <LoaderOne />
                </div>
            }
            {promQL != "" &&
                <div className="px-5 mx-auto w-full pt-3">
                    <CodeBlock
                        filename="AI advice"
                        language="promql"
                        code={promQL}
                    />
                </div>
            }
        </div>
    )
}