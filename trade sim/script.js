// Trading Simulator - Main Application
class TradingSimulator {
    constructor() {
        this.chart = null;
        this.candlestickSeries = null;
        this.isRunning = false;
        this.isPaused = false;
        this.updateInterval = null;
        this.sessionStartTime = Date.now();
        this.candleCount = 0;
        this.currentPrice = 100.00;
        this.lastCandle = null;
        this.marketMode = 'normal';
        this.updateSpeed = 1000;
        
        // Market simulation parameters
        this.marketParams = {
            normal: { volatility: 0.5, trend: 0, newsEvents: false },
            aggressive: { volatility: 2.0, trend: 0.1, newsEvents: false },
            slow: { volatility: 0.2, trend: 0, newsEvents: false },
            news: { volatility: 1.5, trend: 0, newsEvents: true }
        };
        
        // Wait for the chart library to load
        this.waitForChartLibrary();
    }
    
    waitForChartLibrary() {
        if (typeof LightweightCharts !== 'undefined') {
            this.initializeChart();
            this.bindEvents();
            this.start();
        } else {
            // Check again in 100ms
            setTimeout(() => this.waitForChartLibrary(), 100);
        }
    }
    
    initializeChart() {
        const chartContainer = document.getElementById('chart');
        
        try {
            this.chart = LightweightCharts.createChart(chartContainer, {
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight,
                layout: {
                    background: { color: '#131722' },
                    textColor: '#d1d4dc',
                },
                grid: {
                    vertLines: { color: '#2a2e39' },
                    horzLines: { color: '#2a2e39' },
                },
                crosshair: {
                    mode: LightweightCharts.CrosshairMode.Normal,
                },
                rightPriceScale: {
                    borderColor: '#2a2e39',
                    scaleMargins: {
                        top: 0.1,
                        bottom: 0.1,
                    },
                },
                timeScale: {
                    borderColor: '#2a2e39',
                    timeVisible: true,
                    secondsVisible: false,
                },
            });
            
            this.candlestickSeries = this.chart.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderDownColor: '#ef5350',
                borderUpColor: '#26a69a',
                wickDownColor: '#ef5350',
                wickUpColor: '#26a69a',
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                this.chart.applyOptions({
                    width: chartContainer.clientWidth,
                    height: chartContainer.clientHeight,
                });
            });
            
