interface DashboardHeaderProps {
  heading: string;
  text?: string;
}

export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-bold text-3xl md:text-4xl">
          {heading}
        </h1>
        {text && <p className="text-lg text-gray-400">{text}</p>}
      </div>
    </div>
  );
}
