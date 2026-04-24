import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

export const Reveal = ({ children, delay = 0, y = 20, className, once = true }: RevealProps) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
};

export const Stagger = ({ children, className, delay = 0, stagger = 0.08 }: StaggerProps) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  className,
  y = 20
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) => (
  <motion.div
    className={className}
    variants={{
      hidden: { opacity: 0, y },
      show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
    }}
  >
    {children}
  </motion.div>
);
