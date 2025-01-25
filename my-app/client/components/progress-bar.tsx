import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  value: number
  label: string
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <Progress value={value} className="h-2" />
      <p className="text-sm text-center text-muted-foreground">{label}</p>
    </div>
  )
}

