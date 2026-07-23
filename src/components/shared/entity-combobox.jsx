// src/components/shared/entity-combobox.jsx

import React from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxClear,
} from "@/components/ui/combobox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "@/lib/avatar-utils";
import { Search } from "lucide-react";
import { InputGroupAddon } from "@/components/ui/input-group";

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
 * size: "sm" | "md" | "lg" — default "sm"
 * showAvatar: render avatar in dropdown list (default false)
 * getImageUrl: (item) => url — required when showAvatar is true
 * avatarInTrigger: also show avatar on the CLOSED/selected trigger
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
  avatarInTrigger = false,
}) {
  const s = SIZE_MAP[size] ?? SIZE_MAP.sm;

  const selectedItem = React.useMemo(
    () => items.find((i) => String(i.value) === String(value)) ?? null,
    [items, value],
  );

  const renderAvatar = (item) => (
    <Avatar className={cn("shrink-0", s.avatar)}>
      <AvatarImage src={getImageUrl?.(item)} alt={item.label} />
      <AvatarFallback
        className={cn("font-semibold text-white", s.avatarText)}
        style={{ backgroundColor: getAvatarColor(item.label) }}
      >
        {initials(item.label)}
      </AvatarFallback>
    </Avatar>
  );

  // ── Default mode: text input is the trigger ──
  if (!showAvatar || !avatarInTrigger) {
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
                  {showAvatar && renderAvatar(item)}
                  <span className="line-clamp-2 leading-snug">
                    {item.label}
                  </span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );
  }

  // ── Avatar-in-trigger mode: custom trigger button, search input moves inside panel ──
  return (
    <Combobox
      items={items}
      itemToStringValue={(item) => item?.label ?? ""}
      value={selectedItem}
      onValueChange={(item) => onValueChange(item?.value ?? "")}
      disabled={disabled}
    >
      <div className="relative inline-block">
  <ComboboxTrigger
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-2 shadow-xs w-[220px]",
      s.trigger,
      !selectedItem && "text-muted-foreground",
      showClear && selectedItem && "pr-8 [&_[data-slot=combobox-trigger-icon]]:hidden",
      className,
    )}
  >
    <span className="flex items-center gap-2 min-w-0 flex-1">
      {selectedItem ? (
        <>
          {renderAvatar(selectedItem)}
          <span className="truncate leading-none">{selectedItem.label}</span>
        </>
      ) : (
        <span className="truncate">{placeholder}</span>
      )}
    </span>
  </ComboboxTrigger>

  {showClear && selectedItem && !disabled && (
    <ComboboxClear
      className="absolute right-2 top-1/2 -translate-y-1/2"
    />
  )}
</div>

      <ComboboxContent className="w-[260px] p-0">
        {/* <ComboboxInput placeholder="Search..." className="m-1 text-xs" showTrigger={false} /> */}
        <ComboboxInput
          placeholder="Search..."
          className="m-1 text-xs"
          showTrigger={false}
        >
          <InputGroupAddon align="inline-start">
            <Search className="size-3.5 text-muted-foreground" />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item} className={s.item}>
              <div className="flex items-center gap-2 min-w-0">
                {renderAvatar(item)}
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
