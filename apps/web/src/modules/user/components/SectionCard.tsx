import { SectionCard as BaseSectionCard } from "../../../components/ui";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const SectionCard = ({ title, subtitle, actions, className, children }: SectionCardProps) => (
  <BaseSectionCard title={title} subtitle={subtitle} actions={actions} className={className}>
    {children}
  </BaseSectionCard>
);
