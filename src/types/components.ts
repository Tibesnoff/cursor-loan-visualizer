import { ReactNode, ComponentType, RefAttributes } from 'react';
import { Loan, Payment } from './index';

// Base component props
export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: ReactNode;
  readonly 'data-testid'?: string;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  readonly visible: boolean;
  readonly onCancel: () => void;
  readonly onOk?: () => void;
  readonly title?: string;
  readonly width?: number | string;
  readonly loading?: boolean;
  readonly closable?: boolean;
  readonly maskClosable?: boolean;
}

// Form component props
export interface FormProps extends BaseComponentProps {
  readonly onSubmit: (values: Record<string, unknown>) => void;
  readonly onCancel: () => void;
  readonly loading?: boolean;
  readonly initialValues?: Record<string, unknown>;
  readonly validationErrors?: Record<string, string>;
}

// Card component props
export interface CardProps extends BaseComponentProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly loading?: boolean;
  readonly hoverable?: boolean;
  readonly bordered?: boolean;
}

// Table component props
export interface TableProps<T = unknown> extends BaseComponentProps {
  readonly data: readonly T[];
  readonly columns: readonly TableColumn<T>[];
  readonly loading?: boolean;
  readonly pagination?: TablePagination;
  readonly rowKey?: keyof T | ((record: T) => string);
  readonly onRow?: (record: T, index: number) => TableRowProps;
}

export interface TableColumn<T = unknown> {
  readonly key: keyof T | string;
  readonly title: string;
  readonly dataIndex?: keyof T | string;
  readonly render?: (value: unknown, record: T, index: number) => ReactNode;
  readonly width?: number | string;
  readonly align?: 'left' | 'center' | 'right';
  readonly sorter?: boolean | ((a: T, b: T) => number);
  readonly filterable?: boolean;
  readonly sortable?: boolean;
}

export interface TablePagination {
  readonly current: number;
  readonly pageSize: number;
  readonly total: number;
  readonly showSizeChanger?: boolean;
  readonly showQuickJumper?: boolean;
  readonly onChange?: (page: number, pageSize: number) => void;
}

export interface TableRowProps {
  readonly onClick?: () => void;
  readonly onDoubleClick?: () => void;
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

// Chart component props
export interface ChartProps extends BaseComponentProps {
  readonly data: readonly ChartDataPoint[];
  readonly width?: number;
  readonly height?: number;
  readonly loading?: boolean;
  readonly error?: string;
  readonly onDataPointClick?: (data: ChartDataPoint) => void;
  readonly onDataPointHover?: (data: ChartDataPoint) => void;
}

export interface ChartDataPoint {
  readonly name: string;
  readonly value: number;
  readonly color: string;
  readonly label?: string;
  readonly tooltip?: string;
}

// Button component props
export interface ButtonProps extends BaseComponentProps {
  readonly type?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  readonly size?: 'small' | 'middle' | 'large';
  readonly shape?: 'default' | 'circle' | 'round';
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly danger?: boolean;
  readonly ghost?: boolean;
  readonly block?: boolean;
  readonly icon?: ReactNode;
  readonly onClick?: () => void;
  readonly htmlType?: 'button' | 'submit' | 'reset';
}

// Input component props
export interface InputProps extends BaseComponentProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly maxLength?: number;
  readonly showCount?: boolean;
  readonly prefix?: ReactNode;
  readonly suffix?: ReactNode;
  readonly onChange?: (value: string) => void;
  readonly onPressEnter?: () => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

// Select component props
export interface SelectProps<T = unknown> extends BaseComponentProps {
  readonly value?: T;
  readonly defaultValue?: T;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly allowClear?: boolean;
  readonly showSearch?: boolean;
  readonly mode?: 'multiple' | 'tags';
  readonly options: readonly SelectOption<T>[];
  readonly onChange?: (value: T) => void;
  readonly onSearch?: (value: string) => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

export interface SelectOption<T = unknown> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
  readonly children?: readonly SelectOption<T>[];
}

// Date picker component props
export interface DatePickerProps extends BaseComponentProps {
  readonly value?: Date;
  readonly defaultValue?: Date;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly allowClear?: boolean;
  readonly showTime?: boolean;
  readonly format?: string;
  readonly onChange?: (date: Date | null) => void;
  readonly onFocus?: () => void;
  readonly onBlur?: () => void;
}

// Tooltip component props
export interface TooltipProps extends BaseComponentProps {
  readonly title: string;
  readonly placement?: 'top' | 'bottom' | 'left' | 'right';
  readonly trigger?: 'hover' | 'focus' | 'click';
  readonly visible?: boolean;
  readonly onVisibleChange?: (visible: boolean) => void;
}

// Badge component props
export interface BadgeProps extends BaseComponentProps {
  readonly count?: number;
  readonly showZero?: boolean;
  readonly overflowCount?: number;
  readonly dot?: boolean;
  readonly status?: 'success' | 'processing' | 'default' | 'error' | 'warning';
  readonly text?: string;
  readonly color?: string;
}

// Statistic component props
export interface StatisticProps extends BaseComponentProps {
  readonly title?: string;
  readonly value: number | string;
  readonly precision?: number;
  readonly prefix?: ReactNode;
  readonly suffix?: ReactNode;
  readonly valueStyle?: React.CSSProperties;
  readonly loading?: boolean;
}

// Loan-specific component props
export interface LoanCardProps extends CardProps {
  readonly loan: Loan;
  readonly onEdit?: (loan: Loan) => void;
  readonly onDelete?: (loanId: string) => void;
  readonly onView?: (loanId: string) => void;
}

export interface PaymentCardProps extends CardProps {
  readonly payment: Payment;
  readonly onEdit?: (payment: Payment) => void;
  readonly onDelete?: (paymentId: string) => void;
}

export interface LoanFormProps extends Omit<FormProps, 'onSubmit'> {
  readonly loan?: Loan;
  readonly onSubmit: (loan: Loan) => void;
}

export interface PaymentFormProps extends Omit<FormProps, 'onSubmit'> {
  readonly payment?: Payment;
  readonly loans: readonly Loan[];
  readonly onSubmit: (payment: Payment) => void;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  readonly direction?: 'horizontal' | 'vertical';
  readonly justify?:
    | 'start'
    | 'end'
    | 'center'
    | 'space-around'
    | 'space-between';
  readonly align?: 'start' | 'end' | 'center' | 'stretch' | 'baseline';
  readonly wrap?: boolean;
  readonly gap?: number | string;
}

export interface SidebarProps extends BaseComponentProps {
  readonly collapsed?: boolean;
  readonly onCollapse?: (collapsed: boolean) => void;
  readonly width?: number;
  readonly collapsedWidth?: number;
  readonly theme?: 'light' | 'dark';
}

export interface HeaderProps extends BaseComponentProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly breadcrumbs?: readonly BreadcrumbItem[];
}

