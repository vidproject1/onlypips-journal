# OnlyPips Journal

A comprehensive trading journal and analytics platform designed for forex traders to track, analyze, and improve their trading performance.

## 🎯 Overview

OnlyPips Journal is a modern web application built for serious forex traders who want to systematically track their trades, analyze performance, and develop disciplined trading habits. The platform combines trade logging, performance analytics, market prediction tools, and growth planning into a unified dashboard.

## ✨ Key Features

### 📊 **Multi-Account Dashboard**
- Support for multiple trading accounts (Real/Demo)
- Real-time trade tracking and analytics
- Performance metrics and visualizations
- Live data updates with Supabase real-time subscriptions

### 📝 **Trade Journal**
- Comprehensive trade logging with entry/exit prices
- Screenshot uploads for trade documentation
- Trade categorization (WIN/LOSS/BREAK EVEN)
- Notes and trade type classification
- Filterable trade history by account

### 🎯 **Market Predictor**
- Economic event prediction system
- USD strength/weakness voting on major events
- Monthly prediction tracking
- Community sentiment analysis
- Historical prediction accuracy tracking

### 📈 **Growth Path Planning**
- Systematic account growth planning
- Risk management calculations
- Target balance and timeline projections
- Trade completion tracking
- Risk level customization (Conservative, Moderate, Aggressive)

### ✅ **Strategy Checklists**
- Customizable trading strategy checklists
- Marketplace for premium strategy templates
- Checklist completion tracking
- Strategy performance correlation

### 📊 **Advanced Analytics**
- Performance heatmaps
- Monthly recaps and reports
- Win rate and profit factor calculations
- Risk-adjusted return metrics
- Trade distribution analysis

### 🔔 **Notifications System**
- Real-time notifications
- Admin notification management
- User notification preferences

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend & Database
- **Supabase** for backend services
- **PostgreSQL** database
- **Real-time subscriptions** for live updates
- **Row Level Security (RLS)** for data protection
- **Supabase Storage** for file uploads

### State Management & Data Fetching
- **TanStack Query** for server state management
- **React Query** for caching and synchronization

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onlypips-journal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Set up your Supabase project
   - Import the database schema (see `supabase/config.toml`)
   - Configure Row Level Security policies

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Accounts/       # Account management
│   ├── Admin/          # Admin functionality
│   ├── Auth/           # Authentication
│   ├── Checklist/      # Strategy checklists
│   ├── Dashboard/      # Analytics components
│   ├── GrowthPath/     # Growth planning
│   ├── Layout/         # Layout components
│   ├── Notifications/  # Notification system
│   ├── Predictor/      # Market prediction
│   ├── Trades/         # Trade management
│   └── ui/             # Base UI components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Main application pages
└── main.tsx           # Application entry point
```

## 🔐 Authentication & Security

- **Supabase Auth** for user authentication
- **Row Level Security (RLS)** policies for data protection
- **API key management** for external integrations
- **Secure file uploads** with Supabase Storage

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **users** - User accounts and API keys
- **accounts** - Trading accounts (Real/Demo)
- **trades** - Individual trade records
- **strategies** - Trading strategies
- **strategy_checklist_items** - Checklist items for strategies
- **growth_plans** - Account growth planning
- **economic_events** - Market events for predictions
- **predictions** - User market predictions
- **marketplace_checklists** - Premium strategy templates
- **notifications** - System notifications

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode** - Modern dark theme with accent colors
- **Real-time Updates** - Live data synchronization
- **Interactive Charts** - Advanced data visualization
- **Accessible Components** - WCAG compliant UI elements
- **Loading States** - Smooth user experience
- **Toast Notifications** - User feedback system

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema
3. Configure authentication providers
4. Set up storage buckets for file uploads
5. Configure RLS policies

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📈 Performance Features

- **Real-time Trade Tracking** - Live updates via Supabase subscriptions
- **Performance Analytics** - Advanced metrics and reporting
- **Growth Planning** - Systematic account progression
- **Market Predictions** - Community-driven market analysis
- **Strategy Management** - Checklist-based trading discipline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the Supabase configuration guide

## 🔮 Roadmap

- [ ] Advanced charting integration
- [ ] Mobile app development
- [ ] Social trading features
- [ ] Automated trade analysis
- [ ] Integration with major brokers
- [ ] Advanced risk management tools
- [ ] Performance benchmarking
- [ ] Educational content platform

---

**OnlyPips Journal** - Empowering traders with data-driven insights and disciplined trading practices. 