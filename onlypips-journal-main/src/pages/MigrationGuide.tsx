import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';

const MigrationGuide: React.FC = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <Button asChild variant="ghost" className="w-fit rounded-full px-0 text-muted-foreground hover:bg-transparent">
          <Link to="/accounts">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Migration Guide</p>
          <h1 className="text-3xl font-light tracking-tight text-foreground">How to move your journal to the new backend</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Follow these steps during the migration window so your journal entries can be restored in the new version of OnlyPips Journal.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <section className="rounded-3xl border border-border/50 bg-background p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Download className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Export from V1</h2>
              <p className="text-sm text-muted-foreground">Do this before April 5, 2026.</p>
            </div>
          </div>
          <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>1. Log in to your current OnlyPips Journal account.</li>
            <li>2. Click the `Export Data` button in the top navigation or migration banner.</li>
            <li>3. Wait for the JSON file to download to your device.</li>
            <li>4. Keep that file safe. You will need it when imports open on the new backend.</li>
          </ol>
        </section>

        <section className="rounded-3xl border border-border/50 bg-background p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Upload className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-medium">Import into V2</h2>
              <p className="text-sm text-muted-foreground">This will happen after the new backend goes live.</p>
            </div>
          </div>
          <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>1. Create a new account in the new version of OnlyPips Journal.</li>
            <li>2. Open the migration/import option when it becomes available.</li>
            <li>3. Upload the export file you downloaded from V1.</li>
            <li>4. Wait for the import to finish and review your restored journal data.</li>
          </ol>
        </section>

        <section className="rounded-3xl border border-border/50 bg-muted/40 p-6 text-sm leading-6 text-muted-foreground">
          <p>
            Screenshots, uploaded pictures, and other stored image files from V1 will not be recovered during this migration. We are sorry for that limitation.
          </p>
          <p className="mt-3">
            If you need help, contact <strong className="text-foreground">onlypips8@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default MigrationGuide;
