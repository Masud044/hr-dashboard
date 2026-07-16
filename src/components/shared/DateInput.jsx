// src\components\shared\DateInput.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const DateInput = React.memo(function DateInput({ value, onChange }) {
  const dayRef   = useRef(null);
  const monthRef = useRef(null);
  const yearRef  = useRef(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const initial = useMemo(() => {
    if (!value) return { d: "", m: "", y: "" };
    const dt = parse(value, "yyyy-MM-dd", new Date());
    if (!isValid(dt)) return { d: "", m: "", y: "" };
    return { d: format(dt, "dd"), m: format(dt, "MM"), y: format(dt, "yyyy") };
  }, [value]);

  const [d, setD] = useState(initial.d);
  const [m, setM] = useState(initial.m);
  const [y, setY] = useState(initial.y);

  useEffect(() => { setD(initial.d); setM(initial.m); setY(initial.y); }, [initial.d, initial.m, initial.y]);

  const emit = (dd, mm, yy) => {
    if (dd.length === 2 && mm.length === 2 && yy.length === 4) {
      const parsed = parse(`${dd}/${mm}/${yy}`, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) { onChange(format(parsed, "yyyy-MM-dd")); return; }
    }
    onChange("");
  };

  const handleD = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setD(v); emit(v, m, y);
    if (v.length === 2) monthRef.current?.focus();
  };
  const handleM = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    setM(v); emit(d, v, y);
    if (v.length === 2) yearRef.current?.focus();
  };
  const handleY = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
    setY(v); emit(d, m, v);
  };

  const handleCalendarSelect = (date) => {
    if (!date) return;
    const dd = format(date, "dd");
    const mm = format(date, "MM");
    const yy = format(date, "yyyy");
    setD(dd); setM(mm); setY(yy);
    onChange(format(date, "yyyy-MM-dd"));
    setCalendarOpen(false);
  };

  const selectedDate = useMemo(() => {
    if (!(d.length === 2 && m.length === 2 && y.length === 4)) return undefined;
    const parsed = parse(`${d}/${m}/${y}`, "dd/MM/yyyy", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [d, m, y]);

  return (
    <div className="flex items-center gap-1 h-8 px-2 rounded-md border border-input bg-card focus-within:ring-1 focus-within:ring-ring">
  <input ref={dayRef} value={d} onChange={handleD} placeholder="dd" maxLength={2}
    inputMode="numeric" className="w-5 text-xs outline-none ring-0 text-center bg-transparent text-foreground" />
  <span className="text-muted-foreground text-xs">/</span>
  <input ref={monthRef} value={m} onChange={handleM} placeholder="mm" maxLength={2}
    inputMode="numeric" className="w-5 text-xs outline-none ring-0 text-center bg-transparent text-foreground" />
  <span className="text-muted-foreground text-xs">/</span>
  <input ref={yearRef} value={y} onChange={handleY} placeholder="yyyy" maxLength={4}
    inputMode="numeric" className="w-9 text-xs outline-none ring-0 text-center bg-transparent text-foreground" />
  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
    <PopoverTrigger asChild>
      <button type="button" className="ml-auto shrink-0" aria-label="Open calendar">
        <CalendarIcon size={13} className="text-muted-foreground hover:text-primary" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="end">
      <Calendar mode="single" selected={selectedDate} onSelect={handleCalendarSelect} initialFocus />
    </PopoverContent>
  </Popover>
</div>
  );
});

export default DateInput;