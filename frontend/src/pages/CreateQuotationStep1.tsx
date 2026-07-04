import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, X, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import WizardNavbar from '../components/WizardNavbar';
import WizardProgress from '../components/WizardProgress';
import { quotationService } from '../services/quotationService';
import { leadService, type LeadOption } from '../services/leadService';
import { catalogService } from '../services/catalogService';
import { catalogCategoryService, defaultCatalogCategories } from '../services/catalogCategoryService';
import { addSystemNotification } from '../utils/notifications';
import { EVENT_TYPES_CHANGED_EVENT, getActiveEventTypes } from '../utils/eventTypes';
import { INR_SYMBOL, formatCurrency } from '../utils/currency';

interface ServiceItem {
  id: string;
  refId: number;
  itemType: 'RATE_CARD' | 'PACKAGE' | 'FLORAL' | 'SERVICE' | 'VENDOR';
  name: string;
  price: number;
  cost: number;
  selected: boolean;
}

interface VenueOption {
  id: string;
  refId: number;
  name: string;
  price: number;
  cost: number;
}

const isValidIndianMobileNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  const mobileDigits = digits.startsWith('91') && digits.length === 12
    ? digits.slice(2)
    : digits.startsWith('0') && digits.length === 11
      ? digits.slice(1)
      : digits;

  return /^[6-9]\d{9}$/.test(mobileDigits);
};

const sanitizePhoneInput = (phone: string) => phone.replace(/[^\d\s()+-]/g, '').slice(0, 20);

