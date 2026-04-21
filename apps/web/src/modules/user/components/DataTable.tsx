import { DataTable as BaseDataTable } from "../../../components/ui";

type DataTableProps = {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
};

export const DataTable = ({ columns, rows }: DataTableProps) => <BaseDataTable columns={columns} rows={rows} className="rounded-2xl" />;
