import React from "react";
import Button from "../ui/Button.jsx";

/**
 * ErrorState
 * - Unified error UI for pages and cards
 * - Optional Retry action
 */
export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn’t load this content. Please try again.",
  onRetry,
  compact = false
}) {
  return (
    <div className={`errorState ${compact ? "errorState--compact" : ""}`}>
      <div className="errorState__icon" aria-hidden>⚠️</div>
      <div className="errorState__content">
        <div className="errorState__title">{title}</div>
        <div className="errorState__message">{message}</div>

        {onRetry ? (
          <div className="errorState__actions">
            <Button variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
