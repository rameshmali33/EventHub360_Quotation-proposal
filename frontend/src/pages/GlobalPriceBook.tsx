import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import Pagination from '../components/Pagination';
import ConfirmationModal from '../components/ConfirmationModal';
import { catalogService } from '../services/catalogService';
import { Upload, ChevronDown, Plus, LayoutGrid, List, MoreVertical, Loader, X, Image as ImageIcon, Edit3, Trash2, Settings2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { CatalogCategoryItem, catalogCategoryService, defaultCatalogCategories } from '../services/catalogCategoryService';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
};

const DEFAULT_SEASONAL_PERCENTAGE = 15;
const SEASONAL_PERCENTAGE_STORAGE_KEY = 'price_book_seasonal_percentage';

const normalizeItemType = (value: string) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'VENUE') return 'VENUES';
  if (normalized === 'VENDOR') return 'VENDORS';
  if (normalized === 'SERVICE') return 'SERVICES';
  if (['FLORAL', 'DECOR', 'DECORATION', 'FLORAL_DECOR', 'FLORAL_DECORATION'].includes(normalized)) return 'FLORAL_DECORATION';
  return normalized;
};

const tabToItemType = (tab: string) => normalizeItemType(tab);

const inferItemType = (itemName: string) => {
  if (/ballroom|atrium|terrace|lounge|cellar|tent|hall|room|plaza|venue|resort|banquet/i.test(itemName)) {
    return 'VENUES';
  }
  if (/floral|decor|decoration|flower|orchid|centerpiece|mandap|stage/i.test(itemName)) {
    return 'FLORAL_DECORATION';
  }
  if (/photographer|videography|dj|band|caterer|florist|drone|makeup|planner|vendor/i.test(itemName)) {
    return 'VENDORS';
  }
  return 'SERVICES';
};

// ==========================================
// INLINE COMPONENTS WITH PROPS
// ==========================================

