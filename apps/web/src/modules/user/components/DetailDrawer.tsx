import { Drawer } from "../../../components/ui";

type DetailDrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export const DetailDrawer = ({ open, title, onClose, children }: DetailDrawerProps) => (
  <Drawer open={open} title={title} onClose={onClose}>
    {children}
  </Drawer>
);
