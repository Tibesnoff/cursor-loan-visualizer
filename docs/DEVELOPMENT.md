# Development Guide - Loan Visualizer

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Browser with developer tools

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

### Development Server
The application will be available at `http://localhost:5173` with hot module replacement enabled.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── charts/         # Chart components
│   │   ├── BalanceChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── OneTimePaymentChart.tsx
│   │   └── index.ts
│   ├── forms/          # Form components
│   │   ├── AddLoanModal.tsx
│   │   ├── AddPaymentModal.tsx
│   │   ├── UserSetup.tsx
│   │   └── index.ts
│   ├── layout/         # Layout components
│   │   ├── Sidebar.tsx
│   │   └── index.ts
│   ├── loan/           # Loan-specific components
│   │   ├── LoanVisualizer.tsx
│   │   ├── LoanOverviewCards.tsx
│   │   ├── PaymentStatisticsCards.tsx
│   │   ├── LoanDetailsCard.tsx
│   │   ├── LoanVisualizerHeader.tsx
│   │   └── index.ts
│   ├── ui/             # Generic UI components
│   │   ├── StatisticCard.tsx
│   │   ├── LoanTypeBadge.tsx
│   │   └── index.ts
│   └── index.ts        # Component exports
├── constants/          # Application constants
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useLoanCalculations.ts
│   ├── usePaymentSchedule.ts
│   ├── useChartData.ts
│   ├── redux.ts
│   └── index.ts
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── MyLoans.tsx
│   ├── LoanVisualizerPage.tsx
│   └── *.css
├── store/              # Redux store
│   ├── index.ts
│   ├── slices/
│   │   ├── userSlice.ts
│   │   ├── loansSlice.ts
│   │   └── paymentsSlice.ts
│   └── middleware/
│       └── persistenceMiddleware.ts
├── styles/             # Shared styles
│   └── shared.css
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── dataUtils.ts
│   ├── loanUtils.ts
│   ├── interestCalculations.ts
│   └── loanCalculationUtils.ts
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

## Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code changes ...

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Code Quality
```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Type checking
npm run type-check

# Build verification
npm run build
```

### 3. Testing
```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Coding Standards

### TypeScript Guidelines

#### Type Definitions
```typescript
// Use interfaces for object shapes
interface Loan {
  id: string;
  name: string;
  principal: number;
  // ... other properties
}

// Use types for unions and primitives
type LoanType = 'personal' | 'auto' | 'mortgage';

// Use enums for constants
enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

#### Function Definitions
```typescript
// Use explicit return types for complex functions
function calculateInterest(
  balance: number,
  rate: number,
  days: number
): number {
  return balance * (rate / 100) * (days / 365);
}

// Use arrow functions for simple operations
const formatCurrency = (amount: number): string => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
```

#### Component Props
```typescript
// Define props interfaces
interface LoanCardProps {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onDelete: (loanId: string) => void;
}

// Use React.FC with props
const LoanCard: React.FC<LoanCardProps> = ({ loan, onEdit, onDelete }) => {
  // Component implementation
};
```

### React Guidelines

#### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Button, Card } from 'antd';

// 2. Types/Interfaces
interface ComponentProps {
  // props definition
}

// 3. Component
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // 4. State
  const [state, setState] = useState(initialValue);
  
  // 5. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // 6. Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 8. Export
export default Component;
```

#### Hooks Usage
```typescript
// Use custom hooks for complex logic
const useLoanCalculations = (loan: Loan, payments: Payment[]) => {
  const [stats, setStats] = useState<LoanStats | null>(null);
  
  useEffect(() => {
    // calculation logic
    const calculatedStats = calculateLoanStats(loan, payments);
    setStats(calculatedStats);
  }, [loan, payments]);
  
  return stats;
};

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers passed to children
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### CSS Guidelines

#### CSS Variables
```css
/* Use CSS variables for consistent theming */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --text-color: #262626;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

/* Use variables in components */
.button {
  background-color: var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

#### Component Styling
```css
/* Use BEM methodology for class names */
.loan-card {
  /* Block */
}

.loan-card__header {
  /* Element */
}

.loan-card--featured {
  /* Modifier */
}

/* Use semantic class names */
.primary-button {
  background-color: var(--primary-color);
}

.error-message {
  color: var(--error-color);
}
```

## State Management

### Redux Store Structure
```typescript
// Store slices should be focused and single-purpose
interface LoansState {
  loans: Loan[];
  isLoading: boolean;
  error: string | null;
}

