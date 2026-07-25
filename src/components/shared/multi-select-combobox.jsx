// src/components/shared/multi-select-combobox.jsx
import React from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

/**
 * items: [{ value: string, label: string }]
 * value: string[]  (array of selected values)
 * onValueChange: (values: string[]) => void
 * showAvatar: render avatar in dropdown list + chips (default false)
 * getImageUrl: (item) => url — used when showAvatar is true
 */
const MultiSelectCombobox = React.memo(function MultiSelectCombobox({
  items,
  value = [],
  onValueChange,
  placeholder = "Select...",
  emptyText = "No results found.",
  disabled,
  className,
  showAvatar = false,
  getImageUrl,
}) {
  const anchor = useComboboxAnchor();

  const selectedItems = React.useMemo(
    () => items.filter((i) => value.includes(String(i.value))),
    [items, value],
  );

  const handleChange = (nextItems) => {
    onValueChange(nextItems.map((i) => String(i.value)));
  };

  const renderAvatar = (item) => (
    <Avatar className="h-4 w-4 shrink-0">
      <AvatarImage src={getImageUrl?.(item)} alt={item.label} />
      <AvatarFallback
        className="text-[8px] font-semibold text-white"
        style={{ backgroundColor: getAvatarColor(item.label) }}
      >
        {initials(item.label)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <Combobox
      items={items}
      itemToStringValue={(item) => item?.label ?? ""}
      multiple
      value={selectedItems}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor} className={cn("w-full min-h-9 text-sm", className)}>
        <ComboboxValue>
          {(values) => (
            <>
              {values.length === 0 && (
                <span className="text-muted-foreground px-1 text-sm">
                  {placeholder}
                </span>
              )}
              {values.map((item) => (
                <ComboboxChip key={item.value} className="gap-1.5">
                  {showAvatar && renderAvatar(item)}
                  {item.label}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput className="flex-1 min-w-[60px]" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item} className="text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {showAvatar && renderAvatar(item)}
                <span className="truncate">{item.label}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
});

export default MultiSelectCombobox;