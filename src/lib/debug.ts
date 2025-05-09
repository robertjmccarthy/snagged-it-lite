// Simple debugging utility
export const debug = {
  log: (message: string, data?: any) => {
    if (typeof window !== 'undefined') {
      console.log(`%c${message}`, 'background: #FFD44D; color: #000; padding: 2px 4px; border-radius: 2px;', data || '');
    }
  },
  error: (message: string, error?: any) => {
    if (typeof window !== 'undefined') {
      console.error(`%c${message}`, 'background: #FF4D4D; color: #FFF; padding: 2px 4px; border-radius: 2px;', error || '');
    }
  }
};
