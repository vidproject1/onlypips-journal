import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import ExportDataButton from './ExportDataButton';
import { Button } from '@/components/ui/button';

interface MigrationBannerProps {
  userId: string;
}

const MigrationBanner: React.FC<MigrationBannerProps> = ({ userId }) => {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isPinnedOpen || isHovered;

  return (
    <section className="container mt-6">
      <div
        className="rounded-3xl border border-border/50 bg-gradient-to-r from-muted/80 via-background to-muted/60 px-4 py-3 text-foreground shadow-sm transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                <AlertTriangle className="h-4 w-4" />
                Migration Notice
              </div>
              <p className="text-sm text-foreground/90">
                Backend migration on <strong>April 5, 2026</strong>. Export your V1 data before cutover.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsPinnedOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-expanded={isExpanded}
              >
                <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/migration-guide">Learn more</Link>
              </Button>

              <ExportDataButton userId={userId} />
            </div>
          </div>

          {isExpanded && (
            <div className="grid gap-2 border-t border-border/40 pt-3 text-sm text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-start">
              <div className="space-y-2">
                <p className="leading-6 text-foreground/90">
                  OnlyPips Journal will move to a new backend after a one-week migration window. Please export your data now so we can help you restore your journal in the new version.
                </p>
                <p className="leading-6">
                  We are sorry, but V1 screenshots, uploaded pictures, and other stored image files will not be recovered during this migration.
                </p>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Clock3 className="h-4 w-4" />
                  Contact <strong>onlypips8@gmail.com</strong> for support.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MigrationBanner;
