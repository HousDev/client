import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { countryCodes, CountryCode } from '../utils/countryCodes';
import { validators } from '../utils/validators';

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string) => void;
  onCountryCodeChange: (code: string) => void;
  label: string;
  required?: boolean;
  error?: string;
}

export default function PhoneInput({
  value,
  countryCode,
  onChange,
  onCountryCodeChange,
  label,
  required = false,
  error
}: PhoneInputProps) {
  const [showCountries, setShowCountries] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCountry = countryCodes.find(c => c.dialCode === countryCode) || countryCodes[0];

  const filteredCountries = countryCodes.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dialCode.includes(searchTerm)
  );

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = validators.formatPhone(e.target.value);
    onChange(formatted);
  };

  const selectCountry = (country: CountryCode) => {
    onCountryCodeChange(country.dialCode);
    setShowCountries(false);
    setSearchTerm('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="relative w-32">
          <button
            type="button"
            onClick={() => setShowCountries(!showCountries)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between text-sm transition"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="font-medium">{selectedCountry.dialCode}</span>
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showCountries && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCountries(false)}
              />
              <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="overflow-y-auto max-h-64">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => selectCountry(country)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center gap-3 transition"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-sm">{country.name}</span>
                      <span className="text-sm font-medium text-gray-600">
                        {country.dialCode}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex-1">
          <input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder="9876543210"
            maxLength={10}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            required={required}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {value && !validators.phone(value) && (
        <p className="mt-1 text-sm text-orange-600">Phone number must be 10 digits</p>
      )}
    </div>
  );
}