import type { ReactNode } from "react";
import MobileNav from "./MobileNav";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <>
      <MobileNav />
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-hospital-muted">{description}</p>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </>
  );
}
