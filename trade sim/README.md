# Trading Simulator - Real-time Candlestick Chart

A polished web application for simulating real-time candlestick charts with configurable market conditions. Built for forward-testing trading strategies in fictional market scenarios.

## Features

### 🎯 Core Functionality
- **Real-time Candlestick Charting**: Professional-looking candlesticks using TradingView's Lightweight Charts
- **Simulated Market Data**: Plausible OHLC (Open, High, Low, Close) price generation
- **Multiple Market Conditions**: Four preset market behavior modes
- **Live Updates**: Configurable update intervals (0.5s, 1s, 2s)
- **Responsive Design**: Works on desktop and mobile devices

### 📊 Market Simulation Modes

1. **Normal Market**
   - Balanced volatility and price movements
   - Realistic market behavior for general testing

2. **Aggressive Market**
   - High volatility with large price swings
   - Includes upward trend bias
   - Perfect for testing risk management strategies

3. **Slow Day**
   - Low volatility with minimal price changes
   - Gradual, small movements
   - Ideal for testing scalping strategies

4. **High-Impact News Event**
   - Moderate volatility with sudden price spikes
   - Simulated news events every 30-60 seconds
   - Great for testing news-based strategies

### 🎮 Controls

- **Market Condition Selector**: Switch between different market behaviors
- **Update Speed Control**: Adjust how frequently new candles are generated
- **Pause/Resume**: Stop and restart the simulation
- **Reset**: Clear the chart and start fresh

### 📈 Visual Features

- **Professional Chart Design**: Dark theme matching TradingView aesthetics
- **Price Indicators**: Color-coded price changes (green for up, red for down)
- **Real-time Statistics**: Live candle count and session timer
- **Market Status Display**: Current mode and simulation state
- **Responsive Layout**: Adapts to different screen sizes

## Technical Architecture

### Modular Design
The application is built with a clean, modular architecture:

- **HTML Structure**: Semantic markup with clear component separation
- **CSS Styling**: Modern, responsive design with professional trading platform aesthetics
- **JavaScript Classes**: Object-oriented approach with the main `TradingSimulator` class

### Key Components

1. **Chart Management**: Handles TradingView Lightweight Charts integration
2. **Market Simulation**: Generates realistic OHLC data with configurable parameters
3. **UI Controller**: Manages user interactions and display updates
4. **Event System**: Handles real-time updates and user controls

### Market Simulation Logic

The simulator generates realistic candlestick data by:

- **Base Price Movement**: Random walk with configurable volatility
- **Trend Application**: Optional directional bias for different market modes
- **Momentum Effects**: 30% chance to continue previous price direction
- **Realistic Ranges**: High/Low values calculated based on Open/Close movement
- **News Events**: Sudden price impacts in news mode

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download or clone the repository
2. Open `index.html` in your web browser
3. The application will start automatically

### Usage

1. **Start the Simulation**: The chart begins generating candles immediately
2. **Select Market Mode**: Choose from the dropdown to change market behavior
3. **Adjust Speed**: Modify update frequency as needed
4. **Pause/Resume**: Use the pause button to stop and restart
5. **Reset**: Clear the chart and start a new session

## Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Performance

- **Smooth Rendering**: Optimized for 60fps chart updates
- **Memory Efficient**: Automatic cleanup of old chart data
- **Responsive**: Handles window resizing gracefully
- **Lightweight**: Minimal dependencies, fast loading

## Future Enhancements

The modular architecture supports easy addition of:

- **Technical Indicators**: Moving averages, RSI, MACD, etc.
- **Drawing Tools**: Trend lines, Fibonacci retracements
- **Strategy Backtesting**: Historical data playback
- **Custom Indicators**: User-defined technical analysis
- **Data Export**: Save simulation results
- **Multiple Timeframes**: Different candle intervals
- **Volume Simulation**: Add volume data to candlesticks

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Note**: This is a simulation tool for educational and testing purposes. The generated data is fictional and should not be used for real trading decisions. 