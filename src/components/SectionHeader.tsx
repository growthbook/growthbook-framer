export function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="gb-section-header">
      {icon}
      <h2 className="gb-section-header-title">{title}</h2>
    </div>
  );
}
