import React, { useState, useEffect } from 'react';
import {
  FileText, Calendar, DollarSign, AlertCircle, CheckCircle2,
  Clock, ArrowLeft, RefreshCw, TrendingUp, Zap
} from 'lucide-react';
import { Link } from "react-router-dom";
import axios from 'axios';

const StudentChallans = () => {
  const [challans, setChallans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallans();
  }, []);

  const fetchChallans = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:3000/app/v1/student/challans",
        { withCredentials: true }
      );

      if (response.data.success) {
        setChallans(response.data.data);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch challans');
      }
    } catch (err) {
      console.error('Error fetching challans:', err);
      setError(err.response?.data?.message || 'Failed to fetch your challans');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-300', icon: Clock },
      notified: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-300', icon: AlertCircle },
      paid: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-300', icon: CheckCircle2 },
      overdue: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-300', icon: Zap }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return { config, Icon };
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateFine = (dueDate, finePerDay) => {
    if (!isOverdue(dueDate)) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    const daysOverdue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
    return daysOverdue * finePerDay;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Back Button */}
      <Link
        to="/student/dashboard"
        className="mb-6 flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">My Challans</h1>
            <p className="text-white/70">View your semester payment challans</p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <RefreshCw className="w-8 h-8 text-white/50" />
          </div>
          <p className="ml-3 text-white/70">Loading your challans...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && challans.length === 0 && !error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Challans Yet</h3>
            <p className="text-white/70">Your Head of Department hasn't assigned any challans for your semester yet.</p>
          </div>
        </div>
      )}

      {/* Challans Grid */}
      {!isLoading && challans.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {challans.map((challan) => {
            const daysRemaining = getDaysRemaining(challan.dueDate);
            const fine = calculateFine(challan.dueDate, challan.fineAfterDueDate);
            const { config } = getStatusBadge(challan.assignedInfo?.status || 'pending');
            const StatusIcon = getStatusBadge(challan.assignedInfo?.status || 'pending').Icon;

            return (
              <div
                key={challan.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-white/30 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{challan.challanNumber}</h3>
                      <span className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-medium text-orange-300">
                        Semester {challan.semester}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{challan.description}</p>
                  </div>
                  <div className={`p-3 ${config.bg} border ${config.border} rounded-lg`}>
                    <StatusIcon className={`w-5 h-5 ${config.text}`} />
                  </div>
                </div>

                {/* Amount Section */}
                <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/20 rounded-xl p-4 mb-4">
                  <p className="text-sm text-white/70 mb-1">Challan Amount</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-6 h-6" />
                    {challan.amount.toLocaleString()}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Due Date */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-xs text-white/70 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {new Date(challan.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Days Remaining */}
                  <div className={`p-3 rounded-lg border ${
                    daysRemaining < 0
                      ? 'bg-red-500/10 border-red-500/20'
                      : daysRemaining < 7
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-green-500/10 border-green-500/20'
                  }`}>
                    <p className="text-xs text-white/70 mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {daysRemaining < 0 ? 'Overdue' : 'Days Left'}
                    </p>
                    <p className={`text-sm font-semibold ${
                      daysRemaining < 0
                        ? 'text-red-300'
                        : daysRemaining < 7
                        ? 'text-yellow-300'
                        : 'text-green-300'
                    }`}>
                      {Math.abs(daysRemaining)} days
                    </p>
                  </div>
                </div>

                {/* Status Info */}
                {challan.assignedInfo && (
                  <div className="space-y-3 mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                    {challan.assignedInfo.status === 'paid' ? (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/70">Amount Paid</span>
                          <span className="text-green-300 font-semibold">
                            {challan.assignedInfo.amountPaid.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/70">Payment Date</span>
                          <span className="text-white font-semibold">
                            {new Date(challan.assignedInfo.paidDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/70">Status</span>
                          <span className={`font-semibold ${config.text}`}>
                            {challan.assignedInfo.status.charAt(0).toUpperCase() + challan.assignedInfo.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/70">Assigned On</span>
                          <span className="text-white font-semibold">
                            {new Date(challan.assignedInfo.assignedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Fine Warning */}
                {fine > 0 && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <Zap className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-red-300 font-semibold">Late Payment Fine</p>
                      <p className="text-red-200/80">
                        Rs. {fine.toLocaleString()} accumulated
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg">
                  Make Payment
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Card */}
      {!isLoading && challans.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Amount */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Total Amount Due</p>
                <p className="text-2xl font-bold text-white">
                  Rs. {challans.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-orange-400/20" />
            </div>
          </div>

          {/* Pending Challans */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Pending Challans</p>
                <p className="text-2xl font-bold text-white">
                  {challans.filter(c => c.assignedInfo?.status !== 'paid').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400/20" />
            </div>
          </div>

          {/* Paid Challans */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Paid Challans</p>
                <p className="text-2xl font-bold text-white">
                  {challans.filter(c => c.assignedInfo?.status === 'paid').length}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-400/20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChallans;
