import clsx from "clsx";
import { Link } from "react-router-dom";
import { localizePath } from "../../../i18n/routing";

type LogoProps = {
  className?: string;
  to?: string;
};

export const Logo = ({ className, to = "/" }: LogoProps) => (
  <Link
    to={localizePath(to)}
    className={clsx(
      "group inline-flex items-center text-content",
      className
    )}
    aria-label="AutoQr home"
  >
    <img
      src="/logo.svg"
      alt="AutoQR"
      className="h-9 w-auto max-w-[170px] object-contain sm:h-10 sm:max-w-[190px]"
      loading="eager"
      decoding="async"
    />
  </Link>
);
