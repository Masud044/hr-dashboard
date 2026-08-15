// src/features/ticketing/components/CSATRating.jsx
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRateTicket } from "../queries";

export default function CSATRating({ ticketId }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const rateTicket = useRateTicket();

  const handleSubmit = () => {
    if (!rating) {
      toast.error("Please select a rating.");
      return;
    }
    rateTicket.mutate(
      { ticketId, rating, comment },
      {
        onSuccess: () => toast.success("Thanks for your feedback!"),
        onError: (err) => toast.error(err?.message || "Failed to submit rating."),
      }
    );
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-foreground">How did we do?</h4>
        <p className="text-xs text-muted-foreground">Rate your experience with this ticket.</p>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform active:scale-90"
          >
            <Star
              size={22}
              className={
                n <= (hover || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground"
              }
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Any additional feedback? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="resize-none text-sm"
        rows={2}
      />

      <Button
        onClick={handleSubmit}
        disabled={rateTicket.isPending}
        size="sm"
        className="rounded-full"
      >
        {rateTicket.isPending ? "Submitting..." : "Submit Rating"}
      </Button>
    </div>
  );
}