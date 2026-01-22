// import { useState } from 'react';
// import { FileText, Plus, Search, Filter, Download, Upload, Eye, X } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import Modal from '../components/ui/Modal';

// export default function Documents() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [typeFilter, setTypeFilter] = useState('');
//     const [showUploadModal, setShowUploadModal] = useState(false);
//     const [showGenerateModal, setShowGenerateModal] = useState(false);
//     const [uploadedFile, setUploadedFile] = useState<string | null>(null);

//     const documents = [
//         { id: 1, name: 'Employment Contract - John Doe', type: 'Contract', employee: 'John Doe', size: '245 KB', uploaded: '2026-01-01', status: 'active' },
//         { id: 2, name: 'Salary Slip - December 2025', type: 'Payslip', employee: 'All Employees', size: '128 KB', uploaded: '2025-12-31', status: 'active' },
//         { id: 3, name: 'Leave Application Form', type: 'Form', employee: 'Sarah Johnson', size: '89 KB', uploaded: '2025-12-28', status: 'active' },
//         { id: 4, name: 'Tax Documents - FY 2025', type: 'Tax', employee: 'Finance Officer', size: '512 KB', uploaded: '2025-12-25', status: 'active' },
//         { id: 5, name: 'Offer Letter - New Hire', type: 'Offer Letter', employee: 'Emma Williams', size: '156 KB', uploaded: '2025-12-20', status: 'active' },
//     ];

//     const filteredDocuments = documents.filter(doc => {
//         const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             doc.employee.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesType = !typeFilter || doc.type === typeFilter;
//         return matchesSearch && matchesType;
//     });

//     const documentTypes = [...new Set(documents.map(d => d.type))];

//     const handleUpload = () => {
//         alert('Document uploaded successfully!');
//         setShowUploadModal(false);
//     };

//     const handleGenerate = () => {
//         alert('Document generated successfully!');
//         setShowGenerateModal(false);
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div className="flex gap-2">
//                     <Button variant="secondary" onClick={() => setShowUploadModal(true)}>
//                         <Upload className="h-4 w-4 mr-2" />
//                         Upload
//                     </Button>
//                     <Button onClick={() => setShowGenerateModal(true)}>
//                         <Plus className="h-4 w-4 mr-2" />
//                         Generate Document
//                     </Button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Total Documents</p>
//                             <p className="text-3xl font-bold text-slate-900 mt-2">45</p>
//                             <p className="text-xs text-slate-500 mt-1">All categories</p>
//                         </div>
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <FileText className="h-6 w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Contracts</p>
//                             <p className="text-3xl font-bold text-purple-600 mt-2">12</p>
//                             <p className="text-xs text-slate-500 mt-1">Employment contracts</p>
//                         </div>
//                         <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                             <FileText className="h-6 w-6 text-purple-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Payslips</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">18</p>
//                             <p className="text-xs text-slate-500 mt-1">Salary slips</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <FileText className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">This Month</p>
//                             <p className="text-3xl font-bold text-yellow-600 mt-2">8</p>
//                             <p className="text-xs text-slate-500 mt-1">New documents</p>
//                         </div>
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <FileText className="h-6 w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Documents</h2>
//                     <div className="flex items-center justify-between gap-4 flex-wrap">
//                         <div className="flex-1 min-w-64 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                 <Input
//                                     type="text"
//                                     placeholder="Search documents..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>
//                         <select
//                             value={typeFilter}
//                             onChange={(e) => setTypeFilter(e.target.value)}
//                             className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="">All Types</option>
//                             {documentTypes.map(type => (
//                                 <option key={type} value={type}>{type}</option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50 border-b border-slate-200">
//                             <tr>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Document Name</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Type</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Size</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Uploaded</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {filteredDocuments.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
//                                         No documents found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredDocuments.map((doc) => (
//                                     <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                                                     <FileText className="h-5 w-5 text-blue-600" />
//                                                 </div>
//                                                 <p className="font-medium text-slate-900">{doc.name}</p>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <Badge variant="info">{doc.type}</Badge>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{doc.employee}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{doc.size}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{doc.uploaded}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <Badge variant="success">{doc.status}</Badge>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
//                                                     <Eye className="h-4 w-4 text-slate-600" />
//                                                 </button>
//                                                 <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
//                                                     <Download className="h-4 w-4 text-slate-600" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="md">
//                 <div className="p-6">
//                     <h2 className="text-xl font-bold text-slate-900 mb-4">Upload Document</h2>
//                     <div className="space-y-4">
//                         <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
//                             <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
//                             <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
//                             <p className="text-sm text-slate-600 mt-1">PDF, DOC, DOCX up to 10MB</p>
//                         </div>
//                         <div className="grid grid-cols-2 gap-2">
//                             <Input type="text" placeholder="Document title" />
//                             <select className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
//                                 <option>Contract</option>
//                                 <option>Payslip</option>
//                                 <option>Form</option>
//                                 <option>Tax</option>
//                             </select>
//                         </div>
//                         <div className="flex gap-2 justify-end pt-4">
//                             <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
//                                 Cancel
//                             </Button>
//                             <Button onClick={handleUpload}>
//                                 Upload Document
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </Modal>

