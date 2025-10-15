import { toast } from 'react-toastify';

// Track active toasts to prevent duplicates
const activeToasts = new Set<string>();

/**
 * Show a success toast with duplicate prevention
 */
export const showSuccessToast = (message: string, options?: { preventDuplicate?: boolean }) => {
  const key = `success-${message}`;
  
  if (options?.preventDuplicate && activeToasts.has(key)) {
    return;
  }
  
  if (options?.preventDuplicate) {
    activeToasts.add(key);
    toast.success(message, {
      onClose: () => activeToasts.delete(key)
    });
  } else {
    toast.success(message);
  }
};

/**
 * Show an error toast with duplicate prevention
 */
export const showErrorToast = (message: string, options?: { preventDuplicate?: boolean }) => {
  const key = `error-${message}`;
  
  if (options?.preventDuplicate && activeToasts.has(key)) {
    return;
  }
  
  if (options?.preventDuplicate) {
    activeToasts.add(key);
    toast.error(message, {
      onClose: () => activeToasts.delete(key)
    });
  } else {
    toast.error(message);
  }
};

/**
 * Show an info toast with duplicate prevention
 */
export const showInfoToast = (message: string, options?: { preventDuplicate?: boolean }) => {
  const key = `info-${message}`;
  
  if (options?.preventDuplicate && activeToasts.has(key)) {
    return;
  }
  
  if (options?.preventDuplicate) {
    activeToasts.add(key);
    toast.info(message, {
      onClose: () => activeToasts.delete(key)
    });
  } else {
    toast.info(message);
  }
};

/**
 * Show a warning toast with duplicate prevention
 */
export const showWarningToast = (message: string, options?: { preventDuplicate?: boolean }) => {
  const key = `warning-${message}`;
  
  if (options?.preventDuplicate && activeToasts.has(key)) {
    return;
  }
  
  if (options?.preventDuplicate) {
    activeToasts.add(key);
    toast.warning(message, {
      onClose: () => activeToasts.delete(key)
    });
  } else {
    toast.warning(message);
  }
};

/**
 * Clear all active toasts
 */
export const clearAllToasts = () => {
  toast.dismiss();
  activeToasts.clear();
};

/**
 * Clear specific toast by message
 */
export const clearToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
  const key = `${type}-${message}`;
  activeToasts.delete(key);
  toast.dismiss();
};
