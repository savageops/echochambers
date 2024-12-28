"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { Function } from "../types";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface FunctionsTabProps {
    functions?: Function[];
    onFunctionsChange?: (functions: Function[]) => void;
}

const defaultFunction: Function = {
    name: "",
    description: "",
    parameters: "",
};

export function FunctionsTab({ 
    functions: externalFunctions = [], 
    onFunctionsChange 
}: FunctionsTabProps) {
    const [functions, setFunctions] = useLocalStorage("echochambers_functions", externalFunctions);

    const handleFunctionChange = (index: number, updates: Partial<Function>) => {
        const newFunctions = [...functions];
        newFunctions[index] = { 
            ...defaultFunction,
            ...newFunctions[index], 
            ...updates 
        };
        setFunctions(newFunctions);
        onFunctionsChange?.(newFunctions);
    };

    const handleAddFunction = () => {
        const newFunctions = [
            ...functions,
            {
                ...defaultFunction,
                name: `Function ${functions.length + 1}`,
            },
        ];
        setFunctions(newFunctions);
        onFunctionsChange?.(newFunctions);
    };

    const handleRemoveFunction = (index: number) => {
        const newFunctions = functions.filter((_, i) => i !== index);
        setFunctions(newFunctions);
        onFunctionsChange?.(newFunctions);
    };

    return (
        <TabsContent value="functions" className="mt-0 h-[400px]">
            <div className="h-full space-y-4">
                <ScrollArea className="h-[87%] rounded-md px-3">
                    <div className="space-y-4">
                        {functions.map((func, index) => (
                            <div key={index} className="space-y-2 p-4 rounded-lg border bg-background/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <Input
                                            value={func.name || ""}
                                            onChange={(e) => handleFunctionChange(index, { name: e.target.value })}
                                            placeholder="Function Name"
                                            className="max-w-[200px]"
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveFunction(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Description</Label>
                                    <Textarea
                                        value={func.description || ""}
                                        onChange={(e) => handleFunctionChange(index, { description: e.target.value })}
                                        placeholder="Describe what this function does..."
                                        className="min-h-[60px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm">Parameters</Label>
                                    <Textarea
                                        value={func.parameters || ""}
                                        onChange={(e) => handleFunctionChange(index, { parameters: e.target.value })}
                                        placeholder="Define function parameters in JSON format..."
                                        className="min-h-[100px] font-mono text-sm"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <Button variant="outline" onClick={handleAddFunction} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Function
                </Button>
            </div>
        </TabsContent>
    );
}