            console.log('Chart initialized successfully');
        } catch (error) {
            console.error('Failed to initialize chart:', error);
            this.showError('Failed to load chart library. Please refresh the page.');
        }
    }
    
    showError(message) {
        const chartContainer = document.getElementById('chart');
        chartContainer.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #ef5350;
                font-size: 1.2rem;
                text-align: center;
                padding: 2rem;
            ">
                <div>
                    <h3>Chart Loading Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="
                        background: #2962ff;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">Refresh Page</button>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // Market mode selection
        document.getElementById('market-mode').addEventListener('change', (e) => {
            this.marketMode = e.target.value;
            this.updateMarketStatus();
        });
        
        // Update speed selection
        document.getElementById('update-speed').addEventListener('change', (e) => {
            this.updateSpeed = parseInt(e.target.value);
            if (this.isRunning && !this.isPaused) {
                this.restart();
            }
        });
        
        // Pause/Resume button
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        // Reset button
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.reset();
        });
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.sessionStartTime = Date.now();
        this.updateInterval = setInterval(() => {
            if (!this.isPaused) {
                this.generateCandle();
            }
        }, this.updateSpeed);
        
        this.updateUI();
    }
    
    restart() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.start();
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pause-btn');
        
        if (this.isPaused) {
            pauseBtn.textContent = 'Resume';
            pauseBtn.classList.add('paused');
        } else {
            pauseBtn.textContent = 'Pause';
            pauseBtn.classList.remove('paused');
        }
        
        this.updateMarketStatus();
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.candleCount = 0;
        this.currentPrice = 100.00;
        this.lastCandle = null;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Clear chart data
        this.candlestickSeries.setData([]);
        
        // Reset UI
        document.getElementById('pause-btn').textContent = 'Pause';
        document.getElementById('pause-btn').classList.remove('paused');
        this.updateUI();
        
        // Restart
        this.start();
    }
    
    generateCandle() {
        const now = new Date();
        const timestamp = Math.floor(now.getTime() / 1000);
        
        // Generate OHLC data
        const candle = this.generateOHLC(timestamp);
        
        // Add to chart
        this.candlestickSeries.update(candle);
        
        // Update state
        this.lastCandle = candle;
        this.currentPrice = candle.close;
        this.candleCount++;
        
        // Update UI
        this.updateUI();
        
        // Handle news events for news mode
        if (this.marketParams[this.marketMode].newsEvents) {
            this.handleNewsEvents(timestamp);
        }
    }
    
    generateOHLC(timestamp) {
        const params = this.marketParams[this.marketMode];
        const basePrice = this.lastCandle ? this.lastCandle.close : this.currentPrice;
        
        // Calculate price movement
        let priceChange = this.calculatePriceChange(params);
        
        // Apply trend
        priceChange += params.trend;
        
        // Generate OHLC values
        const open = basePrice;
        const close = Math.max(0.01, open + priceChange);
        
        // Calculate high and low with realistic ranges
        const range = Math.abs(priceChange) * (0.5 + Math.random() * 1.5);
        const high = Math.max(open, close) + range * Math.random();
        const low = Math.min(open, close) - range * Math.random();
        
        return {
            time: timestamp,
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2))
        };
    }
    
    calculatePriceChange(params) {
        // Base volatility
        let change = (Math.random() - 0.5) * params.volatility;
        
        // Add some randomness and momentum
        if (this.lastCandle) {
            const prevChange = this.lastCandle.close - this.lastCandle.open;
            // Add momentum (30% chance to continue trend)
            if (Math.random() < 0.3 && Math.abs(prevChange) > 0.1) {
                change += prevChange * 0.3;
            }
        }
        
        return change;
    }
    
    handleNewsEvents(timestamp) {
        // Simulate news events every 30-60 seconds
        if (timestamp % (30 + Math.floor(Math.random() * 30)) === 0) {
            const newsImpact = (Math.random() - 0.5) * 5; // ±2.5% impact
            this.currentPrice += this.currentPrice * newsImpact * 0.01;
            
            // Update the last candle with news impact
            if (this.lastCandle) {
                this.lastCandle.close = this.currentPrice;
                this.lastCandle.high = Math.max(this.lastCandle.high, this.currentPrice);
                this.lastCandle.low = Math.min(this.lastCandle.low, this.currentPrice);
                this.candlestickSeries.update(this.lastCandle);
            }
        }
    }
    
    updateUI() {
        // Update current price
        const priceElement = document.getElementById('current-price');
        const prevPrice = parseFloat(priceElement.textContent.replace(/[^0-9.-]/g, ''));
        const currentPrice = this.currentPrice;
        
        priceElement.textContent = `$${currentPrice.toFixed(2)}`;
        
        // Add price change indicator
        priceElement.classList.remove('price-up', 'price-down');
        if (this.lastCandle && prevPrice !== currentPrice) {
            if (currentPrice > prevPrice) {
                priceElement.classList.add('price-up');
            } else if (currentPrice < prevPrice) {
                priceElement.classList.add('price-down');
            }
        }
        
        // Update market status
        this.updateMarketStatus();
        
        // Update stats
        document.getElementById('candle-count').textContent = `Candles: ${this.candleCount}`;
        
        const sessionTime = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const minutes = Math.floor(sessionTime / 60);
        const seconds = sessionTime % 60;
        document.getElementById('session-time').textContent = 
            `Session: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateMarketStatus() {
        const statusElement = document.getElementById('market-status');
        let status = '';
        let statusClass = '';
        
        if (this.isPaused) {
            status = 'PAUSED';
            statusClass = 'paused';
        } else {
            switch (this.marketMode) {
                case 'normal':
                    status = 'Normal Market';
                    break;
                case 'aggressive':
                    status = 'Aggressive Market';
                    statusClass = 'mode-aggressive';
                    break;
                case 'slow':
                    status = 'Slow Day';
                    statusClass = 'mode-slow';
                    break;
                case 'news':
                    status = 'News Event Mode';
                    statusClass = 'mode-news';
                    break;
            }
        }
        
        statusElement.textContent = status;
        statusElement.className = `status-display ${statusClass}`;
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TradingSimulator();
}); 