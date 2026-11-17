import React, { type ReactNode } from "react";

interface CatalogStateProps {
  children: ReactNode;
  error?: Error | null;
  isEmpty?: boolean;
  isLoading?: boolean;
  onRetry?: () => void;
}

const CatalogState = ({
  children,
  error,
  isEmpty = false,
  isLoading = false,
  onRetry,
}: CatalogStateProps) => {
  if (isLoading) {
    return <p className="not-found-title" role="status">Loading…</p>;
  }

  if (error) {
    return (
      <div role="alert">
        <p className="not-found-title">Catalog unavailable</p>
        {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
      </div>
    );
  }

  if (isEmpty) {
    return <p className="not-found-title">No content available</p>;
  }

  return <>{children}</>;
};

export default CatalogState;
