import React, { useState } from 'react';
import { Mail, MessageSquare, Check, X, Settings, Eye, EyeOff, XCircle, Save } from 'lucide-react';

// SMTP Configuration Modal Component
const SMTPConfigModal = ({ isOpen, onClose, initialData }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log('SMTP Configuration:', formData);
        alert('SMTP Configuration saved successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 border-b border-blue-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-lg">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Configure SMTP</h2>
                                <p className="text-sm text-blue-100 mt-1">Email Integration</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-blue-700 rounded-xl transition-colors">
                            <XCircle className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                SMTP Host <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.host || ''}
                                onChange={(e) => handleInputChange('host', e.target.value)}
                                placeholder="smtp.gmail.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Port <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.port || ''}
                                onChange={(e) => handleInputChange('port', e.target.value)}
                                placeholder="587"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Username/Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.username || ''}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                placeholder="your-email@gmail.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password || ''}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="Your password or app password"
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                From Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fromName || ''}
                                onChange={(e) => handleInputChange('fromName', e.target.value)}
                                placeholder="Your Company"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                From Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.fromEmail || ''}
                                onChange={(e) => handleInputChange('fromEmail', e.target.value)}
                                placeholder="noreply@yourcompany.com"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-800">
                                💡 For Gmail, you need to use App Password instead of your regular password. Enable 2-step verification and generate an app password from your Google Account settings.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Save className="w-5 h-5" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// SMS Configuration Modal Component
