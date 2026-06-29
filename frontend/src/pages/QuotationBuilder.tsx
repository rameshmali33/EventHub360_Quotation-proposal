import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BuilderTopHeader from '../components/BuilderTopHeader';
import ServiceAccordion from '../components/ServiceAccordion';
import QuotationTableEditor from '../components/QuotationTableEditor';
import CateringTableEditor from '../components/CateringTableEditor';
import QuoteSummaryCard from '../components/QuoteSummaryCard';
import ProfitMarginCard from '../components/ProfitMarginCard';
import EventInfoCard from '../components/EventInfoCard';
import ProposalGeneratorCard from '../components/ProposalGeneratorCard';
import { MapPin, Palette, Utensils, Music, Save, Check, AlertCircle, X } from 'lucide-react';
import { quotationService } from '../services/quotationService';
import { approvalService } from '../services/approvalService';
import { addSystemNotification } from '../utils/notifications';

const initialData = {
  venue: [],
  floral: [],
  catering: [],
  entertainment: []
};

const DEFAULT_COST_RATIOS: Record<string, number> = {
  venue: 0.68,
  floral: 0.62,
  catering: 0.72,
  entertainment: 0.70,
};

const QuotationBuilder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlId = searchParams.get('id');
  const [fallbackId, setFallbackId] = useState<string | null>(null);
  const quotationId = urlId || fallbackId;
  const [sections, setSections] = useState<any>(initialData);
  const [activePackage, setActivePackage] = useState<string>('custom');
  const [quoteStatus, setQuoteStatus] = useState<string>('DRAFT');
  const [leadName, setLeadName] = useState<string>('');
  const [leadId, setLeadId] = useState<number | null>(null);
  // Backend-calculated totals (from DB)
  const [quoteSubtotal, setQuoteSubtotal] = useState<number | null>(null);
  const [quoteTaxTotal, setQuoteTaxTotal] = useState<number | null>(null);
  const [quoteTotal, setQuoteTotal] = useState<number | null>(null);
  const [quoteMargin, setQuoteMargin] = useState<number | null>(null);

  const CATERING_PACKAGES: Record<string, { name: string; items: { description: string; price: number }[] }> = {
    silver: {
      name: 'Silver Package',
      items: [
        { description: 'Welcome Drink', price: 100 },
        { description: 'Breakfast Buffet', price: 200 },
        { description: 'Lunch Buffet', price: 300 }
      ]
    },
    gold: {
      name: 'Gold Package',
      items: [
        { description: 'Welcome Drink', price: 150 },
        { description: 'High Tea', price: 250 },
        { description: 'Dinner Buffet', price: 800 }
      ]
    },
    platinum: {
      name: 'Platinum Package',
      items: [
        { description: 'Welcome Drink', price: 200 },
        { description: 'Mocktail Counter', price: 300 },
        { description: 'Live Pasta Counter', price: 350 },
        { description: 'Dinner Buffet', price: 1150 }
      ]
    }
  };

  const getCurrentGuestCount = () => {
    // Check catering items first
    const cateringItem = sections.catering.find((item: any) => Number(item.qty) > 1);
    if (cateringItem) return Number(cateringItem.qty);
    
    // Or any other section
    for (const key of Object.keys(sections)) {
      const item = sections[key].find((item: any) => Number(item.qty) > 1);
      if (item) return Number(item.qty);
    }
    
    return 150; // default fallback
  };

  const handlePackageSelect = (pkgName: string) => {
    setQuoteMargin(null);
    setActivePackage(pkgName);
    if (pkgName !== 'custom') {
      const pkg = CATERING_PACKAGES[pkgName];
      if (pkg) {
        const guests = getCurrentGuestCount();
        const newItems = pkg.items.map((item, index) => ({
          id: `new-c-${pkgName}-${index}-${Math.random().toString(36).substring(7)}`,
          description: item.description,
          qty: guests,
          price: item.price,
          discount: 0
        }));
        setSections((prev: any) => ({
          ...prev,
          catering: newItems
        }));
      }
    }
  };
  const [originalLines, setOriginalLines] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const mapDbLinesToSections = (dbLines: any[]) => {
    const venue: any[] = [];
    const floral: any[] = [];
    const catering: any[] = [];
    const entertainment: any[] = [];

    dbLines.forEach((line: any) => {
      const item = {
        id: String(line.line_id),
        description: line.description,
        qty: line.qty,
        price: Number(line.rate) || 0,
        cost: Number(line.cost) || 0,
        discount: 0,
      };

      const descLower = line.description.toLowerCase();
      const type = (line.item_type || '').toUpperCase();

      if (type === 'VENUE') {
        venue.push(item);
      } else if (['FLORAL', 'FLORAL_DECORATION'].includes(type)) {
        floral.push(item);
      } else if (type === 'CATERING') {
        catering.push(item);
      } else if (type === 'ENTERTAINMENT') {
        entertainment.push(item);
      } else {
        // Fallback for custom entries or older service types
        const isCatering = 
          descLower.includes('catering') || descLower.includes('gourmet') || 
          descLower.includes('food') || descLower.includes('beverage') || 
          descLower.includes('silver tier') || descLower.includes('buffet') || 
          descLower.includes('drink') || descLower.includes('tea') || 
          descLower.includes('tikka') || descLower.includes('starter') || 
          descLower.includes('soup') || descLower.includes('course') || 
          descLower.includes('dessert') || descLower.includes('ice cream') || 
          descLower.includes('mocktail') || descLower.includes('pasta') || 
          descLower.includes('pizza') || descLower.includes('fountain') || 
          descLower.includes('coffee') || descLower.includes('menu') || 
          descLower.includes('meals') || descLower.includes('counter') || 
          descLower.includes('station') || descLower.includes('snack') ||
          descLower.includes('request');

        if (descLower.includes('venue') || descLower.includes('rental') || descLower.includes('ballroom') || descLower.includes('terrace') || descLower.includes('pavilion') || descLower.includes('plaza') || descLower.includes('resort') || descLower.includes('banquet') || descLower.includes('hall')) {
          venue.push(item);
        } else if (isCatering) {
          catering.push(item);
        } else {
          entertainment.push(item);
        }
      }
    });

    return { venue, floral, catering, entertainment };
  };

  // Load Fallback ID if not provided in URL query
  useEffect(() => {
    if (!urlId) {
      quotationService.getQuotations({ limit: 1 })
        .then(res => {
          const quote = res.data?.[0];
          if (quote) {
            setFallbackId(String(quote.quotation_id));
          }
        })
        .catch(err => console.error('Failed to load fallback quotation:', err));
    }
  }, [urlId]);

  // Load Quotation Lines from Backend
  useEffect(() => {
    if (quotationId) {
      setLoading(true);
      quotationService.getQuotation(Number(quotationId))
        .then(async res => {
          if (res) {
            let quote = res;
            const hasTaxableLines = Array.isArray(res.lines) && res.lines.length > 0 && Number(res.subtotal || 0) > 0;
            if (hasTaxableLines && Number(res.tax_total || 0) === 0) {
              quote = await quotationService.calculate(Number(quotationId));
            }

            setQuoteStatus(quote.status || 'DRAFT');
            // Populate lead/client name from API response
            const name =
              quote.lead?.name ||
              quote.lead_name ||
              quote.client_name ||
              quote.contact_name ||
              '';
            setLeadName(name);
            setLeadId(quote.lead_id || null);
            // Store backend-calculated totals
            setQuoteSubtotal(Number(quote.subtotal) || null);
            setQuoteTaxTotal(Number(quote.tax_total) || null);
            setQuoteTotal(Number(quote.total) || null);
            setQuoteMargin(quote.margin === null || quote.margin === undefined ? null : Number(quote.margin));
            if (quote.lines) {
              setOriginalLines(quote.lines);
              const mapped = mapDbLinesToSections(quote.lines);
              setSections(mapped);
            }
          }
        })
        .catch(err => console.error('Failed to load quotation details:', err))
        .finally(() => setLoading(false));
    }
  }, [quotationId]);

  const calculateSubtotal = () => {
    let subtotal = 0;
    Object.values(sections).forEach((items: any) => {
      items.forEach((item: any) => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.price) || 0;
        const discount = Number(item.discount) || 0;
        subtotal += (qty * price) * (1 - discount / 100);
      });
    });
    return subtotal;
  };

  const calculateEstimatedMargin = () => {
    if (quoteMargin !== null) {
      return quoteMargin;
    }

    let margin = 0;
    Object.entries(sections).forEach(([sectionKey, items]: [string, any]) => {
      const costRatio = DEFAULT_COST_RATIOS[sectionKey] ?? 0.70;
      items.forEach((item: any) => {
        const qty = Number(item.qty) || 0;
        const price = Number(item.price) || 0;
        const cost = Number(item.cost);
        const discount = Number(item.discount) || 0;
        const netAmount = (qty * price) * (1 - discount / 100);
        const estimatedCost = Number.isFinite(cost) && cost > 0 ? qty * cost : qty * price * costRatio;
        margin += netAmount - estimatedCost;
      });
    });
    return margin;
  };

  const handleUpdate = (sectionKey: any, id: any, field: any, value: any) => {
    setQuoteMargin(null);
    setSections((prev: any) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].map((item: any) => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleDelete = (sectionKey: any, id: any) => {
    setQuoteMargin(null);
    setSections((prev: any) => ({
      ...prev,
      [sectionKey]: prev[sectionKey].filter((item: any) => item.id !== id)
    }));
  };

  const handleAdd = (sectionKey: any, defaultVals?: { description: string; qty: number; price: number }) => {
    setQuoteMargin(null);
    const newItem = {
      id: `new-${Math.random().toString(36).substring(7)}`,
      description: defaultVals?.description || 'New Item',
      qty: defaultVals?.qty !== undefined ? defaultVals.qty : 1,
      price: defaultVals?.price !== undefined ? defaultVals.price : 0,
      discount: 0
    };
    setSections((prev: any) => ({
      ...prev,
      [sectionKey]: [...prev[sectionKey], newItem]
    }));
  };

  const handleSaveChanges = async () => {
    if (!quotationId) return false;
    setSaving(true);
    try {
      // 1. Gather all items currently in state
      const currentItems: any[] = [];
      Object.keys(sections).forEach(sectionKey => {
        sections[sectionKey].forEach((item: any) => {
          currentItems.push({
            ...item,
            sectionKey
          });
        });
      });

      // 2. Separate into new (added) and existing (to update)
      const itemsToAdd = currentItems.filter(item => String(item.id).startsWith('new-'));
      const itemsToUpdate = currentItems.filter(item => !String(item.id).startsWith('new-'));

      // 3. Identify deleted lines (exist in originalLines, but absent in currentItems)
      const currentIds = new Set(currentItems.map(item => String(item.id)));
      const itemsToDelete = originalLines.filter(line => !currentIds.has(String(line.line_id)));

      // 4. Run API Synchronization requests
      // Delete lines
      for (const line of itemsToDelete) {
        await quotationService.removeLine(Number(quotationId), Number(line.line_id));
      }

      // Update lines
      for (const item of itemsToUpdate) {
        await quotationService.updateLine(Number(quotationId), Number(item.id), {
          qty: Number(item.qty) || 0,
          rate: Number(item.price) || 0,
          cost: Number(item.cost) || 0,
          description: item.description
        });
      }

      // Add lines
      for (const item of itemsToAdd) {
        await quotationService.addLine(Number(quotationId), {
          item_type: item.sectionKey.toUpperCase(),
          ref_id: 3, // fallback rate card identifier
          description: item.description,
          qty: Number(item.qty) || 0,
          rate: Number(item.price) || 0,
          cost: Number(item.cost) || 0
        });
      }

      // 5. Trigger calculation recalculation on backend
      await quotationService.calculate(Number(quotationId));

      // 6. Reload updated records to synchronize IDs
      const res = await quotationService.getQuotation(Number(quotationId));
      if (res) {
        setQuoteStatus(res.status || 'DRAFT');
        const name =
          res.lead?.name ||
          res.lead_name ||
          res.client_name ||
          res.contact_name ||
          '';
        setLeadName(name);
        setLeadId(res.lead_id || null);
        // Sync backend-calculated totals after save
        setQuoteSubtotal(Number(res.subtotal) || null);
        setQuoteTaxTotal(Number(res.tax_total) || null);
        setQuoteTotal(Number(res.total) || null);
        if (res.lines) {
          setOriginalLines(res.lines);
          const mapped = mapDbLinesToSections(res.lines);
          setSections(mapped);
        }
      }

      showToast('Changes and additions saved successfully!', 'success');
      return true;
    } catch (err: any) {
      showToast(`Failed to save changes: ${err.message}`, 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRequestApproval = async () => {
    if (!quotationId) return;
    setSaving(true);
    try {
      // First save changes to ensure DB is up to date
      const saveSuccess = await handleSaveChanges();
      if (!saveSuccess) return;
      
      // Request approval
      await approvalService.requestApproval(Number(quotationId), {
        discountPercent: 0,
        notes: "Resubmitted after line item modifications"
      });
      
      // Refresh status
      const quoteRes = await quotationService.getQuotation(Number(quotationId));
      if (quoteRes) {
        setQuoteStatus(quoteRes.status || 'DRAFT');
      }
      showToast('Approval request submitted successfully!', 'success');
    } catch (err: any) {
      showToast(`Failed to submit approval request: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <BuilderTopHeader />
        
        <main className="flex-1 overflow-y-auto p-8 pb-20">
          <div className="max-w-[1400px] mx-auto">
            
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-[40px] font-bold text-gray-900 tracking-tight leading-none">
                    {leadName || (quotationId ? `Quotation #${String(quotationId).padStart(5, '0')}` : 'Quotation Builder')}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 text-[12px] font-bold rounded-full uppercase tracking-wider ${
                      quoteStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      quoteStatus === 'PENDING_APPROVAL' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      quoteStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {quoteStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
                <p className="text-[16px] font-medium text-gray-500">
                  Quote {quotationId ? `#Q-${String(quotationId).padStart(5, '0')}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {(quoteStatus === 'DRAFT' || quoteStatus === 'REJECTED' || quoteStatus === 'CHANGES_REQUESTED') && (
                  <button
                    onClick={handleRequestApproval}
                    disabled={saving}
                    className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-full font-bold text-[15px] hover:from-indigo-700 hover:to-purple-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    Submit for Approval
                  </button>
                )}

                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="h-12 px-6 bg-gradient-to-r from-red-600 to-orange-400 text-white rounded-full font-bold text-[15px] hover:from-red-700 hover:to-orange-500 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="flex flex-col xl:flex-row gap-8">
              
              {/* Left Column - Builder Content */}
              <div className="flex-1 xl:w-[70%]">
                
                {/* Section 1: Venue */}
                <ServiceAccordion icon={MapPin} title="Venue Selection">
                  <QuotationTableEditor 
                    items={sections.venue}
                    onAdd={() => handleAdd('venue')}
                    onUpdate={(id: any, f: any, v: any) => handleUpdate('venue', id, f, v)}
                    onDelete={(id: any) => handleDelete('venue', id)}
                  />
                </ServiceAccordion>

                {/* Section 2: Floral */}
                <ServiceAccordion icon={Palette} title="Floral & Decoration">
                  <QuotationTableEditor 
                    items={sections.floral}
                    onAdd={() => handleAdd('floral')}
                    onUpdate={(id: any, f: any, v: any) => handleUpdate('floral', id, f, v)}
                    onDelete={(id: any) => handleDelete('floral', id)}
                  />
                </ServiceAccordion>

                {/* Section 3: Catering */}
                <ServiceAccordion icon={Utensils} title="Gourmet Catering">
                  <CateringTableEditor 
                    items={sections.catering}
                    onAdd={(defaultVals) => handleAdd('catering', defaultVals)}
                    onUpdate={(id: any, f: any, v: any) => handleUpdate('catering', id, f, v)}
                    onDelete={(id: any) => handleDelete('catering', id)}
                    onPackageSelect={handlePackageSelect}
                    activePackage={activePackage}
                  />
                </ServiceAccordion>

                {/* Section 4: Entertainment */}
                <ServiceAccordion icon={Music} title="Entertainment & Sound">
                  <QuotationTableEditor 
                    items={sections.entertainment}
                    onAdd={() => handleAdd('entertainment')}
                    onUpdate={(id: any, f: any, v: any) => handleUpdate('entertainment', id, f, v)}
                    onDelete={(id: any) => handleDelete('entertainment', id)}
                  />
                </ServiceAccordion>

              </div>

              {/* Right Column - Sticky Panel */}
              <div className="w-full xl:w-[30%] relative">
                <div className="sticky top-0 pt-2">
                  <QuoteSummaryCard
                    subtotal={quoteSubtotal}
                    taxTotal={quoteTaxTotal}
                    total={quoteTotal}
                    liveSubtotal={calculateSubtotal()}
                  />
                  <ProfitMarginCard subtotal={quoteSubtotal ?? calculateSubtotal()} margin={calculateEstimatedMargin()} />
                  <EventInfoCard />
                  <ProposalGeneratorCard quotationId={quotationId} quoteStatus={quoteStatus} />
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Premium Toast Notification */}
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

export default QuotationBuilder;