// Use Redux Toolkit for simpler code
const loansSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    addLoan: (state, action) => {
      state.loans.push(action.payload);
    },
    updateLoan: (state, action) => {
      const index = state.loans.findIndex(loan => loan.id === action.payload.id);
      if (index !== -1) {
        state.loans[index] = action.payload;
      }
    },
  },
});
```

### Selectors
```typescript
// Create selectors for complex state queries
const selectLoansByType = (state: RootState, loanType: LoanType) =>
  state.loans.loans.filter(loan => loan.loanType === loanType);

const selectLoanById = (state: RootState, loanId: string) =>
  state.loans.loans.find(loan => loan.id === loanId);
```

## Component Development

### Creating New Components

#### 1. Component File
```typescript
// src/components/ui/NewComponent.tsx
import React from 'react';
import './NewComponent.css';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <div className="new-component">
      <h3>{title}</h3>
      <button onClick={onAction}>Action</button>
    </div>
  );
};
```

#### 2. Component Styles
```css
/* src/components/ui/NewComponent.css */
.new-component {
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.new-component h3 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-color);
}
```

#### 3. Export from Index
```typescript
// src/components/ui/index.ts
export { NewComponent } from './NewComponent';
```

### Component Testing
```typescript
// src/components/ui/__tests__/NewComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('renders title correctly', () => {
    render(<NewComponent title="Test Title" onAction={jest.fn()} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onAction when button is clicked', () => {
    const mockAction = jest.fn();
    render(<NewComponent title="Test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByText('Action'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

## Utility Functions

### Creating Utility Functions
```typescript
// src/utils/dateUtils.ts
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return date >= startDate && date <= endDate;
};
```

### Testing Utility Functions
```typescript
// src/utils/__tests__/dateUtils.test.ts
import { formatDate, addMonths, isDateInRange } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('Dec 25, 2023');
    });
  });

  describe('addMonths', () => {
    it('adds months correctly', () => {
      const date = new Date('2023-01-15');
      const result = addMonths(date, 3);
      expect(result.getMonth()).toBe(3); // April (0-indexed)
    });
  });
});
```

## Performance Optimization

### Memoization
```typescript
// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);

// Use React.memo for component memoization
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* expensive rendering */}</div>;
});
```

### Code Splitting
```typescript
// Lazy load components
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Use Suspense for loading states
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### Bundle Optimization
```typescript
// Use dynamic imports for heavy libraries
const loadChartLibrary = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

## Debugging

### Development Tools
```typescript
// Use React Developer Tools
// Install browser extension for React debugging

// Use Redux DevTools
// Install Redux DevTools Extension

// Add debugging helpers
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data);
  }
};
```

### Error Boundaries
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Git Workflow

### Branch Naming
```bash
# Feature branches
feature/add-payment-tracking
feature/improve-charts

# Bug fixes
bugfix/fix-calculation-error
bugfix/resolve-memory-leak

# Hotfixes
hotfix/security-patch
hotfix/critical-bug

# Chores
chore/update-dependencies
chore/refactor-utils
```

### Commit Messages
```bash
# Use conventional commits
feat: add payment tracking functionality
fix: resolve calculation error in interest calculation
docs: update API documentation
style: format code with prettier
refactor: extract common calculation logic
test: add unit tests for utility functions
chore: update dependencies
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

## Common Issues and Solutions

### 1. TypeScript Errors
```typescript
// Common type issues and solutions

// Issue: Type 'any' is not assignable
// Solution: Use proper typing
const data: Loan[] = response.data;

// Issue: Property does not exist on type
// Solution: Use optional chaining or type guards
const name = loan?.name ?? 'Unknown';

// Issue: Cannot find module
// Solution: Check import paths and file extensions
import { Component } from './Component';
```

### 2. React Hooks Issues
```typescript
// Issue: Missing dependencies in useEffect
// Solution: Add all dependencies
useEffect(() => {
  // effect logic
}, [dependency1, dependency2]);

// Issue: Stale closure in useCallback
// Solution: Include all dependencies
const handleClick = useCallback(() => {
  // handler logic
}, [dependency1, dependency2]);
```

### 3. Performance Issues
```typescript
// Issue: Unnecessary re-renders
// Solution: Use React.memo and proper dependencies
const MemoizedComponent = React.memo(Component);

// Issue: Heavy calculations on every render
// Solution: Use useMemo
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);
```

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Ant Design Components](https://ant.design/components/overview)
- [Recharts Documentation](https://recharts.org/)

### Tools
- [VS Code Extensions](https://code.visualstudio.com/docs/editor/extension-marketplace)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

### Best Practices
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [CSS Best Practices](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Git Best Practices](https://www.atlassian.com/git/tutorials/comparing-workflows)
