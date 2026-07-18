import { Fragment } from "react";
import { Link } from "@/i18n/navigation";

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; label: string; href: string };

const INLINE_PATTERN = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: "bold", value: match[1] });
    } else if (match[2] !== undefined && match[3] !== undefined) {
      tokens.push({ type: "link", label: match[2], href: match[3] });
    }
    lastIndex = INLINE_PATTERN.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }
  return tokens;
}

function renderInline(
  text: string,
  keyPrefix: string,
  onNavigate?: () => void,
) {
  return tokenizeInline(text).map((token, i) => {
    const key = `${keyPrefix}-${i}`;
    if (token.type === "bold") {
      return <strong key={key}>{token.value}</strong>;
    }
    if (token.type === "link") {
      if (token.href.startsWith("/")) {
        return (
          <Link
            key={key}
            href={token.href}
            onClick={onNavigate}
            className="underline underline-offset-2 hover:text-sun"
          >
            {token.label}
          </Link>
        );
      }
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          className="underline underline-offset-2 hover:text-sun"
        >
          {token.label}
        </a>
      );
    }
    return <Fragment key={key}>{token.value}</Fragment>;
  });
}

/**
 * Minimal markdown renderer for chat messages: paragraphs, bold, links,
 * and bullet/numbered lists. No external dependency.
 */
export function ChatMarkdown({
  text,
  onNavigate,
}: {
  text: string;
  onNavigate?: () => void;
}) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim().length > 0);

  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const isBulleted = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));
        const isOrdered = lines.length > 0 && lines.every((l) => /^\s*\d+\.\s+/.test(l));

        if (isBulleted || isOrdered) {
          const ListTag = isOrdered ? "ol" : "ul";
          return (
            <ListTag
              key={bi}
              className={
                isOrdered ? "list-decimal space-y-1 pl-4" : "list-disc space-y-1 pl-4"
              }
            >
              {lines.map((line, li) => {
                const content = line.replace(/^\s*(?:[-*]|\d+\.)\s+/, "");
                return (
                  <li key={li}>{renderInline(content, `${bi}-${li}`, onNavigate)}</li>
                );
              })}
            </ListTag>
          );
        }

        return (
          <p key={bi}>
            {lines.map((line, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line, `${bi}-${li}`, onNavigate)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
