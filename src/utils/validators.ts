export const validators = {
  pan: (value: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(value.toUpperCase());
  },

  gst: (value: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(value.toUpperCase());
  },

  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.toLowerCase());
  },

  phone: (value: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  pincode: (value: string): boolean => {
    const pincodeRegex = /^[0-9]{6}$/;
    return pincodeRegex.test(value);
  },

  formatPAN: (value: string): string => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
  },

  formatGST: (value: string): string => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 15);
  },

  formatPhone: (value: string): string => {
    return value.replace(/[^0-9]/g, '').substring(0, 10);
  },

  formatPincode: (value: string): string => {
    return value.replace(/[^0-9]/g, '').substring(0, 6);
  }
};

export const errorMessages = {
  pan: 'Invalid PAN format. Expected format: ABCDE1234F',
  gst: 'Invalid GST format. Expected format: 22ABCDE1234F1Z5',
  email: 'Invalid email address',
  phone: 'Phone number must be 10 digits',
  pincode: 'Pincode must be 6 digits',
  required: 'This field is required'
};