export interface BreadcrumbItem {
  readonly title: string;
  readonly href?: string;
  readonly onClick?: () => void;
}

// Page component props
export interface PageProps extends BaseComponentProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly loading?: boolean;
  readonly error?: string;
  readonly onRetry?: () => void;
  readonly actions?: ReactNode;
}

// Error boundary props
export interface ErrorBoundaryProps extends BaseComponentProps {
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  readonly resetOnPropsChange?: boolean;
  readonly resetKeys?: readonly unknown[];
}

// Higher-order component types
export type HOC<TProps = object> = <TComponent extends ComponentType<TProps>>(
  Component: TComponent
) => ComponentType<TProps & RefAttributes<TComponent>>;

// Component ref types
export interface ComponentRefType<T = HTMLElement> {
  readonly current: T | null;
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeEventHandler<T = HTMLInputElement> = (
  event: React.ChangeEvent<T>
) => void;
export type ClickEventHandler<T = HTMLElement> = (
  event: React.MouseEvent<T>
) => void;
export type FocusEventHandler<T = HTMLElement> = (
  event: React.FocusEvent<T>
) => void;
export type KeyboardEventHandler<T = HTMLElement> = (
  event: React.KeyboardEvent<T>
) => void;

// Form validation types
export interface ValidationRule {
  readonly required?: boolean;
  readonly message?: string;
  readonly pattern?: RegExp;
  readonly min?: number;
  readonly max?: number;
  readonly len?: number;
  readonly validator?: (
    value: unknown
  ) => boolean | string | Promise<boolean | string>;
}

export interface FormFieldProps {
  readonly name: string;
  readonly label?: string;
  readonly rules?: readonly ValidationRule[];
  readonly dependencies?: readonly string[];
  readonly normalize?: (value: unknown) => unknown;
  readonly transform?: (value: unknown) => unknown;
}

// API response types
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
}

export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly timestamp: Date;
}

// Loading states
export interface LoadingState {
  readonly isLoading: boolean;
  readonly error?: string;
  readonly retry?: () => void;
}

// Async state
export interface AsyncState<T = unknown> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly retry: () => void;
}

// Pagination state
export interface PaginationState {
  readonly current: number;
  readonly pageSize: number;
  readonly total: number;
  readonly showSizeChanger: boolean;
  readonly showQuickJumper: boolean;
}

// Filter state
export interface FilterState {
  readonly search?: string;
  readonly filters?: Record<string, unknown>;
  readonly sort?: {
    readonly field: string;
    readonly order: 'asc' | 'desc';
  };
}

// Component state types
export interface ComponentState {
  readonly loading: boolean;
  readonly error: string | null;
  readonly data: unknown;
}

// Props validation helpers
export type RequiredProps<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalProps<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Component composition types
export type ComponentWithChildren<T = object> = T & {
  readonly children: ReactNode;
};
export type ComponentWithClassName<T = object> = T & {
  readonly className?: string;
};
export type ComponentWithRef<T = object, R = HTMLElement> = T & {
  readonly ref?: React.Ref<R>;
};

// Utility types for components
export type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;
export type ComponentRef<T> =
  T extends ComponentType<infer P>
    ? P extends { ref?: React.Ref<infer R> }
      ? R
      : never
    : never;