const CategoryTabs = ({ 
  activeTab, 
  setActiveTab, 
  categories,
  seasonalPricing, 
  setSeasonalPricing, 
  seasonalPercentage,
  setSeasonalPercentage,
  viewMode, 
  setViewMode 
}: { 
  activeTab: string;
  setActiveTab: (tab: string) => void;
  categories: CatalogCategoryItem[];
  seasonalPricing: boolean;
  setSeasonalPricing: (val: boolean) => void;
  seasonalPercentage: number;
  setSeasonalPercentage: (val: number) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white h-[80px] rounded-[24px] shadow-sm border border-[#ECECF1] px-6 flex items-center justify-between mb-8 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 p-1 bg-gray-50/50 rounded-full border border-[#ECECF1] shrink-0">
        {categories.map((category) => (
          <button
            key={category.code}
            onClick={() => setActiveTab(category.code)}
            className={`h-10 px-6 rounded-full text-[14px] font-bold transition-all ${
              activeTab === category.code
                ? 'bg-white text-red-700 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {category.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigate('/settings/catalog-categories')}
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white hover:text-red-700 hover:shadow-sm"
          aria-label="Manage Price Book categories"
          title="Manage Price Book categories"
        >
          <Settings2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-8 shrink-0 pl-4">
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold text-gray-700 hidden sm:block">Seasonal Pricing</span>
          {seasonalPricing && (
            <label className="flex h-9 items-center rounded-lg border border-gray-200 bg-gray-50 px-2 focus-within:border-red-400 focus-within:bg-white">
              <span className="sr-only">Seasonal price increase percentage</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={seasonalPercentage}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setSeasonalPercentage(Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0);
                }}
                className="w-12 bg-transparent text-right text-[13px] font-bold text-gray-900 outline-none"
                aria-label="Seasonal price increase percentage"
              />
              <span className="ml-1 text-[13px] font-bold text-gray-500">%</span>
            </label>
          )}
          <button 
            onClick={() => setSeasonalPricing(!seasonalPricing)}
            type="button"
            role="switch"
            aria-checked={seasonalPricing}
            aria-label="Toggle seasonal pricing"
            className={`w-11 h-[26px] rounded-full transition-colors relative flex items-center px-1 ${
              seasonalPricing ? 'bg-red-600' : 'bg-gray-200'
            }`}
          >
            <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${
              seasonalPricing ? 'translate-x-[20px]' : 'translate-x-0'
            }`} />
          </button>
        </div>
        <div className="w-px h-8 bg-[#ECECF1] hidden sm:block"></div>
        <div className="flex items-center gap-2 p-1 bg-gray-50/50 rounded-xl border border-[#ECECF1]">
          <button 
            onClick={() => setViewMode('grid')}
            className={`w-10 h-10 flex items-center justify-center rounded-[8px] transition-all ${
              viewMode === 'grid' 
                ? 'bg-red-50 text-red-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`w-10 h-10 flex items-center justify-center rounded-[8px] transition-all ${
              viewMode === 'list' 
                ? 'bg-red-50 text-red-600 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PricingBadge = ({ text }: any) => (
  <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-red-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
    {text}
  </span>
);

const VenueCard = ({ venue, openMenuId, setOpenMenuId, onEdit, onDelete, canManage = true }: any) => (
  <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#ECECF1] overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group cursor-pointer h-full">
    <div className="relative h-[220px] w-full overflow-hidden shrink-0">
      <img 
        src={venue.image} 
        alt={venue.title} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <PricingBadge text={venue.badge} />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/20 to-transparent pointer-events-none" />
    </div>
    <div className="p-6 flex flex-col flex-1 relative">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-[20px] font-bold text-gray-900 leading-tight pr-6">
          {venue.title}
        </h3>
        {canManage && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              setOpenMenuId(openMenuId === venue.id ? null : venue.id);
            }}
            className="absolute top-6 right-5 text-gray-400 hover:text-gray-900 transition-colors p-1 -mr-1"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        )}
        {canManage && openMenuId === venue.id && (
          <div className="absolute top-12 right-5 z-20 w-36 overflow-hidden rounded-2xl border border-[#ECECF1] bg-white py-2 shadow-lg">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setOpenMenuId(null);
                onEdit(venue);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-gray-700 hover:bg-gray-50"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setOpenMenuId(null);
                onDelete(venue);
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13px] font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>
      <p className="text-[14px] font-medium text-gray-500 line-clamp-2 leading-relaxed mb-6">
        {venue.description}
      </p>
      <div className="mt-auto">
        <div className="w-full h-px bg-[#ECECF1] mb-5"></div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Base Pricing
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] font-bold text-gray-900 tracking-tight">
                {venue.price}
              </span>
              <span className="text-[13px] font-bold text-gray-400">
                /{venue.unit}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-[12px] font-bold mb-1 ${venue.markupColor || 'text-emerald-500'}`}>
              {venue.markupText}
            </p>
            <p className="text-[11px] font-bold text-gray-400">
              {venue.estimatedText}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AddRateCard = ({ onClick }: { onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="bg-[#F8F5FF] rounded-[24px] border-2 border-dashed border-[#DED6FA] flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-[#F3EEFF] hover:border-[#D1C4F9] transition-all duration-300 group h-full min-h-[420px]"
  >
    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#ECECF1] mb-6 group-hover:scale-110 transition-transform duration-300">
      <Plus className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-[20px] font-bold text-gray-900 mb-3">
      New Rate Card
    </h3>
    <p className="text-[14px] font-medium text-gray-500 max-w-[200px] leading-relaxed">
      Click to add a new venue, package, or service item to the price book catalog.
    </p>
  </div>
);

const PriceMetrics = ({ totalItems, avgRate }: { totalItems: number; avgRate: number }) => (
  <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
    <div className="bg-[#EEF2FF] rounded-[16px] px-5 py-3 flex flex-col justify-center min-w-[140px] shrink-0">
      <span className="text-[11px] font-bold text-gray-500 mb-0.5">Total Items</span>
      <span className="text-[18px] font-bold text-gray-900 leading-tight">{totalItems} Items</span>
    </div>
    <div className="bg-[#EEF2FF] rounded-[16px] px-5 py-3 flex flex-col justify-center min-w-[140px] shrink-0">
      <span className="text-[11px] font-bold text-gray-500 mb-0.5">Avg. Rate</span>
      <span className="text-[18px] font-bold text-gray-900 leading-tight">{formatCurrency(avgRate)}</span>
    </div>
  </div>
);

const fallbackVenues: any[] = [];

// ==========================================
// MAIN COMPONENT
// ==========================================

const GlobalPriceBook = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [priceBooks, setPriceBooks] = useState<any[]>([]);
  const [selectedPriceBookId, setSelectedPriceBookId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('VENUES');
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategoryItem[]>(defaultCatalogCategories);
  const [seasonalPricing, setSeasonalPricing] = useState(false);
  const [seasonalPercentage, setSeasonalPercentage] = useState(() => {
    const savedValue = localStorage.getItem(SEASONAL_PERCENTAGE_STORAGE_KEY);
    const savedPercentage = savedValue === null ? NaN : Number(savedValue);
    return Number.isFinite(savedPercentage) && savedPercentage >= 0 && savedPercentage <= 100
      ? savedPercentage
      : DEFAULT_SEASONAL_PERCENTAGE;
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [rateCards, setRateCards] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8;

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showImportExportDropdown, setShowImportExportDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRateCard, setEditingRateCard] = useState<any | null>(null);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [openRateMenuId, setOpenRateMenuId] = useState<number | null>(null);
  const [catalogItemPendingDelete, setCatalogItemPendingDelete] = useState<any | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('VENUES');
  const [newUom, setNewUom] = useState('DAY');
  const [newRate, setNewRate] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newTaxPercent, setNewTaxPercent] = useState('18');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem(SEASONAL_PERCENTAGE_STORAGE_KEY, String(seasonalPercentage));
  }, [seasonalPercentage]);

  useEffect(() => {
    catalogCategoryService.list()
      .then((response) => {
        const categories = response.data?.length ? response.data : defaultCatalogCategories;
        setCatalogCategories(categories);
        setActiveTab((current) => categories.some((category) => category.code === current) ? current : categories[0]?.code || 'SERVICES');
      })
      .catch(() => setCatalogCategories(defaultCatalogCategories));
  }, []);

  // 1. Fetch Price Books on mount
  useEffect(() => {
    catalogService.getPriceBooks()
      .then(res => {
        const books = res.data || [];
        setPriceBooks(books);
        if (books.length > 0) {
          setSelectedPriceBookId(Number(books[0].price_book_id));
        }
      })
      .catch(err => setError(`Failed to load price books: ${err.message}`));
  }, []);

  // 2. Fetch Rate Cards or Packages depending on active tab & selected price book
  useEffect(() => {
    setLoading(true);
    setError('');

    if (activeTab === 'PACKAGES') {
      catalogService.getPackages()
        .then(res => {
          setPackages(res.data || []);
        })
        .catch(err => setError(`Failed to load packages: ${err.message}`))
        .finally(() => setLoading(false));
    } else {
      if (selectedPriceBookId === null) {
        setLoading(false);
        return;
      }
      
      catalogService.getRateCards(selectedPriceBookId)
        .then(res => {
          setRateCards(res.data || []);
        })
        .catch(err => setError(`Failed to load rate cards: ${err.message}`))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedPriceBookId, refreshTrigger]);

  // Helper to map rate card to card object
  const mapRateCardToCard = (rc: any) => {
    const baseRate = Number(rc.rate || 0);
    const cost = Number(rc.cost || 0);
    const seasonalMultiplier = 1 + seasonalPercentage / 100;
    const displayRate = seasonalPricing ? Math.round(baseRate * seasonalMultiplier) : baseRate;
    const itemType = normalizeItemType(rc.item_type) || inferItemType(rc.item_name);
    let image = rc.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    if (!rc.image_url && /photo|drone|video/i.test(rc.item_name)) {
      image = 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d837?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    } else if (!rc.image_url && /stage|decor/i.test(rc.item_name)) {
      image = 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    }
    
    return {
      id: rc.rate_card_id,
      title: rc.item_name,
      itemType,
      description: `Unit: ${rc.uom}. Cost: ${formatCurrency(cost)}.${seasonalPricing ? ' Seasonal pricing is applied.' : ' Standard markup applies.'}`,
      badge: seasonalPricing ? `${rc.uom} +${seasonalPercentage}%` : rc.uom,
      price: formatCurrency(displayRate),
      numericRate: displayRate,
      numericCost: cost,
      taxPercent: Number(rc.tax_percent || 0),
      originalRate: baseRate,
      unit: rc.uom.toLowerCase(),
      markupText: `Cost: ${formatCurrency(cost)}`,
      markupColor: 'text-emerald-500',
      estimatedText: `Margin: ${formatCurrency(displayRate - cost)}`,
      image
    };
  };

  // Helper to map package to card object
  const mapPackageToCard = (pkg: any) => {
    const baseRate = Number(pkg.base_price || 0);
    const seasonalMultiplier = 1 + seasonalPercentage / 100;
    const displayRate = seasonalPricing ? Math.round(baseRate * seasonalMultiplier) : baseRate;
    return {
      id: pkg.package_id,
      itemKind: 'PACKAGE',
      title: pkg.name,
      description: `All-inclusive standard package for special events.${seasonalPricing ? ' Seasonal pricing is applied.' : ''}`,
      badge: seasonalPricing ? `Package +${seasonalPercentage}%` : 'Package',
      price: formatCurrency(displayRate),
      numericRate: displayRate,
      originalRate: baseRate,
      numericCost: 0,
      taxPercent: 0,
      unit: 'event',
      markupText: 'Base Price',
      markupColor: 'text-emerald-500',
      estimatedText: 'Flat Rate',
      image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    };
  };

  // Process and filter displayed items
  let displayedItems: any[] = [];
  
  if (activeTab === 'PACKAGES') {
    displayedItems = packages
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .map(mapPackageToCard);
  } else {
    // Filter rate cards based on active category
    const filteredRateCards = rateCards.filter(rc => {
      const matchSearch = rc.item_name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      const itemType = normalizeItemType(rc.item_type) || inferItemType(rc.item_name);
      return itemType === tabToItemType(activeTab);
    });

    displayedItems = filteredRateCards.map(mapRateCardToCard);

    // Fallback to an empty venues list if no database rate cards match.
    if (activeTab === 'VENUES' && displayedItems.length === 0 && searchQuery === '') {
      displayedItems = fallbackVenues;
    }
  }

  // Calculate metrics
  const totalItemCount = displayedItems.length;
  const ratesList = displayedItems.map(item => Number(item.numericRate || 0));
  const avgRate = ratesList.length > 0 ? (ratesList.reduce((a, b) => a + b, 0) / ratesList.length) : 0;

  // Pagination bounds
  const paginatedItems = displayedItems.slice((currentPage - 1) * limit, currentPage * limit);
  const totalPages = Math.max(1, Math.ceil(displayedItems.length / limit));

  const handleExportCSV = () => {
    if (displayedItems.length === 0) {
      showToast("No data available to export.", "info");
      return;
    }
    
    const headers = ["ID", "Item Name", "Item Type", "UOM", "Rate", "Cost", "Tax %", "Image URL", "Description"];
    const rows = displayedItems.map(item => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      tabToItemType(activeTab),
      item.badge,
      item.numericRate || 0,
      item.numericCost || 0,
      item.taxPercent || 0,
      `"${String(item.image || '').replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_PriceBook_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${displayedItems.length} item(s).`, "success");
  };

  const downloadImportTemplate = () => {
    const csvContent = [
      "Item Name,Item Type,UOM,Rate,Cost,Tax %,Image URL",
      "Stage Decoration Premium,SERVICES,SETUP,150000,100000,18,https://example.com/photo.jpg"
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Rate_Card_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsv = (text: string) => {
    const rows: string[][] = [];
    let current = '';
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i++;
        row.push(current.trim());
        if (row.some(cell => cell !== '')) rows.push(row);
        row = [];
        current = '';
      } else {
        current += char;
      }
    }

    row.push(current.trim());
    if (row.some(cell => cell !== '')) rows.push(row);
    return rows;
  };

  const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

  const parseMoney = (value: string) => {
    const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : NaN;
  };

  const getCell = (row: string[], headers: string[], keys: string[]) => {
    const index = headers.findIndex(header => keys.includes(header));
    return index >= 0 ? row[index] : '';
  };

  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 900;
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not prepare image preview.'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = () => reject(new Error('Selected image could not be loaded.'));
        img.src = String(reader.result || '');
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleRateImageSelected = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast("Please select an image file.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be smaller than 2 MB.", "error");
      return;
    }

    compressImageFile(file)
      .then((imageDataUrl) => {
        setNewImageUrl(imageDataUrl);
        setNewImageName(file.name);
      })
      .catch((error: Error) => showToast(error.message, "error"));
  };

  const resetRateForm = () => {
    setEditingRateCard(null);
    setEditingPackage(null);
    setNewItemName('');
    setNewItemType(activeTab === 'PACKAGES' ? 'SERVICES' : tabToItemType(activeTab));
    setNewUom('DAY');
    setNewRate('');
    setNewCost('');
    setNewTaxPercent('18');
    setNewImageUrl('');
    setNewImageName('');
  };

  const openCreateRateModal = () => {
    resetRateForm();
    setShowCreateModal(true);
  };

  const openEditRateModal = (item: any) => {
    if (item.itemKind === 'PACKAGE') {
      setEditingPackage(item);
      setEditingRateCard(null);
      setNewItemName(item.title || '');
      setNewItemType('PACKAGES');
      setNewUom('EVENT');
      setNewRate(String(item.originalRate ?? item.numericRate ?? ''));
      setNewCost('0');
      setNewTaxPercent('0');
      setNewImageUrl(item.image || '');
      setNewImageName(item.image ? 'Current image' : '');
      setShowCreateModal(true);
      return;
    }

    setEditingRateCard(item);
    setEditingPackage(null);
    setNewItemName(item.title || '');
    setNewItemType(item.itemType || tabToItemType(activeTab));
    setNewUom(String(item.badge || item.unit || 'DAY').replace(/\s\+\d+(?:\.\d+)?%$/, '').toUpperCase());
    setNewRate(String(item.originalRate ?? item.numericRate ?? ''));
    setNewCost(String(item.numericCost ?? ''));
    setNewTaxPercent(String(item.taxPercent ?? 0));
    setNewImageUrl(item.image || '');
    setNewImageName(item.image ? 'Current image' : '');
    setShowCreateModal(true);
  };

  const confirmDeleteCatalogItem = async () => {
    if (!catalogItemPendingDelete) return;

    setSubmitting(true);
    try {
      if (catalogItemPendingDelete.itemKind === 'PACKAGE') {
        await catalogService.deletePackage(Number(catalogItemPendingDelete.id));
        showToast("Package deleted.", "success");
      } else {
        await catalogService.deleteRateCard(Number(catalogItemPendingDelete.id));
        showToast("Rate card deleted.", "success");
      }
      setCatalogItemPendingDelete(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      showToast(`Failed to delete item: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImportCSV = async (file: File) => {
    if (!selectedPriceBookId) {
      showToast("Select a price book before importing.", "error");
      return;
    }

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) {
        showToast("CSV must include a header row and at least one data row.", "error");
        return;
      }

      const headers = rows[0].map(normalizeHeader);
      const payloads = rows.slice(1).map((row, index) => {
        const itemName = getCell(row, headers, ['itemname', 'name']);
        const itemType = getCell(row, headers, ['itemtype', 'type', 'category']) || tabToItemType(activeTab);
        const uom = getCell(row, headers, ['uom', 'unit', 'typeuom']) || 'UNIT';
        const rate = parseMoney(getCell(row, headers, ['rate', 'baseprice', 'price']));
        const cost = parseMoney(getCell(row, headers, ['cost', 'costbaseprice']));
        const taxPercentRaw = getCell(row, headers, ['tax', 'taxpercent', 'taxpercentage']);
        const taxPercent = taxPercentRaw ? parseMoney(taxPercentRaw) : 0;
        const imageUrl = getCell(row, headers, ['imageurl', 'photo', 'photourl', 'image']);

        if (!itemName || !Number.isFinite(rate) || !Number.isFinite(cost)) {
          throw new Error(`Row ${index + 2} needs Item Name, Rate, and Cost.`);
        }

        return {
          itemName,
          itemType,
          uom,
          rate,
          cost,
          taxPercent: Number.isFinite(taxPercent) ? taxPercent : 0,
          imageUrl: imageUrl || undefined,
          isActive: true,
        };
      });

      setSubmitting(true);
      await Promise.all(payloads.map(payload => catalogService.createRateCard(selectedPriceBookId, payload)));
      showToast(`Imported ${payloads.length} rate card(s).`, "success");
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      showToast(`Import failed: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriceBookId && !editingRateCard) {
      showToast("No Price Book selected.", "error");
      return;
    }
    if (!newItemName || !newItemType || !newUom || !newRate || !newCost) {
      showToast("Please fill in all required fields.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        itemName: newItemName,
        itemType: newItemType,
        uom: newUom,
        rate: Number(newRate),
        cost: Number(newCost),
        taxPercent: Number(newTaxPercent || 0),
        imageUrl: newImageUrl.trim() || undefined,
        isActive: true,
      };

      if (editingPackage) {
        await catalogService.updatePackage(Number(editingPackage.id), {
          packageName: newItemName,
          basePrice: Number(newRate),
          isActive: true,
        });
      } else if (editingRateCard) {
        await catalogService.updateRateCard(Number(editingRateCard.id), payload);
      } else {
        await catalogService.createRateCard(selectedPriceBookId as number, payload);
      }

      showToast(editingPackage ? "Package updated." : editingRateCard ? "Rate card updated." : "Rate card successfully created!", "success");
      setShowCreateModal(false);
      resetRateForm();
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      showToast(`Failed to save rate card: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FC] font-sans">
      <Sidebar />
      
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden relative w-full">
        <TopHeader contextSearchValue={searchQuery} onContextSearchChange={setSearchQuery} contextSearchPlaceholder="Search price book..." />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-12 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-[600px]">
                <span className="inline-block bg-[#FCE8E8] text-[#B3262E] text-[12px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                  Rate Card & Pricing
                </span>
                <h1 className="text-[36px] md:text-[48px] font-bold text-gray-900 tracking-tight leading-none mb-4">
                  Global Price Book
                </h1>
                <p className="text-[15px] md:text-[16px] font-medium text-gray-500 leading-relaxed">
                  Manage enterprise-wide service rates, venue fees, and vendor markups with seasonal intelligent adjustments.
                </p>

                {activeTab !== 'PACKAGES' && priceBooks.length > 0 && (
                  <div className="flex items-center gap-3 mt-4">
                    <span className="text-sm font-bold text-gray-500">Selected Price Book:</span>
                    <select 
                      value={selectedPriceBookId || ''} 
                      onChange={e => { setSelectedPriceBookId(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-white border border-[#ECECF1] px-4 py-2 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 shadow-sm"
                    >
                      {priceBooks.map(pb => (
                        <option key={pb.price_book_id} value={pb.price_book_id}>
                          {pb.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => navigate('/settings/price-books')}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECECF1] bg-white text-gray-500 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      aria-label="Manage price books"
                      title="Manage price books"
                    >
                      <Settings2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImportCSV(file);
                  }}
                />
                <div className="relative">
                  <button 
                    onClick={() => setShowImportExportDropdown(!showImportExportDropdown)}
                    className="h-12 px-5 flex items-center gap-2 bg-white border border-[#ECECF1] rounded-[16px] text-gray-700 font-semibold text-[15px] hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="hidden sm:inline">Import / Export</span>
                    <span className="sm:hidden">Import</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                  </button>
                  
                  {showImportExportDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#ECECF1] rounded-2xl shadow-lg z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button 
                        onClick={() => { handleExportCSV(); setShowImportExportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-[14px] font-bold text-gray-700 transition-colors"
                      >
                        Export Current View
                      </button>
                      <button 
                        onClick={() => { downloadImportTemplate(); setShowImportExportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-[14px] font-bold text-gray-700 transition-colors"
                      >
                        Download Template
                      </button>
                      <button 
                        disabled={submitting || activeTab === 'PACKAGES'}
                        onClick={() => { fileInputRef.current?.click(); setShowImportExportDropdown(false); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-[14px] font-bold text-gray-700 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Importing...' : 'Import Rate Cards'}
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={openCreateRateModal}
                  className="h-12 px-5 sm:px-6 flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-400 rounded-[16px] text-white font-semibold text-[15px] hover:from-red-700 hover:to-orange-500 transition-colors shadow-[0_4px_14px_rgba(220,38,38,0.25)]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Create New Rate</span>
                  <span className="sm:hidden">New Rate</span>
                </button>
              </div>
            </div>

            <CategoryTabs 
              activeTab={activeTab} 
              categories={catalogCategories}
              setActiveTab={(tab) => { setActiveTab(tab); setCurrentPage(1); }} 
              seasonalPricing={seasonalPricing} 
              setSeasonalPricing={setSeasonalPricing} 
              seasonalPercentage={seasonalPercentage}
              setSeasonalPercentage={setSeasonalPercentage}
              viewMode={viewMode} 
              setViewMode={setViewMode} 
            />

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader className="w-10 h-10 text-red-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-semibold">
                No items found for category "{catalogCategories.find((category) => category.code === activeTab)?.label || activeTab}".
              </div>
            ) : (
              /* Price Book Grid / List */
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
              }>
                {paginatedItems.map((item: any) => (
                  <div key={item.id} className={viewMode === 'list' ? "w-full" : ""}>
                    <VenueCard
                      venue={item}
                      openMenuId={openRateMenuId}
                      setOpenMenuId={setOpenRateMenuId}
                      onEdit={openEditRateModal}
                      onDelete={setCatalogItemPendingDelete}
                      canManage={true}
                    />
                  </div>
                ))}
                
                {viewMode === 'grid' && (
                  <div>
                    <AddRateCard onClick={openCreateRateModal} />
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-8 mt-4 gap-6 border-t border-[#ECECF1]">
              <PriceMetrics totalItems={totalItemCount} avgRate={avgRate} />
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                totalItems={displayedItems.length} 
                itemsPerPage={limit} 
                onPageChange={setCurrentPage} 
              />
            </div>

          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] w-full max-w-[500px] shadow-2xl overflow-hidden border border-[#ECECF1] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#ECECF1] flex items-center justify-between">
              <h3 className="text-[20px] font-bold text-gray-900">
                {editingPackage ? 'Edit Package' : editingRateCard ? 'Edit Rate Card' : 'Create New Rate/Card'}
              </h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  resetRateForm();
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveRate}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">{editingPackage ? 'Package Name *' : 'Item Name *'}</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="e.g. Sound System Deluxe Setup"
                    className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Item Type *</label>
                    <select
                      value={newItemType}
                      disabled={Boolean(editingPackage)}
                      onChange={e => setNewItemType(e.target.value)}
                      className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all"
                    >
                      {catalogCategories.filter((category) => category.code !== 'PACKAGES').map((category) => (
                        <option key={category.code} value={category.code}>{category.label}</option>
                      ))}
                    </select>

                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">UOM (Unit) *</label>
                    <input
                      type="text"
                      required
                      value={newUom}
                      onChange={e => setNewUom(e.target.value)}
                      placeholder="e.g. DAY, HOUR, EVENT"
                      className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Rate (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newRate}
                      onChange={e => setNewRate(e.target.value)}
                      placeholder="1500"
                      className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Cost (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newCost}
                      onChange={e => setNewCost(e.target.value)}
                      placeholder="1000"
                      className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Tax (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newTaxPercent}
                      onChange={e => setNewTaxPercent(e.target.value)}
                      placeholder="18"
                      className="w-full h-11 px-4 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:border-red-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Item Photo</label>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4 items-stretch">
                    <label className="min-h-[88px] rounded-xl bg-gray-50 border border-dashed border-[#D8DCE8] hover:border-red-300 transition-colors cursor-pointer flex flex-col items-center justify-center px-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleRateImageSelected(e.target.files?.[0])}
                      />
                      <Upload className="w-5 h-5 text-red-500 mb-2" />
                      <span className="text-[13px] font-bold text-gray-900">
                        {newImageName || 'Choose Image'}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-400 mt-1">JPG, PNG or WEBP up to 2 MB</span>
                    </label>
                    <div className="h-[88px] rounded-xl bg-gray-50 border border-[#ECECF1] overflow-hidden flex items-center justify-center">
                      {newImageUrl ? (
                        <img src={newImageUrl} alt="Rate card preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400 text-[11px] font-bold">
                          <ImageIcon className="w-5 h-5" />
                          Preview
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#ECECF1] bg-gray-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetRateForm();
                  }}
                  className="h-11 px-5 rounded-full border border-gray-200 bg-white text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-red-600 to-orange-400 text-white text-[13px] font-bold flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {submitting ? 'Saving...' : editingPackage || editingRateCard ? 'Save Changes' : 'Create Rate Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmationModal
        open={Boolean(catalogItemPendingDelete)}
        title={catalogItemPendingDelete?.itemKind === 'PACKAGE' ? 'Delete Package?' : 'Delete Rate Card?'}
        message={`This will remove "${catalogItemPendingDelete?.title || 'this item'}" from the catalog. Existing saved quotations will not be changed.`}
        confirmLabel={catalogItemPendingDelete?.itemKind === 'PACKAGE' ? 'Delete Package' : 'Delete Rate Card'}
        onCancel={() => setCatalogItemPendingDelete(null)}
        onConfirm={confirmDeleteCatalogItem}
      />
    </div>
  );
};

export default GlobalPriceBook;




