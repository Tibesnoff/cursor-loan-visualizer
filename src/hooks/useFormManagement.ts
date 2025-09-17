import { useState, useCallback, useRef, useEffect } from 'react';
import { Form } from 'antd';
import { createCleanupFunction } from '../utils/memoryUtils';

export interface UseFormManagementOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  resetOnSuccess?: boolean;
  resetOnCancel?: boolean;
}

export interface UseFormManagementReturn {
  form: any;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  handleSubmit: (submitFn: () => Promise<void>) => Promise<void>;
  handleCancel: () => void;
  resetForm: () => void;
  setFormValues: (values: any) => void;
}

/**
 * Shared hook for form management with common patterns
 */
export const useFormManagement = (
  options: UseFormManagementOptions = {}
): UseFormManagementReturn => {
  const {
    onSuccess,
    onError,
    resetOnSuccess = true,
    resetOnCancel = true,
  } = options;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const cleanup = useRef(createCleanupFunction());

  // Cleanup on unmount
  useEffect(() => {
    const cleanupFn = cleanup.current;
    return () => {
      cleanupFn.cleanup();
    };
  }, []);

  const handleSubmit = useCallback(
    async (submitFn: () => Promise<void>) => {
      setLoading(true);
      try {
        await submitFn();
        if (resetOnSuccess) {
          form.resetFields();
        }
        onSuccess?.();
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error('Unknown error occurred');
        onError?.(errorObj);
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    },
    [form, resetOnSuccess, onSuccess, onError]
  );

  const handleCancel = useCallback(() => {
    if (resetOnCancel) {
      form.resetFields();
    }
  }, [form, resetOnCancel]);

  const resetForm = useCallback(() => {
    form.resetFields();
  }, [form]);

  const setFormValues = useCallback(
    (values: any) => {
      form.setFieldsValue(values);
    },
    [form]
  );

  return {
    form,
    loading,
    setLoading,
    handleSubmit,
    handleCancel,
    resetForm,
    setFormValues,
  };
};
