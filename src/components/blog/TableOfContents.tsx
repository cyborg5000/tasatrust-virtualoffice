import { cn } from "@/lib/utils";
import type { HeadingItem } from "@/lib/blog-content";

type TableOfContentsProps = {
  headings: HeadingItem[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  return (
    <aside className="surface-panel h-fit self-start border-white/70 bg-white/85 p-5 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Table of Contents
      </p>

      {headings.length > 0 ? (
        <nav aria-label="Table of contents" className="mt-4">
          <ul className="space-y-3">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "block text-sm leading-6 text-muted-foreground transition-colors hover:text-secondary",
                    heading.level === 3 && "pl-4",
                    heading.level === 4 && "pl-8",
                  )}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          This article does not include enough section headings for a table of contents.
        </p>
      )}
    </aside>
  );
}
