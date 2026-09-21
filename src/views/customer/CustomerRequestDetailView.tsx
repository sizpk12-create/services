/**
 * You Want Services - Customer Service Request Detail View
 * Phase 4 Architecture
 *
 * Implements:
 * - Request Information (ID, Service, Subcategory, Project, Description, Status, Dates)
 * - Location, Schedule, Photos, Additional Notes
 * - Real activity log timeline
 * - Customer cancellation workflow with reason modal
 * - Strict customer privacy / authorization checks
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { serviceRequestService } from '../../services/serviceRequestService';
import { INITIAL_SERVICE_CATEGORIES, INITIAL_SERVICE_SUBCATEGORIES } from '../../config/categories';
import { ServiceRequest } from '../../types/database';
import {
  Button,
  Badge,
  Card,
  Modal,
  Alert,
} from '../../components/common/UIComponents';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  X,
  History,
  ShieldCheck,
} from 'lucide-react';

export const CustomerRequestDetailView: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate, routeParams } = useNavigation();
  const requestId = routeParams?.id;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('No longer needed');
  const [cancelNotes, setCancelNotes] = useState<string>('');
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string>('');

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const loadRequest = () => {
    if (!requestId) {
      setErrorMessage('No service request specified.');
      setLoading(false);
      return;
    }

    const result = serviceRequestService.getRequestById(
      requestId,
      currentUser?.id,
      currentUser?.role
    );

    if (!result.authorized) {
      setAuthorized(false);
      setErrorMessage(result.reason || 'You are not authorized to view this service request.');
      setLoading(false);
      return;
    }

    if (!result.request) {
      setErrorMessage('Service request not found.');
      setLoading(false);
      return;
    }

    setRequest(result.request);
    setAuthorized(true);
    setLoading(false);
  };

  useEffect(() => {
    loadRequest();
  }, [requestId, currentUser]);

  const handleConfirmCancel = () => {
    if (!request || !currentUser) return;
    setCancelling(true);
    setCancelError('');

    const res = serviceRequestService.cancelServiceRequest(
      request.id,
      cancelReason,
      cancelNotes,
      currentUser
    );

    setCancelling(false);

    if (!res.success) {
      setCancelError(res.error || 'Failed to cancel request.');
      return;
    }

    setCancelModalOpen(false);
    loadRequest();
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading service request details...</p>
      </div>
    );
  }

  if (!authorized || !request) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <Card className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600">
            {errorMessage || 'You do not have authorization to view this service request.'}
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('customer-my-requests')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to My Requests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const category = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === request.categoryId);
  const subcategory = INITIAL_SERVICE_SUBCATEGORIES.find((s) => s.id === request.serviceSubcategoryId);

  const canCancel =
    (request.status === 'SUBMITTED' || request.status === 'DRAFT' || request.status === 'UNDER_REVIEW') &&
    (currentUser?.id === request.customerId || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN');

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'info';
      case 'MATCHING':
        return 'warning';
      case 'SCHEDULED':
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'DRAFT':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('customer-my-requests')}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Back to My Requests"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {request.publicRequestId}
              </h2>
              <Badge variant={getStatusBadgeVariant(request.status)}>
                {request.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {new Date(request.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {canCancel && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setCancelModalOpen(true)}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Cancel Request
          </Button>
        )}
      </div>

      {/* Cancellation Notice Banner if Cancelled */}
      {request.status === 'CANCELLED' && (
        <Alert
          type="error"
          title="Service Request Cancelled"
          message={`This request was cancelled on ${
            request.cancelledAt ? new Date(request.cancelledAt).toLocaleDateString() : 'recently'
          }.${request.cancellationReason ? ` Reason: ${request.cancellationReason}` : ''}${
            request.cancellationNotes ? ` — "${request.cancellationNotes}"` : ''
          }`}
        />
      )}

      {/* Safety Notice if Urgent */}
      {request.isUrgent && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-800">Urgent Request Marked</p>
            <p className="leading-relaxed">{request.urgencyDetails || 'This service request was flagged as urgent.'}</p>
            <p className="text-amber-700 text-[11px] pt-1">
              Safety Reminder: If this is an immediate hazard, live gas leak, or life-threatening situation, contact emergency services (911) immediately.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Details & Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Project Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details Card */}
          <Card className="space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Project Overview
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded">
                  {category?.name || 'General Service'}
                </span>
                {subcategory && (
                  <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded">
                    {subcategory.name}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {request.title}
              </h3>
              <p className="text-sm text-slate-700 mt-3 whitespace-pre-line leading-relaxed">
                {request.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Problem Started</span>
                <span className="text-slate-800 font-medium capitalize">
                  {request.problemStarted ? request.problemStarted.toLowerCase().replace('_', ' ') : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-0.5">Urgency Level</span>
                <span className="text-slate-800 font-medium capitalize">
                  {request.urgency ? request.urgency.toLowerCase().replace('_', ' ') : 'Flexible'}
                </span>
              </div>
            </div>
          </Card>

          {/* Schedule & Timing Card */}
          <Card className="space-y-4 p-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-3">
              Requested Schedule & Timing
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-500 block">Preferred Date</span>
                  <span className="font-medium text-slate-800 text-sm">
                    {request.preferredDate
                      ? new Date(`${request.preferredDate}T00:00:00`).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Flexible'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-500 block">Time of Day</span>
                  <span className="font-medium text-slate-800 text-sm capitalize">
                    {request.preferredTime ? request.preferredTime.toLowerCase() : 'Flexible'}
                    {request.specificTime ? ` (${request.specificTime})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-500 block">Flexibility</span>
                  <span className="font-medium text-slate-800 text-sm capitalize">
                    {request.flexibility ? request.flexibility.toLowerCase().replace('_', ' ') : 'Flexible'}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-2">
              Note: Your requested schedule represents a customer preference and is confirmed directly during contractor coordination.
            </p>
          </Card>

          {/* Photos & Attachments Card */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Photos & Documents
              </span>
              <span className="text-xs font-medium text-slate-500">
                {request.attachments?.length || 0} attached
              </span>
            </div>

            {request.attachments && request.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {request.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setPreviewImage({ url: att.fileReference, name: att.fileName })}
                    className="group relative border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all bg-slate-50 aspect-square flex flex-col items-center justify-center"
                  >
                    {att.fileReference.startsWith('data:image') || att.fileReference.startsWith('http') ? (
                      <img
                        src={att.fileReference}
                        alt={att.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="p-3 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[90px] block">
                          {att.fileName}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      View
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic py-2">
                No photos or files were attached to this request.
              </p>
            )}
          </Card>

          {/* Additional Notes */}
          {request.additionalNotes && (
            <Card className="space-y-3 p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-3">
                Additional Instructions
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {request.additionalNotes}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Location, Contact & Activity */}
        <div className="space-y-6">
          {/* Location Information */}
          <Card className="space-y-3 p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
              Service Location
            </span>
            <div className="flex items-start gap-2.5 pt-1">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-800">{request.address}</p>
                {request.unit && <p className="text-slate-600">Unit: {request.unit}</p>}
                <p className="text-slate-600">
                  {request.city}, {request.state} {request.zipCode}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Exact address kept private until contractor scheduling.</span>
            </div>
          </Card>

          {/* Activity Timeline */}
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Activity History
              </span>
              <History className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {request.activities && request.activities.length > 0 ? (
                request.activities.map((act) => (
                  <div key={act.id} className="relative pl-5 pb-3 border-l-2 border-slate-200 last:border-l-transparent last:pb-0">
                    <div className="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full bg-blue-600" />
                    <p className="text-xs font-bold text-slate-800">{act.description}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>By {act.createdBy}</span>
                      <span>•</span>
                      <span>
                        {new Date(act.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500">
                  <p className="font-medium">Request submitted</p>
                  <p className="text-[10px] text-slate-400">{new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Help & Support Card */}
          <Card className="p-5 bg-slate-50 border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900">Need to update something?</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If you need to make critical changes to your project scope or address, please cancel this request and submit a revised version, or reach out via Messages.
            </p>
          </Card>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => !cancelling && setCancelModalOpen(false)}
        title="Cancel Service Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel service request <span className="font-bold text-slate-900">{request.publicRequestId}</span>? This action cannot be undone.
          </p>

          {cancelError && (
            <Alert type="error" message={cancelError} />
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Why are you cancelling? <span className="text-red-500">*</span>
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="No longer needed">No longer needed</option>
              <option value="Found another provider">Found another provider</option>
              <option value="Submitted by mistake">Submitted by mistake</option>
              <option value="Need to change request details">Need to change request details</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Optional Notes
            </label>
            <textarea
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              placeholder="Provide any additional context regarding this cancellation..."
              rows={3}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep Request
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmCancel}
              isLoading={cancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal / Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.name}
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
            />
            <div className="p-3 text-center text-xs font-medium text-slate-700 truncate">
              {previewImage.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
