# Loan Visualizer - Technical Documentation

## Overview

The Loan Visualizer is a React-based web application that helps users track, analyze, and visualize their loan payments. It provides detailed insights into loan balances, payment schedules, and financial progress over time.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/loan-visualizer.git
cd loan-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Documentation Structure

### 📚 [API Documentation](API.md)
Complete reference for internal APIs, hooks, utility functions, and data models.

### 🛠️ [Development Guide](DEVELOPMENT.md)
Comprehensive guide for developers including coding standards, workflows, and best practices.

### 🚀 [Deployment Guide](DEPLOYMENT.md)
Instructions for deploying the application in various environments with production considerations.

### 🔍 [Technical Debt Audit](TECHNICAL_DEBT_AUDIT.md)
Detailed analysis of technical debt, code quality issues, and improvement recommendations.

### 📝 [Changelog](CHANGELOG.md)
Complete version history and migration guides.

## Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **UI Library**: Ant Design
- **Charts**: Recharts
- **Routing**: React Router v6
- **Styling**: CSS with CSS Variables
- **Code Quality**: ESLint + Prettier

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── charts/         # Chart components (BalanceChart, PieChart, etc.)
│   ├── forms/          # Form components (AddLoanModal, AddPaymentModal, etc.)
│   ├── layout/         # Layout components (Sidebar, AppLayout)
│   ├── loan/           # Loan-specific components
│   └── ui/             # Generic UI components (StatisticCard, LoanTypeBadge)
├── constants/          # Application constants
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── store/              # Redux store and slices
├── styles/             # Shared CSS styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Core Features

### 1. Loan Management
- **Add/Edit Loans**: Support for multiple loan types (personal, auto, mortgage, student, credit card, business, home equity)
- **Loan Types**: Each type has specific rules for payment frequency, minimum payments, and terms
- **Interest Calculation**: Supports both daily and monthly interest accrual methods
- **Subsidized Loans**: Special handling for student loans with grace periods

### 2. Payment Tracking
- **Payment History**: Track all payments with principal/interest breakdown
- **Payment Scheduling**: Visualize payment schedules and remaining balances
- **Extra Payments**: Track additional payments beyond minimum requirements

### 3. Data Visualization
- **Balance Over Time**: Line chart showing loan balance progression
- **Payment Breakdown**: Pie charts for total cost and individual payment analysis
- **Payment Statistics**: Cards showing key metrics and progress

### 4. Financial Calculations
- **Amortization**: Standard loan calculations for fixed-term loans
- **Interest Accrual**: Daily and monthly interest calculation methods
- **Payment Application**: Proper order (interest first, then principal)
- **Balance Projections**: Future balance calculations with different payment scenarios

## Key Components

### 1. LoanVisualizer
Main component for displaying detailed loan information and charts.

**Props:**
- `loan: Loan` - The loan to visualize
- `onBack: () => void` - Callback for navigation

**Features:**
- Loan overview cards with key statistics
- Payment progress tracking
- Interactive charts and visualizations
- Payment management actions

### 2. PaymentStatisticsCards
Displays payment-related statistics and progress.

**Props:**
- `loan: Loan` - The loan data
- `loanPayments: Payment[]` - Array of payments for the loan

**Features:**
- Total paid, principal paid, interest paid
- Additional spent over minimum
- Last payment breakdown

### 3. BalanceChart
Interactive line chart showing loan balance over time.

**Props:**
- `paymentScheduleData: PaymentScheduleDataPoint[]` - Chart data points

**Features:**
- Actual balance vs minimum payment balance comparison
- Interactive tooltips with detailed information
- Responsive design

## State Management

### Redux Store Structure
```typescript
interface RootState {
  user: {
    currentUser: User | null;
    isLoading: boolean;
    error: string | null;
  };
  loans: {
    loans: Loan[];
    isLoading: boolean;
    error: string | null;
  };
  payments: {
    payments: Payment[];
    isLoading: boolean;
    error: string | null;
  };
}
```

### Key Actions
- `addLoan` - Add a new loan
- `updateLoan` - Update existing loan
- `deleteLoan` - Remove loan
- `addPayment` - Add payment to loan
- `setUser` - Set current user

## Data Persistence

### LocalStorage Integration
- **Automatic Persistence**: All state changes are automatically saved to localStorage
- **Data Recovery**: Application state is restored on page reload
- **Error Handling**: Graceful fallback if localStorage is unavailable