//             <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} size="md">
//                 <div className="p-6">
//                     <h2 className="text-xl font-bold text-slate-900 mb-4">Generate Document</h2>
//                     <div className="space-y-3 mb-6">
//                         <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
//                             <p className="font-medium text-slate-900">Offer Letter</p>
//                             <p className="text-xs text-slate-600 mt-1">Generate offer letter for new hires</p>
//                         </div>
//                         <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
//                             <p className="font-medium text-slate-900">Experience Certificate</p>
//                             <p className="text-xs text-slate-600 mt-1">Issue experience certificate</p>
//                         </div>
//                         <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
//                             <p className="font-medium text-slate-900">Payslip</p>
//                             <p className="text-xs text-slate-600 mt-1">Generate monthly payslips</p>
//                         </div>
//                     </div>
//                     <div className="flex gap-2 justify-end">
//                         <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleGenerate}>
//                             Generate
//                         </Button>
//                     </div>
//                 </div>
//             </Modal>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <Card className="p-6">
//                     <h3 className="font-semibold text-slate-900 mb-4">Document Templates</h3>
//                     <div className="space-y-3">
//                         <button className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
//                             <p className="font-medium text-slate-900">Offer Letter</p>
//                             <p className="text-xs text-slate-600 mt-1">Generate offer letter for new hires</p>
//                         </button>
//                         <button className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
//                             <p className="font-medium text-slate-900">Experience Certificate</p>
//                             <p className="text-xs text-slate-600 mt-1">Issue experience certificate</p>
//                         </button>
//                         <button className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
//                             <p className="font-medium text-slate-900">Payslip</p>
//                             <p className="text-xs text-slate-600 mt-1">Generate monthly payslips</p>
//                         </button>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
//                     <div className="space-y-3">
//                         <Button variant="secondary" className="w-full justify-start" onClick={() => setShowUploadModal(true)}>
//                             <Upload className="h-4 w-4 mr-2" />
//                             Bulk Upload Documents
//                         </Button>
//                         <Button variant="secondary" className="w-full justify-start" onClick={() => alert('Downloading all documents...')}>
//                             <Download className="h-4 w-4 mr-2" />
//                             Download All
//                         </Button>
//                         <Button variant="secondary" className="w-full justify-start" onClick={() => alert('Generating report...')}>
//                             <FileText className="h-4 w-4 mr-2" />
//                             Generate Report
//                         </Button>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <h3 className="font-semibold text-slate-900 mb-4">Storage Usage</h3>
//                     <div className="space-y-4">
//                         <div>
//                             <div className="flex items-center justify-between mb-2">
//                                 <span className="text-sm text-slate-600">Used Space</span>
//                                 <span className="text-sm font-semibold text-slate-900">2.4 GB / 10 GB</span>
//                             </div>
//                             <div className="w-full bg-slate-200 rounded-full h-2">
//                                 <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
//                             </div>
//                         </div>
//                         <div className="pt-3 border-t border-slate-200">
//                             <div className="flex items-center justify-between text-sm mb-2">
//                                 <span className="text-slate-600">Documents</span>
//                                 <span className="text-slate-900">1.8 GB</span>
//                             </div>
//                             <div className="flex items-center justify-between text-sm">
//                                 <span className="text-slate-600">Images</span>
//                                 <span className="text-slate-900">0.6 GB</span>
//                             </div>
//                         </div>
//                     </div>
//                 </Card>
//             </div>
//         </div>
//     );
// }

