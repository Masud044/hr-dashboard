// src/components/shared/entity-combobox.jsx
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "@/lib/avatar-utils";

function initials(label = "") {
  return label
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const SIZE_MAP = {
  sm: {
    trigger: "h-8 text-[12px]",
    item: "text-xs",
    avatar: "h-5 w-5",
    avatarText: "text-[9px]",
  },
  md: {
    trigger: "h-9 text-sm",
    item: "text-sm",
    avatar: "h-6 w-6",
    avatarText: "text-[10px]",
  },
  lg: {
    trigger: "h-10 text-sm",
    item: "text-sm",
    avatar: "h-8 w-8",
    avatarText: "text-xs",
  },
};

/**
 * items: [{ value: string, label: string }]
 * size: "sm" | "md" | "lg" — default "sm" (dense/table use)
 * showAvatar: turn on avatar rendering (default false)
 * getImageUrl: (item) => url — required when showAvatar is true
 */
const EntityCombobox = React.memo(function EntityCombobox({
  items,
  value,
  onValueChange,
  placeholder = "Select...",
  emptyText = "No results found.",
  disabled,
  className,
  showClear = true,
  showAvatar = false,
  getImageUrl,
  size = "sm",
}) {
  const s = SIZE_MAP[size] ?? SIZE_MAP.sm;

  const selectedItem = React.useMemo(
    () => items.find((i) => String(i.value) === String(value)) ?? null,
    [items, value],
  );

  return (
    <Combobox
      items={items}
      itemToStringValue={(item) => item?.label ?? ""}
      value={selectedItem}
      onValueChange={(item) => onValueChange(item?.value ?? "")}
      disabled={disabled}
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear={showClear}
        className={cn("w-[220px]", s.trigger, className)}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item} className={s.item}>
              <div className="flex items-center gap-2 min-w-0">
                {showAvatar && (
                  <Avatar className={cn("shrink-0", s.avatar)}>
                    <AvatarImage src={getImageUrl?.(item)} alt={item.label} />
                    <AvatarFallback
                      className={cn("font-semibold text-white", s.avatarText)}
                      style={{ backgroundColor: getAvatarColor(item.label) }}
                    >
                      {initials(item.label)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="line-clamp-2 leading-snug">{item.label}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
});

export default EntityCombobox;