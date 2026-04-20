import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title:   string;
  value:   string | number;
  icon:    LucideIcon;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="border border-brand-hairline bg-brand-paper shadow-none rounded-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <p className="text-[11px] font-medium uppercase tracking-label text-brand-muted">{title}</p>
          <Icon className="h-4 w-4 text-brand-subtle" strokeWidth={1.5} />
        </div>
        <p className="mt-3 text-[32px] font-semibold leading-none tracking-tightish text-brand-ink tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
