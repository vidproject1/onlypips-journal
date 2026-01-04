import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  strategy_name: z.string().min(2, "Strategy name must be at least 2 characters"),
  win_rate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, {
    message: "Win rate must be a number between 0 and 100",
  }),
  risk_reward_ratio: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Risk/Reward must be a positive number",
  }),
  consistency_score: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10, {
    message: "Score must be between 0 and 10",
  }),
  total_trades: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Total trades must be a positive number",
  }),
  notes: z.string().optional(),
  date_tested: z.string().min(1, "Date is required"),
});

const BacktestForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strategy_name: "",
      win_rate: "",
      risk_reward_ratio: "",
      consistency_score: "",
      total_trades: "",
      notes: "",
      date_tested: new Date().toISOString().split("T")[0],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabase.from("backtest_results").insert({
        strategy_name: values.strategy_name,
        win_rate: Number(values.win_rate),
        risk_reward_ratio: Number(values.risk_reward_ratio),
        consistency_score: Number(values.consistency_score),
        total_trades: Number(values.total_trades),
        notes: values.notes,
        date_tested: values.date_tested,
      });

      if (error) throw error;

      toast.success("Backtest result added successfully");
      form.reset();
    } catch (error) {
      console.error("Error adding backtest:", error);
      toast.error("Failed to add backtest result");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="strategy_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Strategy Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. MA Crossover" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="win_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Win Rate (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="55.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="risk_reward_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risk/Reward Ratio</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="1.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consistency_score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consistency Score (0-10)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="8.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="total_trades"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Trades Tested</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date_tested"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Tested</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional details about the strategy performance..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Save Result
        </Button>
      </form>
    </Form>
  );
};

export default BacktestForm;
