"use client";

import { useWash } from "@/lib/use-wash";

type TextLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function TextLink({ href, children }: TextLinkProps) {
  const wash = useWash();

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="wash wash-text"
      {...wash}
    >
      {children}
    </a>
  );
}
