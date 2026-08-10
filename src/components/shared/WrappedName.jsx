// src/components/shared/WrappedName.jsx
import React, { useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarColor, getInitials } from "@/lib/avatar-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIZE_STYLES = {
  sm: {
    text: "text-xs",
    avatar: "h-6 w-6 text-[9px]",
    icon: 12,
  },
  md: {
    text: "text-sm",
    avatar: "h-8 w-8 text-xs",
    icon: 14,
  },
  lg: {
    text: "text-base",
    avatar: "h-10 w-10 text-sm",
    icon: 16,
  },
};

// ── Default character budget per size before truncation kicks in.
// Character-count based (not pixel-measured) so it's deterministic and
// needs no ref/DOM measurement — cheap and SSR-safe.
const DEFAULT_CHAR_LIMITS = { sm: 40, md: 60, lg: 80 };

function truncateToLimit(str, limit) {
  if (str.length <= limit) return str;
  const cut = str.slice(0, limit);
  // Snap back to the last full word boundary instead of cutting mid-word
  // (e.g. don't leave a dangling "21" from "2151").
  const lastSpace = cut.lastIndexOf(" ");
  if (lastSpace > 0) {
    return cut.slice(0, lastSpace).trimEnd();
  }
  return cut.trimEnd();
}

/**
 * Splits text into at most two lines, balancing word count so the
 * first line gets the extra word when the total is odd.
 * e.g. 10 words -> 5 / 5, 11 words -> 6 / 5.
 */
function splitBalanced(text) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return [words[0] || "", ""];
  }
  const firstLineCount = Math.ceil(words.length / 2);
  const line1 = words.slice(0, firstLineCount).join(" ");
  const line2 = words.slice(firstLineCount).join(" ");
  return [line1, line2];
}

/**
 * WrappedName — shared name display used anywhere a project, contractor,
 * or worker name needs to render consistently.
 *
 * Truncation is character-limit based (via `maxChars`, or a sensible
 * default per `size`). If the name fits within the limit, it renders
 * in full with NO tooltip at all. If it exceeds the limit, the text is
 * cut to the limit and a small "..." icon is appended — only that icon
 * is the tooltip trigger, showing the full name on hover.
 *
 * Two line modes:
 *   maxLines={2} (default) — word-balanced split across at most two
 *     lines. Use for narrow columns (table cells).
 *   maxLines={1} — single line. Use where there's horizontal room to
 *     spare (e.g. a card header).
 *
 * Usage:
 *   <WrappedName name={r.P_NAME} />
 *   <WrappedName name={group.contractorName} size="md" showAvatar maxLines={1} />
 */
export default function WrappedName({
  name,
  size = "sm",
  showAvatar = false,
  maxLines = 2,
  maxChars,
  className,
}) {
  const sizes = SIZE_STYLES[size] || SIZE_STYLES.sm;
  const isSingleLine = maxLines === 1;
  const charLimit = maxChars ?? DEFAULT_CHAR_LIMITS[size] ?? DEFAULT_CHAR_LIMITS.sm;

  const { displayText, isTruncated } = useMemo(() => {
    const full = (name || "").trim();
    const truncated = full.length > charLimit;
    return {
      displayText: truncated ? truncateToLimit(full, charLimit) : full,
      isTruncated: truncated,
    };
  }, [name, charLimit]);

  const [line1, line2] = useMemo(
    () => splitBalanced(displayText),
    [displayText],
  );

  if (!name) {
    return <span className="text-muted-foreground italic">—</span>;
  }

  const moreIcon = isTruncated && (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground transition-colors align-middle"
            aria-label="Show full name"
          >
            <MoreHorizontal size={sizes.icon} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] break-words">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const textBlock = (
    <span
      className={cn(
        "min-w-0 font-medium text-foreground leading-snug",
        sizes.text,
        className,
      )}
    >
      {isSingleLine ? (
        <span className="inline-flex items-center gap-1">
          <span className="break-words">{displayText}</span>
          {moreIcon}
        </span>
      ) : (
        <>
          <span className="block break-words">{line1}</span>
          {line2 && (
            <span className="inline-flex items-center gap-1">
              <span className="break-words">{line2}</span>
              {moreIcon}
            </span>
          )}
          {!line2 && moreIcon}
        </>
      )}
    </span>
  );

  if (!showAvatar) {
    return textBlock;
  }

  return (
    <div className={cn("flex gap-2 min-w-0", isSingleLine ? "items-center" : "items-start")}>
      <span
        className={cn(
          "flex items-center justify-center rounded-full font-semibold text-white shrink-0",
          sizes.avatar,
        )}
        style={{ backgroundColor: getAvatarColor(name) }}
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
      <div className="min-w-0 flex-1">{textBlock}</div>
    </div>
  );
}