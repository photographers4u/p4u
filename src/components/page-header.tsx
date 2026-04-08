const PageHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default PageHeader;
