import { LoadingState as BaseLoadingState } from "../../../components/ui";

export const LoadingState = ({ rows = 6 }: { rows?: number }) => <BaseLoadingState rows={rows} />;
