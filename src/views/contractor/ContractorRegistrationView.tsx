/**
 * You Want Services - Contractor Registration & Onboarding Wizard
 * Phase 5 Architecture
 *
 * Implements the full 8-step wizard:
 * - STEP 1: Account (with duplicate email detection, password matching, Terms & Privacy consent)
 * - STEP 2: Business (entity type, phone, email, website, years, description, primary contact with "Same as account" sync)
 * - STEP 3: Services (10 categories, subcategory multi-select, primary trade designation)
 * - STEP 4: Service Area (primary ZIP, city, state, radius selection, specific ZIP codes)
 * - STEP 5: Credentials (License & Insurance inputs, initial NOT_VERIFIED status with disclaimer, document upload with validation)
 * - STEP 6: Business Profile (Logo upload & preview, 7-day business hours with 24-hr toggles, preferred contact methods)
 * - STEP 7: Review (summary with Edit buttons per section, accuracy confirmation checkbox)
 * - STEP 8: Complete (PENDING ONBOARDING status, verification notice, direct CTA to dashboard)
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useDemoMode } from '../../context/DemoContext';
import { INITIAL_SERVICE_CATEGORIES, INITIAL_SERVICE_SUBCATEGORIES, getSubcategoriesForCategory } from '../../config/categories';
import { Button, Input, Select, Card, Badge, Alert } from '../../components/common/UIComponents';
import { accountService } from '../../services/accountService';
import {
  ContractorBusinessType,
  ContractorBusinessHoursDay,
  ContractorPrimaryContact,
} from '../../types/database';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Building2,
  FileCheck2,
  MapPin,
  Clock,
  Upload,
  Trash2,
  Eye,
  ShieldAlert,
  Info,
  Edit3,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const ContractorRegistrationView: React.FC = () => {
  const { registerContractor } = useAuth();
  const { navigate } = useNavigation();
  const { isDemoMode, assertNotProduction } = useDemoMode();

  // Wizard Step (1 to 8)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Account Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [duplicateEmailError, setDuplicateEmailError] = useState(false);

  // Step 2: Business Information
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<ContractorBusinessType>('LLC');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState<string>('5');
  const [businessDescription, setBusinessDescription] = useState('');
  const [sameAsAccount, setSameAsAccount] = useState(true);
  const [contactFirstName, setContactFirstName] = useState('');
  const [contactLastName, setContactLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Step 3: Services
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    INITIAL_SERVICE_CATEGORIES[0].id,
  ]);
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>(
    INITIAL_SERVICE_CATEGORIES[0].id
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  // Step 4: Service Area
  const [primaryServiceZip, setPrimaryServiceZip] = useState('62704');
  const [serviceCity, setServiceCity] = useState('Springfield');
  const [serviceState, setServiceState] = useState('IL');
  const [serviceRadius, setServiceRadius] = useState<string>('25');
  const [customRadius, setCustomRadius] = useState<string>('');
  const [specificZipCodesInput, setSpecificZipCodesInput] = useState('62701, 62702, 62703, 62704');

  // Business Physical Location (Step 4/5)
  const [businessAddress, setBusinessAddress] = useState('1200 Commerce Blvd');
  const [businessCity, setBusinessCity] = useState('Springfield');
  const [businessState, setBusinessState] = useState('IL');
  const [businessZipCode, setBusinessZipCode] = useState('62704');
  const [usePrimaryLocation, setUsePrimaryLocation] = useState(true);

  // Step 5: Credentials (License & Insurance)
  const [licenseType, setLicenseType] = useState('Trade Contractor License');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('IL');
  const [licenseExpiration, setLicenseExpiration] = useState('');

  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceCoverageType, setInsuranceCoverageType] = useState('General Commercial Liability');
  const [insuranceExpiration, setInsuranceExpiration] = useState('');

  // Uploaded Documents
  const [documents, setDocuments] = useState<
    {
      documentType: 'BUSINESS_LICENSE' | 'CONTRACTOR_LICENSE' | 'CERTIFICATE_OF_INSURANCE' | 'OTHER';
      fileName: string;
      fileReference: string;
      fileType: string;
      fileSize: number;
    }[]
  >([]);

  // Step 6: Business Profile
  const [profileLogo, setProfileLogo] = useState<string>('');
  const [contactMethods, setContactMethods] = useState<('PHONE' | 'EMAIL' | 'SMS')[]>([
    'EMAIL',
    'PHONE',
  ]);
  const [businessHours, setBusinessHours] = useState<Record<string, ContractorBusinessHoursDay>>({
    monday: { closed: false, openTime: '08:00', closeTime: '17:00' },
    tuesday: { closed: false, openTime: '08:00', closeTime: '17:00' },
    wednesday: { closed: false, openTime: '08:00', closeTime: '17:00' },
    thursday: { closed: false, openTime: '08:00', closeTime: '17:00' },
    friday: { closed: false, openTime: '08:00', closeTime: '17:00' },
    saturday: { closed: true },
    sunday: { closed: true },
  });

  // Step 7: Final Review Confirmation
  const [accuracyConfirmed, setAccuracyConfirmed] = useState(false);

  // Validation / Submission states
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-sync primary contact if "Same as account" is checked
  const effectiveContact: ContractorPrimaryContact = sameAsAccount
    ? {
        firstName: firstName || 'Primary',
        lastName: lastName || 'Contact',
        phone: phone,
        email: email,
      }
    : {
        firstName: contactFirstName,
        lastName: contactLastName,
        phone: contactPhone,
        email: contactEmail,
      };

  // Helper to toggle category selection
  const handleToggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) {
        setStepError('You must select at least one service category.');
        return;
      }
      const updated = selectedCategories.filter((id) => id !== catId);
      setSelectedCategories(updated);
      if (primaryCategoryId === catId) {
        setPrimaryCategoryId(updated[0]);
      }
    } else {
      setSelectedCategories([...selectedCategories, catId]);
      setStepError(null);
    }
  };

  // Helper to toggle subcategory selection
  const handleToggleSubcategory = (subId: string) => {
    if (selectedSubcategories.includes(subId)) {
      setSelectedSubcategories(selectedSubcategories.filter((id) => id !== subId));
    } else {
      setSelectedSubcategories([...selectedSubcategories, subId]);
    }
  };

  // Helper to toggle contact methods
  const handleToggleContactMethod = (method: 'PHONE' | 'EMAIL' | 'SMS') => {
    if (contactMethods.includes(method)) {
      if (contactMethods.length === 1) return;
      setContactMethods(contactMethods.filter((m) => m !== method));
    } else {
      setContactMethods([...contactMethods, method]);
    }
  };

  // File Upload Handler (Base64 data URL)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'BUSINESS_LICENSE' | 'CONTRACTOR_LICENSE' | 'CERTIFICATE_OF_INSURANCE' | 'OTHER'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setStepError('File size exceeds the 10MB limit.');
      return;
    }

    // Validate type (PDF, JPG, PNG, WebP)
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setStepError('Please upload a PDF, JPG, PNG, or WebP document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      setDocuments((prev) => [
        ...prev.filter((d) => d.documentType !== type), // Replace if same type
        {
          documentType: type,
          fileName: file.name,
          fileReference: dataUrl,
          fileType: file.type,
          fileSize: file.size,
        },
      ]);
      setStepError(null);
    };
    reader.readAsDataURL(file);
  };

  // Logo Upload Handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStepError('Logo image exceeds the 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setProfileLogo(loadEvt.target?.result as string);
      setStepError(null);
    };
    reader.readAsDataURL(file);
  };

  // Step Validation & Forward Navigation
  const handleNextStep = () => {
    setStepError(null);

    // STEP 1 VALIDATION
    if (currentStep === 1) {
      if (!firstName.trim() || !lastName.trim()) {
        setStepError('Please enter your first and last name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setStepError('Please enter a valid email address.');
        return;
      }
      if (!phone.trim() || phone.trim().length < 7) {
        setStepError('Please enter a valid primary contact phone number.');
        return;
      }
      if (!password || password.length < 8) {
        setStepError('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setStepError('Passwords do not match. Please verify both fields.');
        return;
      }
      if (!termsAccepted) {
        setStepError('You must agree to the Terms of Service and Privacy Policy to continue.');
        return;
      }

      // Check duplicate email
      if (accountService.isEmailRegistered(email.trim().toLowerCase())) {
        setDuplicateEmailError(true);
        setStepError('An account with this email already exists. Please log in or use password recovery.');
        return;
      }
      setDuplicateEmailError(false);
    }

    // STEP 2 VALIDATION
    if (currentStep === 2) {
      if (!businessName.trim()) {
        setStepError('Please enter your business or trading name.');
        return;
      }
      if (!businessPhone.trim() && !phone.trim()) {
        setStepError('Please provide a business contact phone.');
        return;
      }
    }

    // STEP 3 VALIDATION
    if (currentStep === 3) {
      if (selectedCategories.length === 0) {
        setStepError('Please select at least one primary service trade category.');
        return;
      }
      if (!primaryCategoryId) {
        setPrimaryCategoryId(selectedCategories[0]);
      }
    }

    // STEP 4 VALIDATION
    if (currentStep === 4) {
      if (!primaryServiceZip.trim() || primaryServiceZip.trim().length < 5) {
        setStepError('Please enter a valid 5-digit primary service zip code.');
        return;
      }
    }

    // STEP 7 SUBMISSION
    if (currentStep === 7) {
      if (!accuracyConfirmed) {
        setStepError('Please confirm that the information provided is accurate.');
        return;
      }
      handleCompleteRegistration();
      return;
    }

    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Submission Handler
  const handleCompleteRegistration = async () => {
    setIsSubmitting(true);
    setStepError(null);
    assertNotProduction('Contractor Registration Submission');

    const specificZips = specificZipCodesInput
      .split(',')
      .map((z) => z.trim())
      .filter((z) => z.length >= 5);

    const radiusVal = serviceRadius === 'Custom' ? parseInt(customRadius, 10) || 25 : parseInt(serviceRadius, 10) || 25;

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      password,
      termsAccepted,
      termsVersion: 'v1.0-2026',
      privacyVersion: 'v1.0-2026',

      businessName,
      businessType,
      businessPhone: businessPhone.trim() || phone.trim(),
      businessEmail: businessEmail.trim() || email.trim(),
      website,
      yearsInBusiness,
      businessDescription,

      primaryContact: effectiveContact,

      primaryCategoryId,
      serviceCategoryIds: selectedCategories,
      serviceSubcategoryIds: selectedSubcategories,

      primaryServiceZip,
      city: serviceCity,
      state: serviceState,
      serviceRadius: radiusVal,
      specificZipCodes: specificZips,

      businessAddress: usePrimaryLocation ? serviceCity : businessAddress,
      businessCity: usePrimaryLocation ? serviceCity : businessCity,
      businessState: usePrimaryLocation ? serviceState : businessState,
      businessZipCode: usePrimaryLocation ? primaryServiceZip : businessZipCode,

      licenseType,
      licenseNumber,
      licenseState,
      licenseExpiration,

      insuranceProvider,
      insurancePolicyNumber,
      insuranceCoverageType,
      insuranceExpiration,

      profileLogo,
      businessHours,
      preferredContactMethods: contactMethods,

      documents,
    };

    const res = await registerContractor(payload);
    setIsSubmitting(false);

    if (res.success) {
      setCurrentStep(8);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (res.duplicate) {
        setDuplicateEmailError(true);
      }
      setStepError(res.message);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Wizard Header & Progress */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Contractor Onboarding Wizard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentStep === 1 && 'Create Your Contractor Account'}
              {currentStep === 2 && 'Tell Us About Your Business'}
              {currentStep === 3 && 'What Services Do You Provide?'}
              {currentStep === 4 && 'Where Do You Provide Services?'}
              {currentStep === 5 && 'Professional Credentials & Licenses'}
              {currentStep === 6 && 'Business Profile & Operating Hours'}
              {currentStep === 7 && 'Review Your Contractor Profile'}
              {currentStep === 8 && 'Registration Submitted'}
            </h1>
          </div>
          {currentStep <= 7 && (
            <div className="text-sm font-bold text-slate-500">
              Step <span className="text-blue-700 font-mono text-base">{currentStep}</span> of 8
            </div>
          )}
        </div>

        {/* Visual Progress Bar */}
        {currentStep <= 7 && (
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 8) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Error Alert Display */}
      {stepError && (
        <Alert variant="danger" title="Please check your input">
          <div className="space-y-2">
            <p>{stepError}</p>
            {duplicateEmailError && (
              <div className="pt-2 flex items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => navigate('login')}>
                  Log In
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('forgot-password')}>
                  Forgot Password?
                </Button>
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* STEP 1: ACCOUNT INFORMATION */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Personal & Account Credentials</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These details manage your account access and administrative notifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="contractor-first-name"
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Marcus"
            />
            <Input
              id="contractor-last-name"
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Vance"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="contractor-email"
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setDuplicateEmailError(false);
              }}
              placeholder="marcus@apexheating.com"
              helperText="This email will be used to log in to your contractor portal."
            />
            <Input
              id="contractor-phone"
              label="Primary Phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 876-5432"
              helperText="Primary dispatch contact for account verification."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="contractor-password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              id="contractor-confirm-password"
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="contractor-terms-consent"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => navigate('terms')}
                  className="text-blue-700 underline font-semibold hover:text-blue-800"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => navigate('privacy')}
                  className="text-blue-700 underline font-semibold hover:text-blue-800"
                >
                  Privacy Policy
                </button>
                . Consent is required to establish a contractor account.
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* STEP 2: BUSINESS INFORMATION */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Business Entity & Organization</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your legal company information and operational contact points.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="biz-name"
              label="Business Name"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Apex HVAC & Mechanical LLC"
              helperText="The name customers will see on your business profile."
            />
            <Select
              id="biz-type"
              label="Business Entity Type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as ContractorBusinessType)}
              options={[
                { value: 'LLC', label: 'Limited Liability Company (LLC)' },
                { value: 'Corporation', label: 'Corporation (C-Corp / S-Corp)' },
                { value: 'Sole Proprietor', label: 'Sole Proprietorship' },
                { value: 'Partnership', label: 'General Partnership' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="biz-phone"
              label="Business Phone"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              placeholder={phone || '(555) 876-5432'}
            />
            <Input
              id="biz-email"
              label="Business Email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder={email || 'contact@apexheating.com'}
            />
            <Input
              id="biz-years"
              label="Years in Business"
              type="number"
              value={yearsInBusiness}
              onChange={(e) => setYearsInBusiness(e.target.value)}
              placeholder="5"
            />
          </div>

          <Input
            id="biz-website"
            label="Company Website (Optional)"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://apexheating.example.com"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Description
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Tell customers about your business, background experience, and the quality of your services.
            </p>
            <textarea
              id="biz-description"
              rows={4}
              maxLength={1500}
              value={businessDescription}
              onChange={(e) => setBusinessDescription(e.target.value)}
              placeholder="We are a family-owned HVAC and mechanical contractor with over a decade of residential diagnostic and installation experience..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
            />
            <div className="text-right text-[11px] text-slate-400 mt-1">
              {businessDescription.length}/1500 characters
            </div>
          </div>

          {/* Primary Contact Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">Primary Business Contact</h4>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={sameAsAccount}
                  onChange={(e) => setSameAsAccount(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span>Same as account information</span>
              </label>
            </div>

            {!sameAsAccount && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Input
                  label="Contact First Name"
                  value={contactFirstName}
                  onChange={(e) => setContactFirstName(e.target.value)}
                  placeholder="Jane"
                />
                <Input
                  label="Contact Last Name"
                  value={contactLastName}
                  onChange={(e) => setContactLastName(e.target.value)}
                  placeholder="Doe"
                />
                <Input
                  label="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
                <Input
                  label="Contact Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="jane@apexheating.com"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 3: SERVICES */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Trade Categories & Service Offerings</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your primary trade and any secondary specialties your company offers.
            </p>
          </div>

          {/* Primary Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Trade Category <span className="text-rose-500">*</span>
            </label>
            <Select
              id="primary-category"
              value={primaryCategoryId}
              onChange={(e) => {
                const newPrimary = e.target.value;
                setPrimaryCategoryId(newPrimary);
                if (!selectedCategories.includes(newPrimary)) {
                  setSelectedCategories([...selectedCategories, newPrimary]);
                }
              }}
              options={INITIAL_SERVICE_CATEGORIES.map((c) => ({
                value: c.id,
                label: `${c.name} (Primary)`,
              }))}
            />
          </div>

          {/* Category Checkboxes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              All Active Service Trades (Select all that apply)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INITIAL_SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                const isPrimary = primaryCategoryId === cat.id;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by parent div
                        className="w-4 h-4 mt-0.5 text-blue-600 rounded border-slate-300"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{cat.name}</span>
                          {isPrimary && <Badge variant="primary">PRIMARY</Badge>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subcategories Multi-Select */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Specific Services / Subcategories</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Check specific repairs and installations you provide for your selected categories.
              </p>
            </div>

            <div className="space-y-4">
              {selectedCategories.map((catId) => {
                const category = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === catId);
                const subcats = getSubcategoriesForCategory(catId);
                if (subcats.length === 0) return null;

                return (
                  <div key={catId} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                      {category?.name} Specialties
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {subcats.map((sub) => {
                        const isSubSelected = selectedSubcategories.includes(sub.id);
                        return (
                          <label
                            key={sub.id}
                            className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition cursor-pointer select-none ${
                              isSubSelected
                                ? 'bg-blue-100/70 border-blue-400 font-semibold text-blue-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSubSelected}
                              onChange={() => handleToggleSubcategory(sub.id)}
                              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300"
                            />
                            <span className="truncate">{sub.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: SERVICE AREA & LOCATION */}
      {currentStep === 4 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Service Territory & Dispatch Radius</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your primary base of operations and the dispatch radius in miles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              id="service-zip"
              label="Primary Service ZIP Code"
              required
              value={primaryServiceZip}
              onChange={(e) => setPrimaryServiceZip(e.target.value)}
              placeholder="62704"
              helperText="Central dispatch hub for mileage calculation."
            />
            <Input
              id="service-city"
              label="City"
              value={serviceCity}
              onChange={(e) => setServiceCity(e.target.value)}
              placeholder="Springfield"
            />
            <Input
              id="service-state"
              label="State"
              value={serviceState}
              onChange={(e) => setServiceState(e.target.value.toUpperCase())}
              placeholder="IL"
              maxLength={2}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Service Radius
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['5', '10', '15', '25', '50', 'Custom'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setServiceRadius(r)}
                  className={`py-2 px-3 text-xs rounded-lg font-bold border transition cursor-pointer ${
                    serviceRadius === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {r === 'Custom' ? 'Custom' : `${r} miles`}
                </button>
              ))}
            </div>

            {serviceRadius === 'Custom' && (
              <div className="max-w-xs pt-2">
                <Input
                  label="Custom Radius in Miles"
                  type="number"
                  value={customRadius}
                  onChange={(e) => setCustomRadius(e.target.value)}
                  placeholder="e.g. 40"
                />
              </div>
            )}
          </div>

          <div>
            <Input
              id="specific-zips"
              label="Specific ZIP Codes Served (Optional)"
              value={specificZipCodesInput}
              onChange={(e) => setSpecificZipCodesInput(e.target.value)}
              placeholder="62701, 62702, 62703, 62704"
              helperText="Separate multiple zip codes with commas for targeted local dispatch."
            />
          </div>

          {/* Physical Business Address */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Physical Business Address</h4>
                <p className="text-[11px] text-slate-500">
                  Used for verification and administrative mailings. Never displayed publicly.
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={usePrimaryLocation}
                  onChange={(e) => setUsePrimaryLocation(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span>Use primary service location</span>
              </label>
            </div>

            {!usePrimaryLocation && (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Input
                  label="Street Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="1400 Industrial Way, Suite B"
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="City"
                    value={businessCity}
                    onChange={(e) => setBusinessCity(e.target.value)}
                    placeholder="Springfield"
                  />
                  <Input
                    label="State"
                    value={businessState}
                    onChange={(e) => setBusinessState(e.target.value.toUpperCase())}
                    placeholder="IL"
                    maxLength={2}
                  />
                  <Input
                    label="ZIP Code"
                    value={businessZipCode}
                    onChange={(e) => setBusinessZipCode(e.target.value)}
                    placeholder="62703"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* STEP 5: CREDENTIALS (LICENSE & INSURANCE) */}
      {currentStep === 5 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Professional License & Insurance</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit your trade credentials for administrative review.
            </p>
          </div>

          {/* Mandatory verification disclaimer */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Initial Status: NOT VERIFIED.</span> License and insurance information may be subject to administrative review and document verification before certain marketplace features become active.
            </div>
          </div>

          {/* License Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                Professional License Information
              </h4>
              <Badge variant="warning">NOT VERIFIED</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="License Type"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
                placeholder="Trade Contractor License"
              />
              <Input
                label="License Number"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="IL-HVAC-994821"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Issuing State"
                value={licenseState}
                onChange={(e) => setLicenseState(e.target.value.toUpperCase())}
                placeholder="IL"
                maxLength={2}
              />
              <Input
                label="Expiration Date"
                type="date"
                value={licenseExpiration}
                onChange={(e) => setLicenseExpiration(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload License Document (Optional PDF / Image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileUpload(e, 'CONTRACTOR_LICENSE')}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                General Liability Insurance
              </h4>
              <Badge variant="warning">NOT VERIFIED</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Insurance Provider"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="Nationwide Commercial Guard"
              />
              <Input
                label="Policy Number"
                value={insurancePolicyNumber}
                onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                placeholder="POL-COMM-449102"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Coverage Type"
                value={insuranceCoverageType}
                onChange={(e) => setInsuranceCoverageType(e.target.value)}
                placeholder="General Commercial Liability"
              />
              <Input
                label="Expiration Date"
                type="date"
                value={insuranceExpiration}
                onChange={(e) => setInsuranceExpiration(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Upload Certificate of Insurance (COI) (Optional PDF / Image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileUpload(e, 'CERTIFICATE_OF_INSURANCE')}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Document list review */}
          {documents.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-700">Attached Documents:</span>
              <div className="space-y-1.5">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{doc.documentType.replace('_', ' ')}:</span>
                      <span className="truncate">{doc.fileName}</span>
                      <span className="text-slate-400">({Math.round(doc.fileSize / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments(documents.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* STEP 6: BUSINESS PROFILE & HOURS */}
      {currentStep === 6 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Public Business Profile & Operating Hours</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize how your business appears to homeowners and configure dispatch availability.
            </p>
          </div>

          {/* Logo Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Company Logo (Optional)
            </label>
            <div className="flex items-center gap-4">
              {profileLogo ? (
                <div className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <img
                    src={profileLogo}
                    alt="Company Logo Preview"
                    className="w-full h-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setProfileLogo('')}
                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-xs hover:bg-rose-700 cursor-pointer"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 text-[10px]">
                  <Building2 className="w-6 h-6 mb-1" />
                  <span>No Logo</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoUpload}
                  className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WebP up to 5MB.</p>
              </div>
            </div>
          </div>

          {/* Operating Hours Table */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Standard Business Hours
            </h4>
            <p className="text-xs text-slate-500">
              Specify your regular service hours. Emergency calls can be toggled separately.
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {DAYS_OF_WEEK.map((day) => {
                const currentDay = businessHours[day.key] || { closed: false, openTime: '08:00', closeTime: '17:00' };

                return (
                  <div key={day.key} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="w-28 font-bold text-slate-800">{day.label}</div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={currentDay.closed}
                          onChange={(e) => {
                            setBusinessHours({
                              ...businessHours,
                              [day.key]: {
                                ...currentDay,
                                closed: e.target.checked,
                              },
                            });
                          }}
                          className="w-3.5 h-3.5 text-blue-600 rounded"
                        />
                        <span className="text-slate-600">Closed</span>
                      </label>

                      {!currentDay.closed && (
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!currentDay.is24Hours}
                            onChange={(e) => {
                              setBusinessHours({
                                ...businessHours,
                                [day.key]: {
                                  ...currentDay,
                                  is24Hours: e.target.checked,
                                },
                              });
                            }}
                            className="w-3.5 h-3.5 text-blue-600 rounded"
                          />
                          <span className="text-slate-600">24 Hours</span>
                        </label>
                      )}
                    </div>

                    {!currentDay.closed && !currentDay.is24Hours ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={currentDay.openTime || '08:00'}
                          onChange={(e) => {
                            setBusinessHours({
                              ...businessHours,
                              [day.key]: {
                                ...currentDay,
                                openTime: e.target.value,
                              },
                            });
                          }}
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="time"
                          value={currentDay.closeTime || '17:00'}
                          onChange={(e) => {
                            setBusinessHours({
                              ...businessHours,
                              [day.key]: {
                                ...currentDay,
                                closeTime: e.target.value,
                              },
                            });
                          }}
                          className="border border-slate-300 rounded px-2 py-1 text-xs"
                        />
                      </div>
                    ) : (
                      <div className="text-slate-400 italic">
                        {currentDay.closed ? 'Not available' : 'Full 24-hr service'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preferred Contact Methods */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Preferred Customer Contact Methods</h4>
            <div className="flex flex-wrap gap-4 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactMethods.includes('EMAIL')}
                  onChange={() => handleToggleContactMethod('EMAIL')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  Email Inquiries
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactMethods.includes('PHONE')}
                  onChange={() => handleToggleContactMethod('PHONE')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  Direct Dispatch Phone
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={contactMethods.includes('SMS')}
                  onChange={() => handleToggleContactMethod('SMS')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span>Instant SMS Notifications</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              SMS notifications are activated once carrier messaging consent is verified.
            </p>
          </div>
        </Card>
      )}

      {/* STEP 7: REVIEW */}
      {currentStep === 7 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Review Your Contractor Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm all details before submitting for onboarding review. You can edit any section.
            </p>
          </div>

          {/* Section 1: Account */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                1. Account Credentials
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)} leftIcon={<Edit3 className="w-3 h-3" />}>
                Edit
              </Button>
            </div>
            <div className="text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><strong>Name:</strong> {firstName} {lastName}</div>
              <div><strong>Email:</strong> {email}</div>
              <div><strong>Phone:</strong> {phone}</div>
              <div><strong>Terms Accepted:</strong> Yes (v1.0-2026)</div>
            </div>
          </div>

          {/* Section 2: Business */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Business Details
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)} leftIcon={<Edit3 className="w-3 h-3" />}>
                Edit
              </Button>
            </div>
            <div className="text-xs text-slate-800 space-y-1.5">
              <div><strong>Business Name:</strong> {businessName} ({businessType})</div>
              <div><strong>Contact Email:</strong> {businessEmail || email}</div>
              <div><strong>Business Phone:</strong> {businessPhone || phone}</div>
              {website && <div><strong>Website:</strong> {website}</div>}
              <div><strong>Years in Business:</strong> {yearsInBusiness || '0'} years</div>
              {businessDescription && (
                <div className="pt-1 text-slate-600 italic leading-relaxed">
                  &ldquo;{businessDescription}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Services */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                3. Services & Trades
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)} leftIcon={<Edit3 className="w-3 h-3" />}>
                Edit
              </Button>
            </div>
            <div className="text-xs text-slate-800 space-y-2">
              <div>
                <strong>Primary Trade:</strong>{' '}
                <Badge variant="primary">
                  {INITIAL_SERVICE_CATEGORIES.find((c) => c.id === primaryCategoryId)?.name}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                <strong>All Trades:</strong>
                {selectedCategories.map((cId) => {
                  const cat = INITIAL_SERVICE_CATEGORIES.find((c) => c.id === cId);
                  return (
                    <span key={cId} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[11px]">
                      {cat?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Service Area */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                4. Service Territory
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)} leftIcon={<Edit3 className="w-3 h-3" />}>
                Edit
              </Button>
            </div>
            <div className="text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div><strong>Dispatch Hub:</strong> {serviceCity}, {serviceState} {primaryServiceZip}</div>
              <div><strong>Radius:</strong> {serviceRadius === 'Custom' ? customRadius : serviceRadius} miles</div>
              <div className="sm:col-span-2">
                <strong>Target ZIP Codes:</strong> {specificZipCodesInput || 'All within radius'}
              </div>
            </div>
          </div>

          {/* Section 5: Credentials */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                5. Professional Credentials
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)} leftIcon={<Edit3 className="w-3 h-3" />}>
                Edit
              </Button>
            </div>
            <div className="text-xs text-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>License:</strong> {licenseNumber || 'Not provided'}{' '}
                <Badge variant="warning">NOT VERIFIED</Badge>
              </div>
              <div><strong>State / Exp:</strong> {licenseState} {licenseExpiration ? `(Exp: ${licenseExpiration})` : ''}</div>
              <div>
                <strong>Insurance:</strong> {insuranceProvider || 'Not provided'}{' '}
                <Badge variant="warning">NOT VERIFIED</Badge>
              </div>
              <div><strong>Policy / Exp:</strong> {insurancePolicyNumber} {insuranceExpiration ? `(Exp: ${insuranceExpiration})` : ''}</div>
              <div><strong>Attached Docs:</strong> {documents.length} file(s)</div>
            </div>
          </div>

          {/* Final accuracy confirmation checkbox */}
          <div className="pt-4 border-t border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="contractor-accuracy-confirmation"
                type="checkbox"
                checked={accuracyConfirmed}
                onChange={(e) => setAccuracyConfirmed(e.target.checked)}
                className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-700 leading-relaxed font-semibold">
                I confirm that the information I provided is accurate to the best of my knowledge. I understand that submitted licenses and insurance will be placed in pending review status.
              </span>
            </label>
          </div>
        </Card>
      )}

      {/* STEP 8: REGISTRATION COMPLETE */}
      {currentStep === 8 && (
        <Card className="p-8 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <Badge variant="warning">STATUS: PENDING ONBOARDING</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Your contractor registration has been submitted.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your business information has been saved. Additional verification or review may be required before marketplace features become available.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Next Steps:</span>
            </div>
            <p>1. Open your Contractor Dashboard to view your initial profile completion score.</p>
            <p>2. Keep your business hours and contact channels updated.</p>
            <p>3. In Demo Mode, you can test lead alerts safely without live billing.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              id="goto-contractor-dashboard-btn"
              variant="primary"
              size="lg"
              onClick={() => navigate('contractor-dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto shadow-md"
            >
              Go to Contractor Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('contractor-profile')}
              className="w-full sm:w-auto"
            >
              View Business Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Bottom Navigation Controls (Steps 1 to 7) */}
      {currentStep <= 7 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNextStep}
            isLoading={isSubmitting}
            rightIcon={currentStep < 7 ? <ArrowRight className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          >
            {currentStep < 7 ? 'Continue' : 'Complete Contractor Registration'}
          </Button>
        </div>
      )}
    </div>
  );
};
