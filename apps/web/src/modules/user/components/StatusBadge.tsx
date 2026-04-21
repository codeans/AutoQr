import { Badge } from "../../../components/ui";
import { prettifyStatus, statusTone } from "../utils/user.helpers";

export const StatusBadge = ({ status }: { status?: string }) => <Badge label={prettifyStatus(status)} tone={statusTone(status)} />;
