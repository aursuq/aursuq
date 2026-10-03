"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Loader2, AlertCircle, Search, Plus, X, CheckCircle } from "lucide-react";
import { fetchSellers, createSeller, deleteSeller, type SellerListItemResponse, type CreateSellerDto } from "@/lib/api/sellers";

export default function SellersPage() {
  const { t, isRTL } = useLanguage();
  const [sellers, setSellers] = useState<SellerListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Add Seller modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSellerDto>({
    email: "",
    legalName: "",
    businessName: "",
    taxRegistrationNumber: "",
    phone: "",
    businessAddress: "",
    storeName: "",
    storeSlug: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateSellerDto, string>>>({});
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{ storeName: string; storeNumber: string } | null>(null);

  // Delete Seller modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalSubmitting, setDeleteModalSubmitting] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const [sellerToDelete, setSellerToDelete] = useState<SellerListItemResponse | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const loadSellers = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSellers(search);
      setSellers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("sellersPage.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load sellers when debounced search term changes
  useEffect(() => {
    loadSellers(debouncedSearchTerm || undefined);
  }, [debouncedSearchTerm, loadSellers]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  // Generate slug from store name
  const generateSlug = (storeName: string): string => {
    return storeName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Update store slug when store name changes (if not manually edited)
  const handleStoreNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, storeName: value }));
    if (!slugEditedManually) {
      const suggestedSlug = generateSlug(value);
      setFormData((prev) => ({ ...prev, storeSlug: suggestedSlug }));
    }
  };

  const handleStoreSlugChange = (value: string) => {
    setFormData((prev) => ({ ...prev, storeSlug: value }));
    if (value.trim() !== "") {
      setSlugEditedManually(true);
    } else {
      setSlugEditedManually(false);
    }
  };

  const handleInputChange = (field: keyof CreateSellerDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateSellerDto, string>> = {};

    if (!formData.email.trim()) {
      errors.email = t("sellersPage.validation.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = t("sellersPage.validation.emailInvalid");
    }

    if (!formData.legalName.trim()) {
      errors.legalName = t("sellersPage.validation.required");
    }

    if (!formData.businessName.trim()) {
      errors.businessName = t("sellersPage.validation.required");
    }

    if (!formData.taxRegistrationNumber.trim()) {
      errors.taxRegistrationNumber = t("sellersPage.validation.required");
    }

    if (!formData.phone.trim()) {
      errors.phone = t("sellersPage.validation.required");
    }

    if (!formData.businessAddress.trim()) {
      errors.businessAddress = t("sellersPage.validation.required");
    }

    if (!formData.storeName.trim()) {
      errors.storeName = t("sellersPage.validation.required");
    }

    if (!formData.storeSlug.trim()) {
      errors.storeSlug = t("sellersPage.validation.required");
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.storeSlug.trim())) {
      errors.storeSlug = t("sellersPage.validation.slugInvalid");
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openDeleteModal = (seller: SellerListItemResponse) => {
    setSellerToDelete(seller);
    setDeleteModalError(null);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSellerToDelete(null);
    setDeleteModalError(null);
  };

  const handleDeleteSeller = async () => {
    if (!sellerToDelete) return;
    setDeleteModalSubmitting(true);
    setDeleteModalError(null);

    try {
      await deleteSeller(sellerToDelete.id);
      const storeName = sellerToDelete.store?.name || sellerToDelete.legalName;
      const storeNumber = sellerToDelete.store ? formatStoreNumber(sellerToDelete.store.storeNumber) : "—";
      setSuccessMessage({
        storeName,
        storeNumber,
      });
      closeDeleteModal();
      loadSellers(debouncedSearchTerm || undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("sellersPage.error.deleteFailed");
      if (errorMessage.includes("Only pending") || errorMessage.includes("inactive")) {
        setDeleteModalError(t("sellersPage.error.deleteNotAllowed"));
      } else {
        setDeleteModalError(errorMessage);
      }
    } finally {
      setDeleteModalSubmitting(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setModalError(null);
    setFormErrors({});
    setSlugEditedManually(false);
    setTimeout(() => firstInputRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      email: "",
      legalName: "",
      businessName: "",
      taxRegistrationNumber: "",
      phone: "",
      businessAddress: "",
      storeName: "",
      storeSlug: "",
    });
    setFormErrors({});
    setSlugEditedManually(false);
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setModalSubmitting(true);
    setModalError(null);

    try {
      const dto: CreateSellerDto = {
        email: formData.email.trim().toLowerCase(),
        legalName: formData.legalName.trim(),
        businessName: formData.businessName.trim(),
        taxRegistrationNumber: formData.taxRegistrationNumber.trim(),
        phone: formData.phone.trim(),
        businessAddress: formData.businessAddress.trim(),
        storeName: formData.storeName.trim(),
        storeSlug: formData.storeSlug.trim().toLowerCase(),
      };

      const result = await createSeller(dto);
      const storeNumber = result.store?.storeNumber ? result.store.storeNumber.toString().padStart(6, "0") : "—";

      setSuccessMessage({
        storeName: result.store?.name || dto.storeName,
        storeNumber,
      });
      closeModal();
      loadSellers(debouncedSearchTerm || undefined);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t("sellersPage.error.createFailed");
      if (errorMessage.includes("Email already registered") || errorMessage.includes("email")) {
        setModalError(t("sellersPage.error.emailExists"));
      } else if (errorMessage.includes("Store slug already in use") || errorMessage.includes("slug")) {
        setModalError(t("sellersPage.error.slugExists"));
      } else if (errorMessage.includes("Unauthorized") || errorMessage.includes("401") || errorMessage.includes("403")) {
        setModalError(t("sellersPage.error.unauthorized"));
      } else if (errorMessage.includes("validation") || errorMessage.includes("400")) {
        setModalError(t("sellersPage.error.validationError"));
      } else {
        setModalError(errorMessage);
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Focus trap for modal
  useEffect(() => {
    if (isModalOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      modalRef.current.addEventListener("keydown", handleTab);
      firstElement?.focus();

      return () => modalRef.current?.removeEventListener("keydown", handleTab);
    }
  }, [isModalOpen]);

  const getVerificationVariant = (
    status: string
  ): "verified" | "pending" | "rejected" | "default" => {
    switch (status) {
      case "APPROVED":
        return "verified";
      case "PENDING":
        return "pending";
      case "REJECTED":
        return "rejected";
      default:
        return "default";
    }
  };

  const getUserStatusVariant = (
    status: string
  ): "active" | "inactive" | "suspended" | "default" => {
    switch (status) {
      case "ACTIVE":
        return "active";
      case "SUSPENDED":
        return "suspended";
      case "DISABLED":
        return "inactive";
      default:
        return "default";
    }
  };

  const getStoreStatusVariant = (
    isActive: boolean | null | undefined
  ): "active" | "inactive" | "default" => {
    if (isActive === true) return "active";
    if (isActive === false) return "inactive";
    return "default";
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatStoreNumber = (num: number) => {
    return num.toString().padStart(6, "0");
  };

  const columns = [
    {
      key: "storeNumber",
      header: t("sellersPage.table.storeNumber"),
      render: (row: SellerListItemResponse) => (
        <span className="font-mono font-medium text-slate-900">
          {row.store ? formatStoreNumber(row.store.storeNumber) : "—"}
        </span>
      ),
      className: "w-24",
    },
    {
      key: "storeName",
      header: t("sellersPage.table.storeName"),
      render: (row: SellerListItemResponse) => (
        <span className="font-medium text-slate-900">
          {row.store?.name || "—"}
        </span>
      ),
    },
    {
      key: "legalName",
      header: t("sellersPage.table.legalName"),
      render: (row: SellerListItemResponse) => (
        <span className="text-slate-900">{row.legalName}</span>
      ),
    },
    {
      key: "email",
      header: t("sellersPage.table.email"),
      render: (row: SellerListItemResponse) => (
        <span className="text-slate-700">{row.email}</span>
      ),
    },
    {
      key: "phone",
      header: t("sellersPage.table.phone"),
      render: (row: SellerListItemResponse) => (
        <span className="text-slate-700">{row.phone}</span>
      ),
    },
    {
      key: "verificationStatus",
      header: t("sellersPage.table.verificationStatus"),
      render: (row: SellerListItemResponse) => (
        <StatusBadge
          label={t(`sellersPage.status.${row.verificationStatus.toLowerCase()}`)}
          variant={getVerificationVariant(row.verificationStatus)}
        />
      ),
    },
    {
      key: "userStatus",
      header: t("sellersPage.table.accountStatus"),
      render: (row: SellerListItemResponse) => (
        <StatusBadge
          label={t(`sellersPage.status.${row.userStatus.toLowerCase()}`)}
          variant={getUserStatusVariant(row.userStatus)}
        />
      ),
    },
    {
      key: "storeStatus",
      header: t("sellersPage.table.storeStatus"),
      render: (row: SellerListItemResponse) => (
        <StatusBadge
          label={row.store
            ? t(`sellersPage.status.${row.store.isActive ? "storeActive" : "storeInactive"}`)
            : "—"}
          variant={getStoreStatusVariant(row.store?.isActive)}
        />
      ),
    },
    {
      key: "joinedDate",
      header: t("sellersPage.table.joinedDate"),
      render: (row: SellerListItemResponse) => (
        <span className="text-slate-700 whitespace-nowrap">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("sellersPage.table.actions"),
      render: (row: SellerListItemResponse) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openDeleteModal(row)}
            disabled={
              row.verificationStatus !== "PENDING" ||
              (row.store && row.store.isActive !== false) ||
              deleteModalSubmitting
            }
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={t("sellersPage.actions.delete")}
          >
            {t("sellersPage.actions.delete")}
          </button>
        </div>
      ),
      className: "w-32",
    },
  ];

  return (
    <DashboardLayout title={t("sellersPage.title")}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t("sellersPage.title")}
            </h1>
            <p className="text-slate-500 mt-1">{t("sellersPage.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search input */}
            <div className="relative">
              <Search
                className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`}
                aria-hidden={true}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("sellersPage.searchPlaceholder")}
                className={`pl-10 pr-12 py-2 w-64 border border-slate-300 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${isRTL ? "pr-10" : ""}`}
                aria-label={t("sellersPage.searchPlaceholder")}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "left-3" : "right-3"} text-slate-400 hover:text-slate-600`}
                  aria-label={t("sellersPage.searchPlaceholder")}
                >
                  <X className="w-4 h-4" aria-hidden={true} />
                </button>
              )}
            </div>
            {/* Add Seller button */}
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden={true} />
              {t("sellersPage.addSeller")}
            </button>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-lg border border-slate-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2
                className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"
              />
              <p className="mt-3 text-slate-500">{t("dashboard.empty.loading")}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <AlertCircle
                className="w-12 h-12 text-red-500 mb-3"
                aria-hidden={true}
              />
              <p className="text-slate-700 font-medium">
                {t("sellersPage.error.loadFailed")}
              </p>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
              <button
                onClick={() => loadSellers()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Loader2 className="w-4 h-4" aria-hidden={true} />
                Retry
              </button>
            </div>
          ) : sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" aria-hidden={true} />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                {debouncedSearchTerm
                  ? t("sellersPage.empty.noSearchResults")
                  : t("sellersPage.empty.title")}
              </h3>
              <p className="text-slate-500 mb-6 max-w-md">
                {debouncedSearchTerm
                  ? t("sellersPage.empty.noSearchResults")
                  : t("sellersPage.empty.description")}
              </p>
              {!debouncedSearchTerm && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                  disabled
                >
                  <Plus className="w-4 h-4" aria-hidden={true} />
                  {t("sellersPage.addSeller")}
                </button>
              )}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={sellers}
              emptyMessage={t("sellersPage.empty.noSearchResults")}
            />
          )}
        </div>

        {/* Add Seller Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              ref={modalRef}
              className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                  {t("sellersPage.modal.title")}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={t("sellersPage.actions.close")}
                >
                  <X className="w-5 h-5" aria-hidden={true} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <p className="text-sm text-slate-500">{t("sellersPage.modal.subtitle")}</p>

                {/* Global Error */}
                {modalError && (
                  <div
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden={true} />
                    <span>{modalError}</span>
                  </div>
                )}
                {/* Seller Information Section */}
                <fieldset className="space-y-4">
                  <legend className="text-sm font-medium text-slate-900">
                    {t("sellersPage.details.businessInfo")}
                  </legend>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.email")} <span className="text-red-500">*</span>
                      </label>
                      <input ref={firstInputRef} type="email" id="email" name="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.email")} aria-invalid={formErrors.email ? "true" : "false"} aria-describedby={formErrors.email ? "email-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.email && <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.email}</p>}
                    </div>

                    {/* Legal Name */}
                    <div>
                      <label htmlFor="legalName" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.legalName")} <span className="text-red-500">*</span>
                      </label>
                      <input type="text" id="legalName" name="legalName" value={formData.legalName} onChange={(e) => handleInputChange("legalName", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.legalName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.legalName")} aria-invalid={formErrors.legalName ? "true" : "false"} aria-describedby={formErrors.legalName ? "legalName-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.legalName && <p id="legalName-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.legalName}</p>}
                    </div>

                    {/* Business Name */}
                    <div>
                      <label htmlFor="businessName" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.businessName")} <span className="text-red-500">*</span>
                      </label>
                      <input type="text" id="businessName" name="businessName" value={formData.businessName} onChange={(e) => handleInputChange("businessName", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.businessName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.businessName")} aria-invalid={formErrors.businessName ? "true" : "false"} aria-describedby={formErrors.businessName ? "businessName-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.businessName && <p id="businessName-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.businessName}</p>}
                    </div>

                    {/* Tax Registration Number */}
                    <div>
                      <label htmlFor="taxRegistrationNumber" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.taxRegistrationNumber")} <span className="text-red-500">*</span>
                      </label>
                      <input type="text" id="taxRegistrationNumber" name="taxRegistrationNumber" value={formData.taxRegistrationNumber} onChange={(e) => handleInputChange("taxRegistrationNumber", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.taxRegistrationNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.taxRegistrationNumber")} aria-invalid={formErrors.taxRegistrationNumber ? "true" : "false"} aria-describedby={formErrors.taxRegistrationNumber ? "taxRegistrationNumber-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.taxRegistrationNumber && <p id="taxRegistrationNumber-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.taxRegistrationNumber}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.phone")} <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" id="phone" name="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.phone")} aria-invalid={formErrors.phone ? "true" : "false"} aria-describedby={formErrors.phone ? "phone-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.phone && <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.phone}</p>}
                    </div>

                    {/* Business Address */}
                    <div className="md:col-span-2">
                      <label htmlFor="businessAddress" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.businessAddress")} <span className="text-red-500">*</span>
                      </label>
                      <textarea id="businessAddress" name="businessAddress" value={formData.businessAddress} onChange={(e) => handleInputChange("businessAddress", e.target.value)} rows={3} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors resize-none ${formErrors.businessAddress ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.businessAddress")} aria-invalid={formErrors.businessAddress ? "true" : "false"} aria-describedby={formErrors.businessAddress ? "businessAddress-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.businessAddress && <p id="businessAddress-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.businessAddress}</p>}
                    </div>
                  </div>
                </fieldset>

                {/* Store Information Section */}
                <fieldset className="space-y-4">
                  <legend className="text-sm font-medium text-slate-900">
                    {t("sellersPage.details.storeInfo")}
                  </legend>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Store Name */}
                    <div>
                      <label htmlFor="storeName" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.storeName")} <span className="text-red-500">*</span>
                      </label>
                      <input type="text" id="storeName" name="storeName" value={formData.storeName} onChange={(e) => handleStoreNameChange(e.target.value)} className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.storeName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.storeName")} aria-invalid={formErrors.storeName ? "true" : "false"} aria-describedby={formErrors.storeName ? "storeName-error" : undefined} disabled={modalSubmitting} />
                      {formErrors.storeName && <p id="storeName-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.storeName}</p>}
                    </div>

                    {/* Store Slug */}
                    <div>
                      <label htmlFor="storeSlug" className="block text-sm font-medium text-slate-700 mb-1">
                        {t("sellersPage.modal.storeSlug")} <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none" aria-hidden="true">
                          aursuq.com/stores/
                        </span>
                        <input type="text" id="storeSlug" name="storeSlug" value={formData.storeSlug} onChange={(e) => handleStoreSlugChange(e.target.value)} className={`w-full pl-36 px-3 py-2 border rounded-lg text-sm transition-colors ${formErrors.storeSlug ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-300 focus:border-brand-500 focus:ring-brand-500"}`} placeholder={t("sellersPage.modal.storeSlug")} aria-invalid={formErrors.storeSlug ? "true" : "false"} aria-describedby={formErrors.storeSlug ? "storeSlug-error" : undefined} disabled={modalSubmitting} />
                      </div>
                      {formErrors.storeSlug && <p id="storeSlug-error" className="mt-1 text-sm text-red-600" role="alert">{formErrors.storeSlug}</p>}
                      {!formErrors.storeSlug && formData.storeSlug && !slugEditedManually && (
                        <p className="mt-1 text-xs text-slate-500">
                          {t("sellersPage.modal.slugAutoGenerated")}
                        </p>
                      )}
                    </div>
                  </div>
                </fieldset>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors" disabled={modalSubmitting}>
                    {t("sellersPage.actions.cancel")}
                  </button>
                  <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50" disabled={modalSubmitting}>
                    {modalSubmitting && (
                      <Loader2 className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    )}
                    {modalSubmitting ? t("sellersPage.actions.creating") : t("sellersPage.actions.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Seller Modal */}
        {isDeleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">
                  {t("sellersPage.deleteModal.title")}
                </h2>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={t("sellersPage.actions.close")}
                >
                  <X className="w-5 h-5" aria-hidden={true} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-500">{t("sellersPage.deleteModal.message")}</p>

                {/* Global Error */}
                {deleteModalError && (
                  <div
                    className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    role="alert"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden={true} />
                    <span>{deleteModalError}</span>
                  </div>
                )}

                {/* Seller Info */}
                <div className="space-y-3 bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("sellersPage.deleteModal.storeNameLabel")}</span>
                    <span className="font-medium text-slate-900">
                      {sellerToDelete?.store?.name || sellerToDelete?.legalName || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{t("sellersPage.deleteModal.storeNumberLabel")}</span>
                    <span className="font-mono font-medium text-slate-900">
                      {sellerToDelete?.store ? formatStoreNumber(sellerToDelete.store.storeNumber) : "—"}
                    </span>
                  </div>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden={true} />
                  <p className="text-sm text-amber-800">{t("sellersPage.deleteModal.warning")}</p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={deleteModalSubmitting}
                >
                  {t("sellersPage.actions.cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSeller}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={deleteModalSubmitting}
                >
                  {deleteModalSubmitting && (
                    <Loader2 className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden={true} />
                  )}
                  {deleteModalSubmitting ? t("sellersPage.actions.deleting") : t("sellersPage.actions.delete")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {successMessage && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg shadow-lg animate-slide-in" role="status" aria-live="polite">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
            <span className="text-sm text-green-800">
              {t("sellersPage.success.sellerCreated", {
                storeName: successMessage.storeName,
                storeNumber: successMessage.storeNumber,
              })}
            </span>
            <button onClick={() => setSuccessMessage(null)} className="ml-2 p-1 text-green-600 hover:text-green-800" aria-label={t("sellersPage.actions.close")}>
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}