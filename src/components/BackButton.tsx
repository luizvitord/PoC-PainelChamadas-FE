import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton({ label = "Voltar" }) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={() => window.history.back()}
      className="bg-[#008140] text-white hover:bg-[#005a2b] font-semibold shadow-md hover:shadow-lg transition-all"
    >
      <ArrowLeft />
      {label}
    </Button>
  );
}