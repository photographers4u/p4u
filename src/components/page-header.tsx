import { cn } from "@/lib/utils";

const PageHeader = ({
  title,
  subtitle,
  className
}: {
  title: string;
  subtitle: string;
  className?: string
}) => {
  return (
    <div className={cn("flex flex-col gap-2 mb-8", className)}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default PageHeader;
