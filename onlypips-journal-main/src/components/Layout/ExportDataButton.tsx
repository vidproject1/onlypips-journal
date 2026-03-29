import React, { useState } from 'react';
import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PAGE_SIZE = 1000;
const PROJECT_REF = 'ewzsiiclccdhszlbqzex';
const client = supabase as any;

type TableName =
  | 'account_info'
  | 'accounts'
  | 'api_audit_logs'
  | 'growth_plans'
  | 'payment_submissions'
  | 'predictions'
  | 'strategies'
  | 'trade_info'
  | 'trades'
  | 'tradesim_simulations'
  | 'user_notifications'
  | 'user_purchases'
  | 'users';

interface ExportDataButtonProps {
  userId: string;
  className?: string;
  mobile?: boolean;
}

interface StorageFileReference {
  bucket: string;
  publicUrl: string;
  path: string | null;
}

const USER_TABLES: TableName[] = [
  'users',
  'accounts',
  'trades',
  'growth_plans',
  'strategies',
  'payment_submissions',
  'user_purchases',
  'predictions',
  'user_notifications',
  'tradesim_simulations',
  'account_info',
  'trade_info',
  'api_audit_logs',
];

const fetchAllRows = async (table: string, column: string, value: string) => {
  const rows: unknown[] = [];
  let page = 0;

  while (true) {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await client
      .from(table)
      .select('*')
      .eq(column, value)
      .range(from, to);

    if (error) {
      throw error;
    }

    const batch = data ?? [];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    page += 1;
  }

  return rows;
};

const fetchLinkedRows = async (table: string, column: string, values: string[]) => {
  if (values.length === 0) {
    return [];
  }

  const uniqueValues = Array.from(new Set(values.filter(Boolean)));
  const { data, error } = await client.from(table).select('*').in(column, uniqueValues);

  if (error) {
    throw error;
  }

  return data ?? [];
};

const inferStoragePath = (bucket: string, publicUrl: string | null | undefined) => {
  if (!publicUrl) {
    return null;
  }

  const prefix = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = publicUrl.indexOf(prefix);

  if (markerIndex === -1) {
    return null;
  }

  return decodeURIComponent(publicUrl.slice(markerIndex + prefix.length));
};

const sanitizeFilePart = (value: string | undefined) =>
  (value || 'user').replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();

