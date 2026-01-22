export const formatters = {
  currency: (amount: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  },

  number: (value: number): string => {
    return new Intl.NumberFormat('en-IN').format(value);
  },

  date: (date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string => {
    const d = new Date(date);

    const formats = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' } as const,
      long: { day: '2-digit', month: 'short', year: 'numeric' } as const,
      full: { day: '2-digit', month: 'long', year: 'numeric', weekday: 'short' } as const,
    };

    return new Intl.DateTimeFormat('en-IN', formats[format]).format(d);
  },

  time: (date: string | Date): string => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  },

  datetime: (date: string | Date): string => {
    const d = new Date(date);
    return `${formatters.date(d, 'short')} ${formatters.time(d)}`;
  },

  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  },

  employeeCode: (code: string): string => {
    return code.toUpperCase();
  },

  percentage: (value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  },

  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  duration: (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  },

  nameInitials: (firstName: string, lastName: string): string => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  },

  fullName: (firstName: string, lastName: string, middleName?: string): string => {
    return middleName
      ? `${firstName} ${middleName} ${lastName}`
      : `${firstName} ${lastName}`;
  },

  truncate: (text: string, length: number): string => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  titleCase: (text: string): string => {
    return text.split(' ').map(word => formatters.capitalize(word)).join(' ');
  },
};

export default formatters;
