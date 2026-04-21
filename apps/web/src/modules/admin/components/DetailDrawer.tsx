import { PropsWithChildren } from "react";
import { Drawer } from "../../../components/ui";

interface DetailDrawerProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  title: string;
}

export const DetailDrawer = ({ open, onClose, title, children }: DetailDrawerProps) => <Drawer open={open} onClose={onClose} title={title}>{children}</Drawer>;