const CreateQuotationStep1 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [clientOptions, setClientOptions] = useState<LeadOption[]>([]);
  const [clientSearchLoading, setClientSearchLoading] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [venueOptions, setVenueOptions] = useState<VenueOption[]>([]);
  const clientSearchRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    addSystemNotification({
      title: type === 'success' ? 'Quotation Update' : 'Quotation Action Failed',
      desc: message,
      type: 'system',
    });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Form State
  const [clientInfo, setClientInfo] = useState({
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!clientSearchRef.current?.contains(event.target as Node)) {
        setClientDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTerm = clientSearch.trim();

    if (searchTerm.length === 0) {
      setClientOptions([]);
      setClientSearchLoading(false);
      return;
    }

    let cancelled = false;
    setClientSearchLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const leads = await leadService.searchLeads(searchTerm);
        if (!cancelled) {
          setClientOptions(leads);
          setClientDropdownOpen(true);
        }
      } catch {
        if (!cancelled) {
          setClientOptions([]);
        }
      } finally {
        if (!cancelled) {
          setClientSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [clientSearch]);

  useEffect(() => {
    let cancelled = false;

    const normalizeType = (value: string) => {
      const normalized = String(value || '').trim().toUpperCase();
      if (normalized === 'VENUE') return 'VENUES';
      if (normalized === 'SERVICE') return 'SERVICES';
      if (normalized === 'VENDOR') return 'VENDORS';
      if (['FLORAL', 'DECOR', 'DECORATION', 'FLORAL_DECOR', 'FLORAL_DECORATION'].includes(normalized)) return 'FLORAL_DECORATION';
      return normalized;
    };

    const loadCatalogItems = async () => {
      setCatalogLoading(true);
      setCatalogError('');

      try {
        const [priceBooksRes, packagesRes, categoriesRes] = await Promise.all([
          catalogService.getPriceBooks(),
          catalogService.getPackages(),
          catalogCategoryService.list().catch(() => ({ data: defaultCatalogCategories, total: defaultCatalogCategories.length })),
        ]);

        const priceBooks = priceBooksRes.data || [];
        const selectedPriceBook = priceBooks[0];
        const rateCardsRes = selectedPriceBook
          ? await catalogService.getRateCards(Number(selectedPriceBook.price_book_id))
          : { data: [] };
        const activeCategoryCodes = new Set((categoriesRes.data || defaultCatalogCategories).map((category: any) => category.code));
        const rateCards = (rateCardsRes.data || []).filter((item: any) => activeCategoryCodes.has(normalizeType(item.item_type)));

        const venues: VenueOption[] = rateCards
          .filter((item: any) => normalizeType(item.item_type) === 'VENUES')
          .map((item: any) => ({
            id: `rate-${item.rate_card_id}`,
            refId: Number(item.rate_card_id),
            name: item.item_name,
            price: Number(item.rate || 0),
            cost: Number(item.cost || 0),
          }));

        const floralDecorItems: ServiceItem[] = rateCards
          .filter((item: any) => normalizeType(item.item_type) === 'FLORAL_DECORATION')
          .map((item: any) => ({
            id: `floral-${item.rate_card_id}`,
            refId: Number(item.rate_card_id),
            itemType: 'FLORAL',
            name: item.item_name,
            price: Number(item.rate || 0),
            cost: Number(item.cost || 0),
            selected: false,
          }));

        const rateServices: ServiceItem[] = rateCards
          .filter((item: any) => !['VENUES', 'FLORAL_DECORATION', 'PACKAGES'].includes(normalizeType(item.item_type)))
          .map((item: any) => {
            const normalizedType = normalizeType(item.item_type);
            return {
              id: `rate-${item.rate_card_id}`,
              refId: Number(item.rate_card_id),
              itemType: normalizedType === 'VENDORS' ? 'VENDOR' : 'SERVICE',
              name: item.item_name,
              price: Number(item.rate || 0),
              cost: Number(item.cost || 0),
              selected: false,
            };
          });



        const packageServices: ServiceItem[] = activeCategoryCodes.has('PACKAGES') ? (packagesRes.data || []).map((item: any) => ({
          id: `package-${item.package_id}`,
          refId: Number(item.package_id),
          itemType: 'PACKAGE',
          name: item.name,
          price: Number(item.base_price || 0),
          cost: Number(item.base_price || 0),
          selected: false,
        })) : [];
        if (!cancelled) {
          setVenueOptions(venues);
          setSelectedVenueId(prev => prev || venues[0]?.id || '');
          setFloralItems(floralDecorItems);
          setServices([...rateServices, ...packageServices]);
        }
      } catch (error: any) {
        if (!cancelled) {
          setCatalogError(error.message || 'Failed to load price book catalog.');
          setVenueOptions([]);
          setFloralItems([]);
          setServices([]);
        }
      } finally {
        if (!cancelled) {
          setCatalogLoading(false);
        }
      }
    };

    loadCatalogItems();

    return () => {
      cancelled = true;
    };
  }, []);

  const [eventTypes, setEventTypes] = useState(() => getActiveEventTypes());

  useEffect(() => {
    const refreshEventTypes = () => setEventTypes(getActiveEventTypes());
    window.addEventListener(EVENT_TYPES_CHANGED_EVENT, refreshEventTypes);
    window.addEventListener('storage', refreshEventTypes);
    return () => {
      window.removeEventListener(EVENT_TYPES_CHANGED_EVENT, refreshEventTypes);
      window.removeEventListener('storage', refreshEventTypes);
    };
  }, []);


  const [eventDetails, setEventDetails] = useState({
    eventName: '',
    eventType: getActiveEventTypes()[0]?.name || 'Wedding',
    eventDate: '',
    guestCount: '150',
  });
  useEffect(() => {
    if (eventTypes.length > 0 && !eventTypes.some((type) => type.name === eventDetails.eventType)) {
      setEventDetails((prev) => ({ ...prev, eventType: eventTypes[0].name }));
    }
  }, [eventTypes, eventDetails.eventType]);

  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [customVenuePrice, setCustomVenuePrice] = useState<number | null>(null);

  const [floralItems, setFloralItems] = useState<ServiceItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [discountPercent, setDiscountPercent] = useState(0);

  const handleSelectClient = (lead: LeadOption) => {
    setSelectedLeadId(lead.lead_id);
    setClientSearch(lead.name);
    setClientDropdownOpen(false);
    setClientInfo(prev => ({
      ...prev,
      contactName: lead.name,
    }));
  };

  // Validate current step fields before advancing
  const handleNextStep = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError('');
    
    if (currentStep === 1) {
      if (!clientInfo.contactName.trim()) {
        setValidationError('Primary Contact Name is required.');
        return;
      }
      if (!clientInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientInfo.email)) {
        setValidationError('A valid Email Address is required.');
        return;
      }
      if (!isValidIndianMobileNumber(clientInfo.phone)) {
        setValidationError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
        return;
      }
    } else if (currentStep === 2) {
      if (!eventDetails.eventName.trim()) {
        setValidationError('Event Name is required.');
        return;
      }
      if (!eventDetails.eventDate) {
        setValidationError('Event Date is required.');
        return;
      }
      if (Number(eventDetails.guestCount) <= 0) {
        setValidationError('Guest Count must be a valid number greater than 0.');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBackStep = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setValidationError('');
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate('/quotations');
    }
  };

  // Computations
  const getSelectedVenue = () => venueOptions.find(v => v.id === selectedVenueId) || null;
  const getVenuePrice = () => {
    const venue = getSelectedVenue();
    return venue?.price || 0;
  };

  const getFloralSubtotal = () => {
    return floralItems
      .filter(s => s.selected)
      .reduce((sum, s) => sum + s.price, 0);
  };

  const getServicesSubtotal = () => {
    return services
      .filter(s => s.selected)
      .reduce((sum, s) => sum + s.price, 0);
  };

  const getSubtotal = () => {
    return getVenuePrice() + getFloralSubtotal() + getServicesSubtotal();
  };

  const getDiscountValue = () => {
    return (getSubtotal() * discountPercent) / 100;
  };

  const getTaxableAmount = () => {
    return getSubtotal() - getDiscountValue();
  };

  const getTaxAmount = () => {
    return (getTaxableAmount() * 18) / 100; // GST 18% standard
  };

  const getGrandTotal = () => {
    return getTaxableAmount() + getTaxAmount();
  };

  // Submit to Backend on Step 7
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 7) {
      handleNextStep();
      return;
    }
    setLoading(true);
    try {
      // 1. Map wizard choices to standard quotation lines
      const quotationLines: any[] = [];
      
      // Add Venue Line if price > 0
      const venue = getSelectedVenue();
      if (venue && getVenuePrice() > 0) {
        quotationLines.push({
          item_type: 'RATE_CARD',
          ref_id: venue.refId,
          description: `${venue.name} Rental - ${eventDetails.eventType}`,
          qty: 1,
          rate: getVenuePrice(),
          cost: venue.cost,
        });
      }

      // Add selected floral and decoration lines
      floralItems.filter(s => s.selected).forEach(s => {
        quotationLines.push({
          item_type: 'FLORAL',
          ref_id: s.refId,
          description: s.name,
          qty: 1,
          rate: s.price,
          cost: s.cost,
        });
      });

      // Add selected services lines
      services.filter(s => s.selected).forEach(s => {
        quotationLines.push({
          item_type: s.itemType,
          ref_id: s.refId,
          description: s.name,
          qty: 1,
          rate: s.price,
          cost: s.cost,
        });
      });

      // 2. Resolve lead, then submit to backend
      const resolvedLeadId = selectedLeadId ?? (await leadService.createLead(clientInfo.contactName.trim())).lead_id;
      const response = await quotationService.createQuotation({
        lead_id: resolvedLeadId,
        currency: 'INR',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lines: quotationLines,
      });

      // 3. Update the subtotal / margins on backend if needed
      await quotationService.updateQuotation(response.quotation_id, {
        discount_percent: discountPercent,
        tax_rate: 18.0,
      });

      showToast('Quotation created successfully! Routing to builder...', 'success');
      setTimeout(() => {
        navigate(`/quotation-builder?id=${response.quotation_id}`);
      }, 1500);
    } catch (error: any) {
      showToast(`Error creating quotation: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans pb-20">
      <WizardNavbar />
      <WizardProgress currentStep={currentStep} />

      <div className="w-full max-w-[900px] mx-auto bg-white rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden border border-[#ECECF1]">
        
        <div className="h-[140px] px-10 border-b border-[#ECECF1] flex items-center justify-between bg-white relative z-10">
          <div>
            <h2 className="text-[36px] font-bold text-gray-900 tracking-tight leading-none mb-2">
              {currentStep === 1 && 'Client Information'}
              {currentStep === 2 && 'Event Details'}
              {currentStep === 3 && 'Venue Selection'}
              {currentStep === 4 && 'Floral & Decoration'}
              {currentStep === 5 && 'Services Selection'}
              {currentStep === 6 && 'Pricing & Discounts'}
              {currentStep === 7 && 'Review & Finalize'}
            </h2>
            <p className="text-[18px] font-medium text-gray-500">
              {currentStep === 1 && 'Identify the recipient of this concierge quotation.'}
              {currentStep === 2 && 'Specify the core details for this private event proposal.'}
              {currentStep === 3 && 'Select a primary venue location and customize rates.'}
              {currentStep === 4 && 'Select floral, decor, and styling items from your Price Book.'}
              {currentStep === 5 && 'Check add-on service packages for your quotation.'}
              {currentStep === 6 && 'Review calculated totals and configure custom discounts.'}
              {currentStep === 7 && 'Verify all setup parameters before compiling quotation.'}
            </p>
          </div>
          <div>
            <span className="text-[14px] font-bold text-[#B3262E] uppercase tracking-widest">
              Step {currentStep} of 7
            </span>
          </div>
        </div>

        {validationError && (
          <div className="bg-red-50 border-b border-red-100 px-10 py-3 flex items-center gap-3 text-red-700 text-sm font-bold animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {validationError}
          </div>
        )}

        <form onSubmit={onSubmit}>
          {currentStep === 1 && (
            <div className="p-10 space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-bold text-gray-900">Search Existing Client</label>
                <div ref={clientSearchRef} className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setSelectedLeadId(null);
                      setClientDropdownOpen(true);
                    }}
                    onFocus={() => {
                      if (clientSearch.trim() || clientOptions.length > 0) {
                        setClientDropdownOpen(true);
                      }
                    }}
                    placeholder="Start typing name, email or company..."
                    className="w-full h-14 pl-12 pr-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-blue-300"
                  />
                  {clientDropdownOpen && clientSearch.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-[62px] z-30 overflow-hidden rounded-[16px] border border-[#D8E3F8] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]">
                      {clientSearchLoading ? (
                        <div className="px-5 py-4 text-sm font-semibold text-gray-500">Searching clients...</div>
                      ) : clientOptions.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto py-2">
                          {clientOptions.map((lead) => (
                            <button
                              key={lead.lead_id}
                              type="button"
                              onClick={() => handleSelectClient(lead)}
                              className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-[#F5F7FC] focus:bg-[#F5F7FC] focus:outline-none"
                            >
                              <span className="text-[15px] font-bold text-gray-900">{lead.name}</span>
                              <span className="text-xs font-semibold text-gray-400">#{lead.lead_id}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-5 py-4 text-sm font-semibold text-gray-500">No matching clients found.</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedLeadId && (
                  <p className="text-xs font-bold text-emerald-600">Selected existing client ID #{selectedLeadId}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-gray-900">Primary Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={clientInfo.contactName}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="e.g. Julianne Moore"
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-gray-900">Company Name</label>
                  <input
                    type="text"
                    value={clientInfo.companyName}
                    onChange={(e) => setClientInfo(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g. Luxe Media Group"
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                  />
                </div>
              </div>

              <div className="border-t border-[#ECECF1] my-8"></div>

              <div>
                <h3 className="text-[20px] font-bold text-gray-900 mb-6">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-[15px] font-bold text-gray-900">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="client@example.com"
                      className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[15px] font-bold text-gray-900">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      inputMode="tel"
                      maxLength={20}
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, phone: sanitizePhoneInput(e.target.value) }))}
                      placeholder="+91 98765-43210"
                      className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                    />
                    <p className="text-xs font-medium text-gray-400">Use a 10-digit mobile number, optionally with +91.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#F3F5FF] border border-[#E0E7FF] rounded-[18px] p-6 flex gap-4">
                <div className="shrink-0 mt-0.5"><Info className="w-6 h-6 text-[#B3262E]" /></div>
                <p className="text-[15px] font-medium text-gray-700 leading-relaxed">
                  <span className="font-bold text-gray-900">Privacy Note:</span> All client data is encrypted and handled according to our enterprise concierge privacy standards.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-10 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-gray-900">Event Name *</label>
                  <input
                    type="text"
                    required
                    value={eventDetails.eventName}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, eventName: e.target.value }))}
                    placeholder="e.g. Royal Wedding Reception"
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-gray-900">Event Type</label>
                  <select
                    value={eventDetails.eventType}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-semibold text-gray-900 focus:outline-none focus:border-red-300"
                  >
                    {eventTypes.length === 0 && <option value="">No active event types</option>}
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-gray-900">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDetails.eventDate}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300 text-gray-900"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-gray-900">Guest Count *</label>
                  <input
                    type="number"
                    required
                    value={eventDetails.guestCount}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, guestCount: e.target.value }))}
                    placeholder="e.g. 250"
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-10 space-y-8 animate-in fade-in duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-bold text-gray-900">Select Venue Option</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catalogLoading && (
                    <div className="col-span-full rounded-[20px] border border-[#ECECF1] bg-[#F8F9FC] p-6 text-sm font-bold text-gray-500">
                      Loading venues from Price Book...
                    </div>
                  )}
                  {!catalogLoading && catalogError && (
                    <div className="col-span-full rounded-[20px] border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">
                      {catalogError}
                    </div>
                  )}
                  {!catalogLoading && !catalogError && venueOptions.length === 0 && (
                    <div className="col-span-full rounded-[20px] border border-[#ECECF1] bg-[#F8F9FC] p-6 text-sm font-bold text-gray-500">
                      No venue rate cards found. Add venue items in Price Book to select them here.
                    </div>
                  )}
                  {!catalogLoading && !catalogError && venueOptions.map(v => {
                    const isSelected = selectedVenueId === v.id;
                    return (
                      <div 
                        key={v.id}
                        onClick={() => setSelectedVenueId(v.id)}
                        className={`p-6 rounded-[20px] border-2 cursor-pointer transition-all flex items-start justify-between ${
                          isSelected ? 'border-red-700 bg-red-50/50' : 'border-[#ECECF1] bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-gray-900">{v.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {v.price > 0 ? formatCurrency(v.price) : 'Custom Pricing'}
                          </p>
                        </div>
                        {isSelected && <div className="w-5 h-5 rounded-full bg-red-700 flex items-center justify-center text-white"><Check className="w-3.5 h-3.5" /></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedVenueId === 'v4' && (
                <div className="flex flex-col gap-2 animate-in slide-in-from-top-4 duration-300">
                  <label className="text-[15px] font-bold text-gray-900">Custom Venue Cost ({INR_SYMBOL})</label>
                  <input
                    type="number"
                    required
                    value={customVenuePrice || ''}
                    onChange={(e) => setCustomVenuePrice(Number(e.target.value))}
                    placeholder="Enter custom venue price..."
                    className="w-full h-14 px-5 bg-[#F5F7FC] border border-transparent rounded-[16px] text-[15px] font-medium focus:outline-none focus:border-red-300"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="p-10 space-y-6 animate-in fade-in duration-300">
              <p className="text-sm font-semibold text-gray-500">Choose floral, decoration, and styling items from the Price Book.</p>
              
              <div className="space-y-3">
                {catalogLoading && (
                  <div className="rounded-[18px] border border-[#ECECF1] bg-[#F8F9FC] p-5 text-sm font-bold text-gray-500">
                    Loading floral and decoration items from Price Book...
                  </div>
                )}
                {!catalogLoading && catalogError && (
                  <div className="rounded-[18px] border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
                    {catalogError}
                  </div>
                )}
                {!catalogLoading && !catalogError && floralItems.length === 0 && (
                  <div className="rounded-[18px] border border-[#ECECF1] bg-[#F8F9FC] p-5 text-sm font-bold text-gray-500">
                    No floral or decoration rate cards found. Add them in Price Book under Floral & Decoration to select them here.
                  </div>
                )}
                {!catalogLoading && !catalogError && floralItems.map((item, idx) => (
                  <label 
                    key={item.id}
                    className={`p-5 rounded-[18px] border flex items-center justify-between cursor-pointer transition-all ${
                      item.selected ? 'bg-red-50/40 border-red-200' : 'bg-white border-[#ECECF1] hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {
                          const updated = [...floralItems];
                          updated[idx].selected = !updated[idx].selected;
                          setFloralItems(updated);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-red-700 focus:ring-red-400"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Price Book floral & decoration rate card</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="p-10 space-y-6 animate-in fade-in duration-300">
              <p className="text-sm font-semibold text-gray-500">Choose add-on packages to apply automatically to the quotation sheets.</p>
              
              <div className="space-y-3">
                {catalogLoading && (
                  <div className="rounded-[18px] border border-[#ECECF1] bg-[#F8F9FC] p-5 text-sm font-bold text-gray-500">
                    Loading services and packages from Price Book...
                  </div>
                )}
                {!catalogLoading && catalogError && (
                  <div className="rounded-[18px] border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
                    {catalogError}
                  </div>
                )}
                {!catalogLoading && !catalogError && services.length === 0 && (
                  <div className="rounded-[18px] border border-[#ECECF1] bg-[#F8F9FC] p-5 text-sm font-bold text-gray-500">
                    No services, vendors, or packages found. Add them in Price Book to select them here.
                  </div>
                )}
                {!catalogLoading && !catalogError && services.map((item, idx) => (
                  <label 
                    key={item.id}
                    className={`p-5 rounded-[18px] border flex items-center justify-between cursor-pointer transition-all ${
                      item.selected ? 'bg-red-50/40 border-red-200' : 'bg-white border-[#ECECF1] hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input 
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {
                          const updated = [...services];
                          updated[idx].selected = !updated[idx].selected;
                          setServices(updated);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-red-700 focus:ring-red-400"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.itemType === 'PACKAGE' ? 'Price Book package' : 'Price Book rate card'}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(item.price)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="p-10 space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#F8F9FC] border border-[#ECECF1] rounded-[24px] p-6 space-y-4">
                  <h4 className="font-bold text-gray-900 text-base">Adjustments</h4>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2">Discount Percentage (%)</label>
                    <input 
                      type="number"
                      max={100}
                      min={0}
                      value={discountPercent || ''}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                      placeholder="e.g. 5"
                      className="w-full h-12 px-4 bg-white border border-[#ECECF1] rounded-xl text-[14px] focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-normal">
                    Discounts exceeding 15% require director authorization and will trigger a standard workflow rule check.
                  </p>
                </div>

                <div className="bg-white border border-[#ECECF1] rounded-[24px] p-6 space-y-3">
                  <h4 className="font-bold text-gray-900 text-base mb-4">Pricing Estimation</h4>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(getSubtotal())}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>Discount ({discountPercent}%)</span>
                      <span>-{formatCurrency(getDiscountValue())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                    <span>Taxable Base</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(getTaxableAmount())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(getTaxAmount())}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-red-700 pt-3 border-t-2 border-dashed border-[#ECECF1]">
                    <span>Grand Total</span>
                    <span>{formatCurrency(getGrandTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div className="p-10 space-y-8 animate-in fade-in duration-300">
              <div className="border border-[#ECECF1] rounded-[24px] overflow-hidden">
                <div className="bg-red-700 px-6 py-4 text-white">
                  <h4 className="font-bold text-md">Quotation Brief</h4>
                  <p className="text-xs opacity-80 mt-1">Review the details carefully before generation.</p>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6 border-b border-[#ECECF1] pb-6">
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Client Name</p>
                      <p className="text-sm font-bold text-gray-900">{clientInfo.contactName}</p>
                      <p className="text-xs text-gray-500">{clientInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-bold uppercase mb-1">Event Brief</p>
                      <p className="text-sm font-bold text-gray-900">{eventDetails.eventName}</p>
                      <p className="text-xs text-gray-500">{eventDetails.guestCount} Guests &bull; {eventDetails.eventType}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Line Items List</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{getSelectedVenue()?.name || 'No venue selected'} Rental</span>
                      <span className="font-bold text-gray-900">{formatCurrency(getVenuePrice())}</span>
                    </div>
                    {floralItems.filter(s => s.selected).map(s => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{s.name}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                    {services.filter(s => s.selected).map(s => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{s.name}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(s.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#F8F9FC] p-4 rounded-xl flex justify-between items-center border border-[#ECECF1]">
                    <span className="text-sm font-bold text-gray-700">Estimated Total (incl. GST)</span>
                    <span className="text-xl font-black text-red-700">{formatCurrency(getGrandTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="h-[110px] px-8 border-t border-[#ECECF1] bg-white flex items-center justify-between rounded-b-[32px]">
            <button 
              type="button" 
              onClick={handleBackStep}
              disabled={loading}
              className="flex items-center gap-2 text-[16px] font-semibold text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              {currentStep === 1 ? 'Cancel Quotation' : 'Back Step'}
            </button>
            
            <div className="flex items-center gap-4">
              {currentStep < 7 ? (
                <button 
                  type="button" 
                  onClick={handleNextStep}
                  className="h-14 w-[260px] rounded-full bg-gradient-to-r from-red-600 to-orange-400 text-white text-[16px] font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-orange-500 transition-all shadow-md hover:shadow-lg"
                >
                  {currentStep === 1 && 'Next: Event Details'}
                  {currentStep === 2 && 'Next: Venue Selection'}
                  {currentStep === 3 && 'Next: Floral & Decoration'}
                  {currentStep === 4 && 'Next: Add Services'}
                  {currentStep === 5 && 'Next: Configure Pricing'}
                  {currentStep === 6 && 'Next: Review Brief'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="h-14 w-[260px] rounded-full bg-gradient-to-r from-red-600 to-orange-400 text-white text-[16px] font-bold flex items-center justify-center gap-2 hover:from-red-700 hover:to-orange-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Compiling...' : 'Create Quotation'}
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

        </form>
      </div>

      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-300">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-red-50 border-red-100 text-red-800'
          }`}>
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm leading-none mb-1">
                {toast.type === 'success' ? 'Success' : 'Action Failed'}
              </p>
              <p className="text-xs font-medium opacity-90">{toast.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-4 hover:opacity-75 transition-opacity"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CreateQuotationStep1;












