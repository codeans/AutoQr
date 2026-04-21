import { ActionMenu as BaseActionMenu } from "../../../components/ui";

type Action = { label: string; onClick: () => void; tone?: "normal" | "danger" };

export const ActionMenu = ({ actions }: { actions: Action[] }) => <BaseActionMenu actions={actions} />;
