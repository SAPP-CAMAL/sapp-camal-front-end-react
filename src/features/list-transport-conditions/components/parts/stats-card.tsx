import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ColorVariant = "default" | "green" | "blue" | "red" | "orange" | "purple";

interface Props {
  title: string;
  value: number | string;
  description?: string;
  color?: ColorVariant; // Cambia el color del número
}

const colorMap: Record<ColorVariant, string> = {
  default: "text-foreground",
  green: "text-green-500",
  blue: "text-blue-600",
  red: "text-red-600",
  orange: "text-emerald-600",
  purple: "text-purple-600",
};

export function StatsCard({ title, value, description, color = "default" }: Props) {
  const valueClass = colorMap[color] ?? colorMap.default;
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`text-3xl font-semibold ${valueClass}`}>{value}</CardTitle>
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      {description ? (
        <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
      ) : null}
    </Card>
  );
}