const SMSConfigModal = ({ isOpen, onClose, initialData }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [showToken, setShowToken] = useState(false);

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        console.log('SMS Configuration:', formData);
        alert('SMS Configuration saved successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 border-b border-green-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-lg">
                                <MessageSquare className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Configure SMS</h2>
                                <p className="text-sm text-green-100 mt-1">SMS Integration</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-green-700 rounded-xl transition-colors">
                            <XCircle className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                SMS Provider <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.smsProvider || ''}
                                onChange={(e) => handleInputChange('smsProvider', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            >
                                <option value="">Select Provider</option>
                                <option value="twilio">Twilio</option>
                                <option value="nexmo">Nexmo (Vonage)</option>
                                <option value="msg91">MSG91</option>
                                <option value="textlocal">Textlocal</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Account SID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.accountSid || ''}
                                onChange={(e) => handleInputChange('accountSid', e.target.value)}
                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Auth Token <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    value={formData.authToken || ''}
                                    onChange={(e) => handleInputChange('authToken', e.target.value)}
                                    placeholder="Your Auth Token"
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                From Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.fromNumber || ''}
                                onChange={(e) => handleInputChange('fromNumber', e.target.value)}
                                placeholder="+1234567890"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sender Name
                            </label>
                            <input
                                type="text"
                                value={formData.senderName || ''}
                                onChange={(e) => handleInputChange('senderName', e.target.value)}
                                placeholder="Your Company"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
                            <p className="text-sm text-green-800">
                                💡 Make sure your phone number is verified with your SMS provider. For Twilio, you can find your Account SID and Auth Token in the Twilio Console Dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Save className="w-5 h-5" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// WhatsApp Configuration Modal Component
const WhatsAppConfigModal = ({ isOpen, onClose, initialData }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [showToken, setShowToken] = useState({});

    if (!isOpen) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleToken = (field) => {
        setShowToken(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = () => {
        console.log('WhatsApp Configuration:', formData);
        alert('WhatsApp Configuration saved successfully!');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 border-b border-emerald-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-xl shadow-lg">
                                <MessageSquare className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Configure WhatsApp Business</h2>
                                <p className="text-sm text-emerald-100 mt-1">Meta WhatsApp Cloud API</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-emerald-700 rounded-xl transition-colors">
                            <XCircle className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.phoneNumberId || ''}
                                onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                                placeholder="1234567890123456"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Access Token <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken.accessToken ? 'text' : 'password'}
                                    value={formData.accessToken || ''}
                                    onChange={(e) => handleInputChange('accessToken', e.target.value)}
                                    placeholder="EAAxxxxxxxxxxxxxxxxxx"
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleToken('accessToken')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showToken.accessToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Business Account ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.businessAccountId || ''}
                                onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                                placeholder="1234567890123456"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Webhook Verify Token
                            </label>
                            <div className="relative">
                                <input
                                    type={showToken.webhookToken ? 'text' : 'password'}
                                    value={formData.webhookVerifyToken || ''}
                                    onChange={(e) => handleInputChange('webhookVerifyToken', e.target.value)}
                                    placeholder="Your custom verify token"
                                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleToken('webhookToken')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showToken.webhookToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl">
                            <p className="text-sm text-emerald-800 mb-2">
                                💡 <strong>Setup Instructions:</strong>
                            </p>
                            <ul className="text-sm text-emerald-700 space-y-1 ml-4 list-disc">
                                <li>Go to Meta for Developers and create a WhatsApp Business App</li>
                                <li>Add WhatsApp product to your app</li>
                                <li>Copy your Phone Number ID from the API Setup page</li>
                                <li>Generate a permanent access token</li>
                                <li>Copy your Business Account ID from Settings</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Save className="w-5 h-5" />
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Integrations Component
const IntegrationsPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [modals, setModals] = useState({
        smtp: false,
        sms: false,
        whatsapp: false
    });

    const categories = [
        { id: 'all', label: 'All Integrations' },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'communication', label: 'Communication', icon: MessageSquare },
    ];

    const integrations = [
        {
            id: 'smtp',
            name: 'SMTP',
            provider: 'SMTP',
            category: 'email',
            icon: Mail,
            description: 'Send and receive emails via SMTP (Gmail/Zoho/SES/Mailgun).',
            connected: false,
            setupText: 'Save SMTP settings to enable email sending.',
            bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-200',
        },
        {
            id: 'sms',
            name: 'SMS Integration',
            provider: 'Twilio',
            category: 'communication',
            icon: MessageSquare,
            description: 'Send SMS messages through your configured provider.',
            connected: true,
            setupText: 'Configure your SMS provider to send notifications and alerts.',
            bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-green-200',
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            provider: 'Meta',
            category: 'communication',
            icon: MessageSquare,
            description: 'WhatsApp messaging for customer communication.',
            connected: false,
            setupText: 'Connect Meta WhatsApp Cloud API to enable WhatsApp messaging.',
            bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-200',
        }
    ];

    const filteredIntegrations = activeTab === 'all'
        ? integrations
        : integrations.filter(int => int.category === activeTab);

    const openModal = (integrationId) => {
        setModals(prev => ({ ...prev, [integrationId]: true }));
    };

    const closeModal = (integrationId) => {
        setModals(prev => ({ ...prev, [integrationId]: false }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Category Tabs */}
            <div className="bg-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all transform hover:scale-105 ${activeTab === cat.id
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {Icon && <Icon className="w-5 h-5" />}
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Integrations Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIntegrations.map((integration) => {
                        const Icon = integration.icon;
                        return (
                            <div
                                key={integration.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
                            >
                                {/* Card Header */}
                                <div className="p-6 border-b-2 border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            <div className={`${integration.bgColor} p-3 sm:p-4 rounded-2xl shadow-md border-2 ${integration.borderColor} flex-shrink-0`}>
                                                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${integration.iconColor}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{integration.name}</h3>
                                                <p className="text-sm text-gray-500 font-medium">{integration.provider}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                            {integration.connected ? (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            ) : (
                                                <X className="w-5 h-5 text-gray-400" />
                                            )}
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={integration.connected}
                                                    readOnly
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{integration.description}</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                                    <div className={`${integration.connected ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'} border-2 rounded-xl p-4 mb-4 shadow-sm`}>
                                        <p className={`text-sm font-medium ${integration.connected ? 'text-green-800' : 'text-red-800'}`}>
                                            {integration.setupText}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => openModal(integration.id)}
                                        className={`w-full flex items-center justify-center gap-2 ${integration.connected ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'} text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg transform hover:scale-105`}
                                    >
                                        <Settings className="w-5 h-5" />
                                        Configure
                                    </button>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                                        <span className="text-gray-500 font-medium">Status:</span>
                                        {integration.connected ? (
                                            <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                                <Check className="w-4 h-4" />
                                                Connected
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full">Not Connected</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modals */}
            <SMTPConfigModal
                isOpen={modals.smtp}
                onClose={() => closeModal('smtp')}
                initialData={{}}
            />
            <SMSConfigModal
                isOpen={modals.sms}
                onClose={() => closeModal('sms')}
                initialData={{}}
            />
            <WhatsAppConfigModal
                isOpen={modals.whatsapp}
                onClose={() => closeModal('whatsapp')}
                initialData={{}}
            />
        </div>
    );
};

export default IntegrationsPage;