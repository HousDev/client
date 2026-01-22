export const helpers = {
  calculateWorkingDays: (startDate: string, endDate: string, excludeWeekends: boolean = true): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (excludeWeekends && (d.getDay() === 0 || d.getDay() === 6)) {
        continue;
      }
      count++;
    }

    return count;
  },

  calculateDateDifference: (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  },

  getFinancialYear: (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month >= 3) {
      return `${year}-${(year + 1).toString().slice(2)}`;
    }
    return `${year - 1}-${year.toString().slice(2)}`;
  },

  getCurrentMonthYear: (): string => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  },

  getMonthName: (monthNumber: number): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  },

  calculateAge: (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  },

  calculateTenure: (joiningDate: string): { years: number; months: number } => {
    const joined = new Date(joiningDate);
    const today = new Date();

    let years = today.getFullYear() - joined.getFullYear();
    let months = today.getMonth() - joined.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months };
  },

  generateEmployeeCode: (prefix: string, sequence: number): string => {
    return `${prefix}${String(sequence).padStart(4, '0')}`;
  },

  generateRandomPassword: (length: number = 12): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  },

  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  },

  groupBy: <T>(array: T[], key: keyof T): Record<string, T[]> => {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {} as Record<string, T[]>);
  },

  sortBy: <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  downloadFile: (content: string, filename: string, type: string = 'text/plain'): void => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },

  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  },

  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },

  getRandomColor: (): string => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

export default helpers;