### Storage Keys
- `loan_visualizer_user` - User data
- `loan_visualizer_loans` - Loan data
- `loan_visualizer_payments` - Payment data

## Calculation Engine

### Core Calculation Functions

#### 1. Interest Calculations (`src/utils/interestCalculations.ts`)
- `calculateInterest()` - Calculate interest for a given period
- `calculateInterestBetweenDates()` - Calculate interest between two dates

#### 2. Loan Calculations (`src/utils/loanCalculationUtils.ts`)
- `calculateEffectiveStartingBalance()` - Get starting balance when payments begin
- `applyPaymentToBalance()` - Apply payment with proper interest/principal split
- `calculateMonthlyPayment()` - Calculate monthly payment amount

#### 3. Consolidated Hook (`src/hooks/useLoanCalculations.ts`)
- `actualLoanStats` - Current loan statistics
- `additionalSpentOverMinimum` - Extra payments made
- `lastPaymentBreakdown` - Details of most recent payment

## Styling System

### CSS Variables
```css
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --text-color: #262626;
  --background-color: #f0f2f5;
  --card-background: #ffffff;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}
```

### Component Styling
- **Shared Styles**: Common patterns in `src/styles/shared.css`
- **Component-Specific**: Individual CSS files for complex components
- **Responsive Design**: Mobile-first approach with breakpoints

## Development Guidelines

### Code Organization
1. **Components**: Keep components focused and single-purpose
2. **Hooks**: Use custom hooks for complex logic and state management
3. **Utils**: Pure functions for calculations and data manipulation
4. **Types**: Comprehensive TypeScript interfaces for type safety

### Naming Conventions
- **Components**: PascalCase (e.g., `LoanVisualizer`)
- **Hooks**: camelCase starting with 'use' (e.g., `useLoanCalculations`)
- **Functions**: camelCase (e.g., `calculateInterest`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `LOAN_TYPES`)

### File Structure
- **One component per file**
- **Co-located styles** for component-specific CSS
- **Index files** for clean imports
- **Consistent folder structure** across the application

## Performance Considerations

### Optimization Strategies
1. **Memoization**: Use `useMemo` and `useCallback` for expensive calculations
2. **Lazy Loading**: Components loaded on demand
3. **Efficient Re-renders**: Proper dependency arrays in hooks
4. **Chart Optimization**: Recharts handles large datasets efficiently

### Bundle Size
- **Tree Shaking**: Only import needed functions
- **Code Splitting**: Route-based code splitting with React.lazy
- **Asset Optimization**: Vite handles asset optimization automatically

## Testing Strategy

### Unit Testing
- **Hooks**: Test calculation logic with various inputs
- **Utils**: Test pure functions with edge cases
- **Components**: Test component behavior and props

### Integration Testing
- **User Flows**: Test complete user journeys
- **Data Persistence**: Test localStorage integration
- **State Management**: Test Redux actions and reducers

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
- `VITE_API_URL` - Backend API URL (if applicable)
- `VITE_APP_VERSION` - Application version

### Production Considerations
- **Asset Optimization**: Vite optimizes assets for production
- **Code Splitting**: Automatic code splitting for better performance
- **Error Boundaries**: Graceful error handling in production

## Security Considerations

### Data Protection
- **Client-Side Storage**: Sensitive data stored locally (consider encryption for production)
- **Input Validation**: All user inputs validated and sanitized
- **XSS Prevention**: React's built-in XSS protection

### Best Practices
- **No Sensitive Data**: Avoid storing sensitive information in localStorage
- **Input Sanitization**: Validate all user inputs
- **Error Handling**: Don't expose internal errors to users

## Future Enhancements

### Planned Features
1. **Data Export**: Export loan data to CSV/PDF
2. **Multiple Users**: Support for multiple user accounts
3. **Cloud Sync**: Sync data across devices
4. **Advanced Analytics**: More detailed financial insights
5. **Loan Comparison**: Compare multiple loans side by side

### Technical Improvements
1. **Backend Integration**: Move to server-side data storage
2. **Real-time Updates**: WebSocket integration for live updates
3. **Offline Support**: Service worker for offline functionality
4. **Mobile App**: React Native version for mobile devices

## Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed contribution guidelines.

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the development guide for setup instructions