const ExportDataButton: React.FC<ExportDataButtonProps> = ({ userId, className, mobile = false }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const [{ data: userResponse, error: userError }, { data: sessionResponse, error: sessionError }] =
        await Promise.all([supabase.auth.getUser(), supabase.auth.getSession()]);

      if (userError) {
        throw userError;
      }

      if (sessionError) {
        throw sessionError;
      }

      const authUser = userResponse.user;
      const session = sessionResponse.session;

      if (!authUser || !session) {
        throw new Error('Your session expired. Sign in again before exporting.');
      }

      const tableResults = await Promise.allSettled(
        USER_TABLES.map(async (tableName) => {
          const column = tableName === 'users' ? 'id' : 'user_id';

          const rows = await fetchAllRows(tableName, column, userId);
          return { tableName, rows };
        })
      );

      const exportedTables: Record<string, unknown[]> = {};
      const warnings: string[] = [];

      for (const result of tableResults) {
        if (result.status === 'fulfilled') {
          exportedTables[result.value.tableName] = result.value.rows;
        } else {
          const message = result.reason instanceof Error ? result.reason.message : String(result.reason);
          warnings.push(message);
        }
      }

      const strategies = (exportedTables.strategies ?? []) as Array<{ id: string }>;
      const growthPlans = (exportedTables.growth_plans ?? []) as Array<{ id: string }>;
      const userNotifications = (exportedTables.user_notifications ?? []) as Array<{ notification_id: string }>;
      const userPurchases = (exportedTables.user_purchases ?? []) as Array<{ marketplace_checklist_id: string }>;
      const paymentSubmissions = (exportedTables.payment_submissions ?? []) as Array<{ marketplace_checklist_id: string }>;
      const trades = (exportedTables.trades ?? []) as Array<{ screenshot_url: string | null }>;
      const proofRows = (exportedTables.payment_submissions ?? []) as Array<{ proof_file_url: string | null }>;

      const [
        strategyChecklistItemsResult,
        growthPlanTradesResult,
        notificationsResult,
        marketplaceChecklistsResult,
        strategyInstructionsResult,
      ] = await Promise.allSettled([
        fetchLinkedRows('strategy_checklist_items', 'strategy_id', strategies.map((strategy) => strategy.id)),
        fetchLinkedRows('growth_plan_trades', 'growth_plan_id', growthPlans.map((plan) => plan.id)),
        fetchLinkedRows(
          'notifications',
          'id',
          userNotifications.map((notification) => notification.notification_id)
        ),
        fetchLinkedRows(
          'marketplace_checklists',
          'id',
          [
            ...userPurchases.map((purchase) => purchase.marketplace_checklist_id),
            ...paymentSubmissions.map((submission) => submission.marketplace_checklist_id),
          ]
        ),
        fetchLinkedRows(
          'strategy_instructions',
          'marketplace_checklist_id',
          [
            ...userPurchases.map((purchase) => purchase.marketplace_checklist_id),
            ...paymentSubmissions.map((submission) => submission.marketplace_checklist_id),
          ]
        ),
      ]);

      if (strategyChecklistItemsResult.status === 'fulfilled') {
        exportedTables.strategy_checklist_items = strategyChecklistItemsResult.value;
      } else {
        warnings.push(
          strategyChecklistItemsResult.reason instanceof Error
            ? strategyChecklistItemsResult.reason.message
            : String(strategyChecklistItemsResult.reason)
        );
      }

      if (growthPlanTradesResult.status === 'fulfilled') {
        exportedTables.growth_plan_trades = growthPlanTradesResult.value;
      } else {
        warnings.push(
          growthPlanTradesResult.reason instanceof Error
            ? growthPlanTradesResult.reason.message
            : String(growthPlanTradesResult.reason)
        );
      }

      if (notificationsResult.status === 'fulfilled') {
        exportedTables.notifications = notificationsResult.value;
      } else {
        warnings.push(
          notificationsResult.reason instanceof Error
            ? notificationsResult.reason.message
            : String(notificationsResult.reason)
        );
      }

      if (marketplaceChecklistsResult.status === 'fulfilled') {
        exportedTables.marketplace_checklists = marketplaceChecklistsResult.value;
      } else {
        warnings.push(
          marketplaceChecklistsResult.reason instanceof Error
            ? marketplaceChecklistsResult.reason.message
            : String(marketplaceChecklistsResult.reason)
        );
      }

      if (strategyInstructionsResult.status === 'fulfilled') {
        exportedTables.strategy_instructions = strategyInstructionsResult.value;
      } else {
        warnings.push(
          strategyInstructionsResult.reason instanceof Error
            ? strategyInstructionsResult.reason.message
            : String(strategyInstructionsResult.reason)
        );
      }

      const tradeStorageFiles: StorageFileReference[] = trades
        .map((trade) => trade.screenshot_url)
        .filter((publicUrl): publicUrl is string => Boolean(publicUrl))
        .map((publicUrl) => ({
          bucket: 'trades',
          publicUrl,
          path: inferStoragePath('trades', publicUrl),
        }));

      const paymentProofFiles: StorageFileReference[] = proofRows
        .map((submission) => submission.proof_file_url)
        .filter((publicUrl): publicUrl is string => Boolean(publicUrl))
        .map((publicUrl) => ({
          bucket: 'payment-proofs',
          publicUrl,
          path: inferStoragePath('payment-proofs', publicUrl),
        }));

      const exportPayload = {
        meta: {
          app: 'OnlyPips Journal',
          exportVersion: 1,
          exportedAt: new Date().toISOString(),
          projectRef: PROJECT_REF,
          userId,
          userEmail: authUser.email ?? null,
        },
        auth: {
          user: {
            id: authUser.id,
            email: authUser.email ?? null,
            phone: authUser.phone ?? null,
            created_at: authUser.created_at ?? null,
            last_sign_in_at: authUser.last_sign_in_at ?? null,
          },
        },
        data: exportedTables,
        storage: {
          trades: tradeStorageFiles,
          paymentProofs: paymentProofFiles,
        },
        warnings,
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: 'application/json',
      });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const emailPart = sanitizeFilePart(authUser.email);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      link.href = objectUrl;
      link.download = `onlypips-export-${emailPart}-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast({
        title: 'Export complete',
        description:
          warnings.length > 0
            ? 'Your export downloaded with some partial-table warnings. Keep the file and review it before migration.'
            : 'Your data export has been downloaded as JSON.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export your data.';

      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={mobile ? 'ghost' : 'outline'}
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      <Download className="h-4 w-4" />
      <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
    </Button>
  );
};

export default ExportDataButton;