import { useState } from 'react';
import { FileText, Plus, Search, Filter, Download, Upload, Eye, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

export default function Documents() {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);

    const documents = [
        { id: 1, name: 'Employment Contract - John Doe', type: 'Contract', employee: 'John Doe', size: '245 KB', uploaded: '2026-01-01', status: 'active' },
        { id: 2, name: 'Salary Slip - December 2025', type: 'Payslip', employee: 'All Employees', size: '128 KB', uploaded: '2025-12-31', status: 'active' },
        { id: 3, name: 'Leave Application Form', type: 'Form', employee: 'Sarah Johnson', size: '89 KB', uploaded: '2025-12-28', status: 'active' },
        { id: 4, name: 'Tax Documents - FY 2025', type: 'Tax', employee: 'Finance Officer', size: '512 KB', uploaded: '2025-12-25', status: 'active' },
        { id: 5, name: 'Offer Letter - New Hire', type: 'Offer Letter', employee: 'Emma Williams', size: '156 KB', uploaded: '2025-12-20', status: 'active' },
    ];

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.employee.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = !typeFilter || doc.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const documentTypes = [...new Set(documents.map(d => d.type))];

    const handleUpload = () => {
        alert('Document uploaded successfully!');
        setShowUploadModal(false);
    };

    const handleGenerate = () => {
        alert('Document generated successfully!');
        setShowGenerateModal(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Document Management</h1>
                    <p className="text-slate-600 mt-1">Manage and generate employee documents</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setShowUploadModal(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                    </Button>
                    <Button onClick={() => setShowGenerateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Document
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Documents</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">45</p>
                            <p className="text-xs text-slate-500 mt-1">All categories</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Contracts</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">12</p>
                            <p className="text-xs text-slate-500 mt-1">Employment contracts</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Payslips</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">18</p>
                            <p className="text-xs text-slate-500 mt-1">Salary slips</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">This Month</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">8</p>
                            <p className="text-xs text-slate-500 mt-1">New documents</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Documents</h2>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-64 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Types</option>
                            {documentTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Document Name</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Size</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Uploaded</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredDocuments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No documents found
                                    </td>
                                </tr>
                            ) : (
                                filteredDocuments.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <p className="font-medium text-slate-900">{doc.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="info">{doc.type}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{doc.employee}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{doc.size}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{doc.uploaded}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="success">{doc.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <Eye className="h-4 w-4 text-slate-600" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <Download className="h-4 w-4 text-slate-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} size="md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Upload Document</h2>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                            <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                            <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-600 mt-1">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input type="text" placeholder="Document title" />
                            <select className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
                                <option>Contract</option>
                                <option>Payslip</option>
                                <option>Form</option>
                                <option>Tax</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpload}>
                                Upload Document
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} size="md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Generate Document</h2>
                    <div className="space-y-3 mb-6">
                        <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <p className="font-medium text-slate-900">Offer Letter</p>
                            <p className="text-xs text-slate-600 mt-1">Generate offer letter for new hires</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <p className="font-medium text-slate-900">Experience Certificate</p>
                            <p className="text-xs text-slate-600 mt-1">Issue experience certificate</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                            <p className="font-medium text-slate-900">Payslip</p>
                            <p className="text-xs text-slate-600 mt-1">Generate monthly payslips</p>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerate}>
                            Generate
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Document Templates</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                            <p className="font-medium text-slate-900">Offer Letter</p>
                            <p className="text-xs text-slate-600 mt-1">Generate offer letter for new hires</p>
                        </button>
                        <button className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                            <p className="font-medium text-slate-900">Experience Certificate</p>
                            <p className="text-xs text-slate-600 mt-1">Issue experience certificate</p>
                        </button>
                        <button className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                            <p className="font-medium text-slate-900">Payslip</p>
                            <p className="text-xs text-slate-600 mt-1">Generate monthly payslips</p>
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Button variant="secondary" className="w-full justify-start" onClick={() => setShowUploadModal(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Bulk Upload Documents
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => alert('Downloading all documents...')}>
                            <Download className="h-4 w-4 mr-2" />
                            Download All
                        </Button>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => alert('Generating report...')}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Storage Usage</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-600">Used Space</span>
                                <span className="text-sm font-semibold text-slate-900">2.4 GB / 10 GB</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                            </div>
                        </div>
                        <div className="pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600">Documents</span>
                                <span className="text-slate-900">1.8 GB</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Images</span>
                                <span className="text-slate-900">0.6 GB</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
