import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton({ label = "Voltar" }) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => window.history.back()}
      className="bg-white text-[#008140] hover:bg-gray-100 font-semibold"
    >
      <ArrowLeft />
      {label}
    </Button>
  );
}