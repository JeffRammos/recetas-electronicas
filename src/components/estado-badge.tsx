import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tono = "success" | "warning" | "destructive" | "muted";

const clasesPorTono: Record<Tono, string> = {
  success: "border-success/30 bg-success/15 text-success",
  warning: "border-warning/30 bg-warning/15 text-warning",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
  muted: "border-transparent bg-muted text-muted-foreground",
};

export function EstadoBadge({
  tono,
  children,
  className,
}: {
  tono: Tono;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(clasesPorTono[tono], className)}>
      {children}
    </Badge>
  );
}
