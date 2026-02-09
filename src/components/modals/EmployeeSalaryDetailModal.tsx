import { useState, useEffect } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { payrollRunAPI } from '../../lib/payroll-run';

interface SalaryComponent {
  component_name: string;
  component_type: string;
  calculation_type: string;
  component_value: number;
  calculated_amount: number;
}

interface Adjustment {
  id?: string;
  adjustment_type: string;
  amount: number;
  description: string;
}

interface EmployeeSalaryDetailModalProps {
  payrollItem: any;
  onClose: () => void;
}

export default function EmployeeSalaryDetailModal({
  payrollItem,
  onClose
}: EmployeeSalaryDetailModalProps) {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdjustment, setShowAddAdjustment] = useState(false);
  const [newAdjustment, setNewAdjustment] = useState<Adjustment>({
    adjustment_type: 'incentive',
    amount: 0,
    description: ''
  });

  useEffect(() => {
    loadSalaryDetails();
  }, [payrollItem.id]);

  const loadSalaryDetails = async () => {
    setLoading(true);
    try {
      const data = await payrollRunAPI.getAttendanceSummary(payrollItem.id);
      if (data.components) setComponents(data.components);
      if (data.adjustments) setAdjustments(data.adjustments);
    } catch (error) {
      console.error('Error loading salary details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdjustment = async () => {
    if (!newAdjustment.description || newAdjustment.amount === 0) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await payrollRunAPI.addPayrollAdjustment({
        payrollItemId: payrollItem.id,
        ...newAdjustment
      });

      setShowAddAdjustment(false);
      setNewAdjustment({
        adjustment_type: 'incentive',
        amount: 0,
        description: ''
      });
      loadSalaryDetails();
    } catch (error) {
      console.error('Error adding adjustment:', error);
      alert('Failed to add adjustment');
    }
  };

  const earningsComponents = components.filter(c => c.component_type === 'earning');
  const deductionComponents = components.filter(c => c.component_type === 'deduction');

  const earningsAdjustments = adjustments.filter(a =>
    ['incentive', 'bonus', 'overtime', 'reimbursement'].includes(a.adjustment_type)
  );
  const deductionAdjustments = adjustments.filter(a =>
    ['early_fine', 'late_fine', 'loan', 'other_deduction'].includes(a.adjustment_type)
  );

  const totalEarnings = earningsComponents.reduce((sum, c) => sum + c.calculated_amount, 0) +
    earningsAdjustments.reduce((sum, a) => sum + a.amount, 0);

  const totalDeductions = deductionComponents.reduce((sum, c) => sum + c.calculated_amount, 0) +
    deductionAdjustments.reduce((sum, a) => sum + a.amount, 0);

  const getAdjustmentLabel = (type: string) => {
    const labels: any = {
      incentive: 'Incentive',
      bonus: 'Bonus Wage',
      overtime: 'Overtime Pay',
      reimbursement: 'Reimbursements',
      early_fine: 'Early Fine',
      late_fine: 'Late Fine',
      loan: 'Loan Deduction',
      other_deduction: 'Other Deduction'
    };
    return labels[type] || type;
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Salary Breakdown</h2>
            <p className="text-sm text-slate-600 mt-1">{payrollItem.employee_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading salary details...</div>
        ) : (
          <>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-xs text-slate-700 font-medium">Monthly CTC</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    ₹{payrollItem.monthly_ctc?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs text-green-700 font-medium">Gross Earnings</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">
                    ₹{payrollItem.gross_earnings?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs text-blue-700 font-medium">Net Salary</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    ₹{payrollItem.net_salary?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-900">
                    <strong>Payable Days:</strong> {payrollItem.payable_days} / {payrollItem.total_days} days
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Prorated Ratio:</strong> {((payrollItem.payable_days / payrollItem.total_days) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Earnings
                    </h3>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowAddAdjustment(true)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-700 mb-2">Base Components</p>
                      {earningsComponents.map((comp, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span className="text-slate-700">{comp.component_name}</span>
                          <span className="font-medium text-slate-900">
                            ₹{comp.calculated_amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {earningsAdjustments.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-green-700 mb-2">Additional Earnings</p>
                        {earningsAdjustments.map((adj, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <div>
                              <span className="text-green-700">{getAdjustmentLabel(adj.adjustment_type)}</span>
                              {adj.description && (
                                <p className="text-xs text-green-600">{adj.description}</p>
                              )}
                            </div>
                            <span className="font-medium text-green-900">
                              ₹{adj.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t-2 border-green-600 pt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-900">Total Earnings</span>
                        <span className="text-green-600">₹{totalEarnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    Deductions
                  </h3>

                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-700 mb-2">Statutory Deductions</p>
                      {deductionComponents.map((comp, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span className="text-slate-700">{comp.component_name}</span>
                          <span className="font-medium text-slate-900">
                            ₹{comp.calculated_amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {deductionAdjustments.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-red-700 mb-2">Other Deductions</p>
                        {deductionAdjustments.map((adj, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <div>
                              <span className="text-red-700">{getAdjustmentLabel(adj.adjustment_type)}</span>
                              {adj.description && (
                                <p className="text-xs text-red-600">{adj.description}</p>
                              )}
                            </div>
                            <span className="font-medium text-red-900">
                              ₹{adj.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="border-t-2 border-red-600 pt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-900">Total Deductions</span>
                        <span className="text-red-600">₹{totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Net Payable Salary</p>
                    <p className="text-3xl font-bold mt-1">
                      ₹{payrollItem.net_salary?.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-12 w-12 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        )}

        {showAddAdjustment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="border-b border-slate-200 p-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Add Adjustment</h3>
                <button
                  onClick={() => setShowAddAdjustment(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adjustment Type
                  </label>
                  <select
                    value={newAdjustment.adjustment_type}
                    onChange={(e) =>
                      setNewAdjustment({ ...newAdjustment, adjustment_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <optgroup label="Earnings">
                      <option value="incentive">Incentive</option>
                      <option value="bonus">Bonus Wage</option>
                      <option value="overtime">Overtime Pay</option>
                      <option value="reimbursement">Reimbursements</option>
                    </optgroup>
                    <optgroup label="Deductions">
                      <option value="early_fine">Early Fine</option>
                      <option value="late_fine">Late Fine</option>
                      <option value="loan">Loan Deduction</option>
                      <option value="other_deduction">Other Deduction</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    value={newAdjustment.amount}
                    onChange={(e) =>
                      setNewAdjustment({ ...newAdjustment, amount: parseFloat(e.target.value) })
                    }
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newAdjustment.description}
                    onChange={(e) =>
                      setNewAdjustment({ ...newAdjustment, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setShowAddAdjustment(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddAdjustment}>Add Adjustment</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
