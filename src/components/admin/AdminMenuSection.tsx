import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface MenuItem {
    label: string;
    enabled: boolean;
    onClick?: () => void;
}

interface AdminMenuSectionProps {
    title: string;
    items: MenuItem[];
}

export const AdminMenuSection = ({ title, items }: AdminMenuSectionProps) => (
    <Card className="mb-6 p-6">
        <h3 className="text-lg font-bold mb-4 text-[#1d3654]">{title}</h3>
        <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
                <Button
                    key={item.label}
                    variant={item.enabled ? "default" : "outline"}
                    disabled={!item.enabled}
                    onClick={item.onClick}
                    className="justify-start"
                >
                    {item.label}
                </Button>
            ))}
        </div>
    </Card>
);
