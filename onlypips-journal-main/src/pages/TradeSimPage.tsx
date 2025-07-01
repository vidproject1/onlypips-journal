import React, { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { v4 as uuidv4 } from 'uuid';

interface TradeSimPageProps {
  userId?: string;
  onLogout?: () => void;
}

const MARKET_MODES = [
  { value: 'normal', label: 'Normal Market' },
  { value: 'aggressive', label: 'Aggressive Market' },
  { value: 'slow', label: 'Slow Day' },
  { value: 'news', label: 'High-Impact News Event' },
];

const UPDATE_SPEEDS = [
  { value: 1000, label: '1 second' },
  { value: 500, label: '0.5 seconds' },
  { value: 2000, label: '2 seconds' },
];

const MARKET_PARAMS = {
  normal: { volatility: 0.5, trend: 0, newsEvents: false },
  aggressive: { volatility: 2.0, trend: 0.1, newsEvents: false },
  slow: { volatility: 0.2, trend: 0, newsEvents: false },
  news: { volatility: 1.5, trend: 0, newsEvents: true },
};

const INITIAL_PRICE = 100.0;

const TradeSimPage: React.FC<TradeSimPageProps> = ({ userId, onLogout }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApi = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [marketMode, setMarketMode] = useState('normal');
  const [updateSpeed, setUpdateSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [candleCount, setCandleCount] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(INITIAL_PRICE);
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [lastCandle, setLastCandle] = useState<CandlestickData | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [candles, setCandles] = useState<CandlestickData[]>([]);
  const lastCloseRef = useRef<number>(INITIAL_PRICE);
  const [trades, setTrades] = useState<{
    id: string;
    type: 'buy' | 'sell';
    price: number;
    timestamp: number;
    candleIndex: number;
    size: number;
  }[]>([]);

  // UI status
  const [marketStatus, setMarketStatus] = useState('Initializing...');
  const [sessionTime, setSessionTime] = useState('00:00');

  // --- State refs for always-up-to-date persistence ---
  const stateRef = useRef({
    candles,
    currentPrice,
    candleCount,
    marketMode,
    updateSpeed,
    isPaused,
  });
  useEffect(() => {
    stateRef.current = {
      candles,
      currentPrice,
      candleCount,
      marketMode,
      updateSpeed,
      isPaused,
    };
  }, [candles, currentPrice, candleCount, marketMode, updateSpeed, isPaused]);

  // --- Chart always syncs with candles ---
  useEffect(() => {
    if (candleSeries.current && candles.length > 0) {
      candleSeries.current.setData(candles);
    }
  }, [candles]);

  // --- Load simulation state from Supabase on mount ---
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) return;
    (async () => {
      console.log('[TradeSim] Fetching simulation state from Supabase...');
      const { data, error } = await supabase
        .from('tradesim_simulations')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) console.error('[TradeSim] Supabase load error:', error);
      if (data) {
        console.log('[TradeSim] Restoring simulation from Supabase...');
        const loadedCandles = (data.candles ? (data.candles as unknown as CandlestickData[]) : []);
        setCandles(loadedCandles);
        setCurrentPrice(Number(data.current_price));
        setCandleCount(Number(data.candle_count));
        setMarketMode(data.market_mode);
        setUpdateSpeed(Number(data.update_speed));
        setIsPaused(Boolean(data.is_paused));
        lastCloseRef.current = Number(data.current_price);
        if (loadedCandles.length > 0) {
          setLastCandle(loadedCandles[loadedCandles.length - 1]);
        }
      } else {
        console.log('[TradeSim] No simulation found, initializing new simulation...');
        const { error: initError } = await supabase.from('tradesim_simulations').upsert({
          user_id: userId,
          candles: [],
          current_price: INITIAL_PRICE,
          candle_count: 0,
          market_mode: 'normal',
          update_speed: 1000,
          is_paused: false,
        }, { onConflict: 'user_id' });
        if (initError) console.error('[TradeSim] Supabase init error:', initError);
        setCandles([]);
        setCurrentPrice(INITIAL_PRICE);
        setCandleCount(0);
        setMarketMode('normal');
        setUpdateSpeed(1000);
        setIsPaused(false);
        lastCloseRef.current = INITIAL_PRICE;
        setLastCandle(null);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [userId]);

  // --- Save simulation state to Supabase (throttled, always latest state) ---
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const saveSimulation = React.useCallback(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      const s = stateRef.current;
      supabase.from('tradesim_simulations').upsert({
        user_id: userId,
        candles: s.candles as unknown as Json,
        current_price: s.currentPrice,
        candle_count: s.candleCount,
        market_mode: s.marketMode,
        update_speed: s.updateSpeed,
        is_paused: s.isPaused,
        last_updated: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .then(({ error }) => {
        if (error) console.error('Supabase save error:', error);
      });
    }, 1000); // Save at most once per second
  }, [userId]);

  // --- Save on every meaningful state change ---
  useEffect(() => {
    if (loading || !userId) return;
    saveSimulation();
  }, [candles, currentPrice, candleCount, marketMode, updateSpeed, isPaused, userId, saveSimulation, loading]);

  // --- Chart setup (initialize once) ---
  useEffect(() => {
    if (loading) return;
    if (!chartRef.current) return;
    chartApi.current = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#131722' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: '#2a2e39',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: '#2a2e39',
        timeVisible: true,
        secondsVisible: false,
      },
    });
    candleSeries.current = chartApi.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartApi.current?.remove();
    };
    // eslint-disable-next-line
    function handleResize() {
      if (chartRef.current && chartApi.current) {
        chartApi.current.applyOptions({
          width: chartRef.current.clientWidth,
          height: 400,
        });
      }
    }
  }, [loading]);

  // Main simulation loop
  useEffect(() => {
    if (loading) return;
    if (intervalId) clearInterval(intervalId);
    if (isPaused) return;
    const id = setInterval(() => {
      generateCandle();
    }, updateSpeed);
    setIntervalId(id);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [updateSpeed, isPaused, marketMode, loading]);

  // Session timer
  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
      const seconds = (elapsed % 60).toString().padStart(2, '0');
      setSessionTime(`${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStart, loading]);

  // Market status
  useEffect(() => {
    if (loading) return;
    if (isPaused) {
      setMarketStatus('PAUSED');
    } else {
      switch (marketMode) {
        case 'normal': setMarketStatus('Normal Market'); break;
        case 'aggressive': setMarketStatus('Aggressive Market'); break;
        case 'slow': setMarketStatus('Slow Day'); break;
        case 'news': setMarketStatus('News Event Mode'); break;
        default: setMarketStatus('');
      }
    }
  }, [marketMode, isPaused, loading]);

  // Candle generator
  function generateCandle() {
    if (loading) return;
    const params = MARKET_PARAMS[marketMode];
    const open = lastCloseRef.current;
    const maxMove = open * params.volatility * (0.005 + Math.random() * 0.015);
    const close = parseFloat((open + (Math.random() - 0.5) * 2 * maxMove + params.trend).toFixed(2));
    const wickRange = Math.abs(close - open) * (0.5 + Math.random());
    const high = parseFloat((Math.max(open, close) + Math.random() * wickRange).toFixed(2));
    const low = parseFloat((Math.min(open, close) - Math.random() * wickRange).toFixed(2));
    const now = Math.floor(Date.now() / 1000);
    const candle: CandlestickData = {
      time: now as Time,
      open: parseFloat(open.toFixed(2)),
      high,
      low,
      close,
    };
    candleSeries.current?.update(candle);
    setLastCandle(candle);
    setCurrentPrice(candle.close);
    setCandleCount((c) => c + 1);
    lastCloseRef.current = close;
    setCandles((prev) => {
      const next = [...prev, candle];
      return next;
    });
    if (params.newsEvents) handleNewsEvents(now, candle);
  }

  function calculatePriceChange(params: typeof MARKET_PARAMS[keyof typeof MARKET_PARAMS]) {
    let change = (Math.random() - 0.5) * params.volatility;
    if (lastCandle) {
      const prevChange = lastCandle.close - lastCandle.open;
      if (Math.random() < 0.3 && Math.abs(prevChange) > 0.1) {
        change += prevChange * 0.3;
      }
    }
    return change;
  }

  function handleNewsEvents(timestamp: number, candle: CandlestickData) {
    if (timestamp % (30 + Math.floor(Math.random() * 30)) === 0) {
      const newsImpact = (Math.random() - 0.5) * 5;
      const impactedPrice = currentPrice + currentPrice * newsImpact * 0.01;
      setCurrentPrice(impactedPrice);
      // Update last candle
      const updatedCandle = {
        ...candle,
        close: impactedPrice,
        high: Math.max(candle.high, impactedPrice),
        low: Math.min(candle.low, impactedPrice),
      };
      candleSeries.current?.update(updatedCandle);
      setLastCandle(updatedCandle);
    }
  }

  // Reset simulation
  function handleReset() {
    setIsPaused(false);
    setCandleCount(0);
    setCurrentPrice(INITIAL_PRICE);
    setSessionStart(Date.now());
    setLastCandle(null);
    lastCloseRef.current = INITIAL_PRICE;
    setCandles([]);
    candleSeries.current?.setData([]);
  }

  // Pause/resume
  function handlePause() {
    setIsPaused((p) => !p);
  }

  // UI price color
  const priceClass = lastCandle && lastCandle.close > (lastCandle.open ?? INITIAL_PRICE)
    ? 'text-green-500' : lastCandle && lastCandle.close < (lastCandle.open ?? INITIAL_PRICE)
    ? 'text-red-500' : '';

  // Add trade entry handlers
  function handleTradeEntry(type: 'buy' | 'sell') {
    if (!lastCandle) return;
    const trade = {
      id: uuidv4(),
      type,
      price: lastCandle.close,
      timestamp: Date.now(),
      candleIndex: candles.length - 1,
      size: 1,
    };
    setTrades((prev) => [...prev, trade]);
  }

  // Update chart markers when trades or candles change
  useEffect(() => {
    if (!candleSeries.current) return;
    const markers = trades.map((trade) => ({
      time: candles[trade.candleIndex]?.time,
      position: trade.type === 'buy' ? 'belowBar' as const : 'aboveBar' as const,
      color: trade.type === 'buy' ? '#26a69a' : '#ef5350',
      shape: trade.type === 'buy' ? 'arrowUp' as const : 'arrowDown' as const,
      text: trade.type === 'buy' ? 'Buy' : 'Sell',
    })).filter(m => m.time !== undefined);
    candleSeries.current.setMarkers(markers);
  }, [trades, candles]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trading Simulator</h1>
      <Card className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">Market Condition</span>
            <Select value={marketMode} onValueChange={setMarketMode}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select market mode" />
              </SelectTrigger>
              <SelectContent>
                {MARKET_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium">Update Speed</span>
            <Select value={String(updateSpeed)} onValueChange={v => setUpdateSpeed(Number(v))}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select speed" />
              </SelectTrigger>
              <SelectContent>
                {UPDATE_SPEEDS.map((speed) => (
                  <SelectItem key={speed.value} value={String(speed.value)}>{speed.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant={isPaused ? 'destructive' : 'default'} onClick={handlePause}>
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="outline" onClick={handleReset}>Reset</Button>
          <Button variant="default" onClick={() => handleTradeEntry('buy')}>Buy</Button>
          <Button variant="outline" onClick={() => handleTradeEntry('sell')}>Sell</Button>
        </div>
        <div ref={chartRef} className="w-full h-[400px]" />
      </Card>
      <div className="flex justify-between mt-4 text-muted-foreground text-sm">
        <div className="flex gap-4">
          <span className={`font-mono font-semibold text-lg ${priceClass}`}>{`$${currentPrice.toFixed(2)}`}</span>
          <span>{marketStatus}</span>
        </div>
        <div className="flex gap-4">
          <span>{`Candles: ${candleCount}`}</span>
          <span>{`Session: ${sessionTime}`}</span>
        </div>
      </div>
    </div>
  );
};

export default TradeSimPage; 