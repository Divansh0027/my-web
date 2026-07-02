import { useAuth } from "../context/AuthContext";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, ClipboardList, ShieldAlert, Award, FileText, 
  ArrowRight, ArrowLeft, Trash2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Upload
} from "lucide-react";
import { Property, City } from "../types";
import { uploadPropertyImage, isStorageConnected } from "../firebase";
import { useConfig } from "../context/ConfigContext";
import { validatePropertyStep1, validatePropertyStep2 } from "../utils/validation";

interface ListPropertyViewProps {
  onAddProperty: (newProp: Property) => void;
  onShowNotification: (msg: string, type: "success" | "info" | "error") => void;
  }

export default function ListPropertyView({ 
  onAddProperty, 
  onShowNotification
}: ListPropertyViewProps) {
  const navigate = useNavigate();
  const BUSINESS_CONFIG = useConfig();
  
  // Auth listener
  const { currentUser } = useAuth();

  

  // Wizard Navigation Step (1 to 4)
  const [step, setStep] = useState(1);
  const [isDone, setIsDone] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Flat" | "Villa" | "Plot" | "Builder Floor" | "Commercial">("Flat");
  const [bhk, setBhk] = useState("3");
  const [city, setCity] = useState("Dwarka");
  const [locality, setLocality] = useState("");

  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState<"Lakhs" | "Crore">("Lakhs");
  const [area, setArea] = useState("");
  const [areaUnit, setAreaUnit] = useState<"sqft" | "sqyd">("sqft");
  const [floor, setFloor] = useState("2nd");
  const [facing, setFacing] = useState("East");
  const [furnishing, setFurnishing] = useState("Semi-Furnished");

  // Selected Amenities list state
  const [amenities, setAmenities] = useState<string[]>(["Parking", "Water Supply"]);

  // Real Storage States
  const [imageFiles, setImageFiles] = useState<{ file: File; previewUrl: string }[]>([]);
  const imageFilesRef = useRef(imageFiles);
  useEffect(() => {
    imageFilesRef.current = imageFiles;
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      imageFilesRef.current.forEach(item => {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch (_) { /* ignore */ }
      });
    };
  }, []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [youtubeUrl, setYoutubeUrl] = useState("");

  // Photos State: Support custom URL addition paired with presets
  const [customPhotos, setCustomPhotos] = useState<string[]>([]);

  // Step 4 Verification acceptance checklist
  const [isAgreedToCheckList, setIsAgreedToCheckList] = useState(false);
  const [certifyingName, setCertifyingName] = useState("");

  const amenitiesList = [
    "Parking",
    "Lift",
    "Security",
    "Gym",
    "Power Backup",
    "Water Supply",
    "Garden",
    "Club House",
    "Fire Safety",
    "Gated Community",
    "Intercom",
    "Vastu Compliant"
  ];

  // Static Premium Unsplash Placeholders according to selected Type
  const presetPhotos: Record<string, string[]> = {
    Flat: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    Villa: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ],
    Plot: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=800&q=80"
    ],
    "Builder Floor": [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
    ],
    Commercial: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
    ]
  };

  const DRAFT_STORAGE_KEY = "ssp_property_draft_v2";

  // State Draft Auto-Saving System
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const d = JSON.parse(savedDraft);
        setTitle(d.title || "");
        setDescription(d.description || "");
        setType(d.type || "Flat");
        setBhk(d.bhk || "3");
        setCity(d.city || "Dwarka");
        setLocality(d.locality || "");
        setPrice(d.price || "");
        setPriceUnit(d.priceUnit || "Lakhs");
        setArea(d.area || "");
        setAreaUnit(d.areaUnit || "sqft");
        setFloor(d.floor || "2nd");
        setFacing(d.facing || "East");
        setFurnishing(d.furnishing || "Semi-Furnished");
        setAmenities(d.amenities || ["Parking", "Water Supply"]);
        setCustomPhotos(d.customPhotos || []);
        setYoutubeUrl(d.youtubeUrl || "");
        setStep(d.step || 1);
        onShowNotification("Restored active property listing draft.", "success");
      } catch (err) {
        console.warn("Could not read property wizard draft details.", err);
      }
    }
  }, []);

  // Save changes to localStorage on any state modification
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const draftData = {
        title,
        description,
        type,
        bhk,
        city,
        locality,
        price,
        priceUnit,
        area,
        areaUnit,
        floor,
        facing,
        furnishing,
        amenities,
        customPhotos,
        youtubeUrl,
        step
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [
    title, description, type, bhk, city, locality, price, priceUnit, 
    area, areaUnit, floor, facing, furnishing, amenities, customPhotos, youtubeUrl, step
  ]);

  // Autofill Certifying display name once currentUser becomes active
  useEffect(() => {
    if (currentUser?.displayName && !certifyingName) {
      setCertifyingName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setTitle("");
    setDescription("");
    setType("Flat");
    setBhk("3");
    setCity("Dwarka");
    setLocality("");
    setPrice("");
    setPriceUnit("Lakhs");
    setArea("");
    setAreaUnit("sqft");
    setFloor("2nd");
    setFacing("East");
    setFurnishing("Semi-Furnished");
    setAmenities(["Parking", "Water Supply"]);
    setCustomPhotos([]);
    setYoutubeUrl("");
    setStep(1);
    onShowNotification("Draft cleared. Starting fresh registration.", "info");
  };

  const handleAmenityToggle = (am: string) => {
    setAmenities(prev => 
      prev.includes(am) ? prev.filter(x => x !== am) : [...prev, am]
    );
  };

  // Validation routines per progressive step
  const validateStep1 = () => validatePropertyStep1(title, description, locality);

  const validateStep2 = () => validatePropertyStep2(price, area);

  const handleNextStep = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        onShowNotification(err, "info");
        return;
      }
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        onShowNotification(err, "info");
        return;
      }
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const triggerConfettiSuccess = async () => {
    // 3 round confetti shower burst
    const end = Date.now() + (3 * 1000);
    const colors = ["#D4AF37", "#B5942B", "#FFFFFF", "#1E293B"];
    
    try {
      const { default: confetti } = await import("canvas-confetti");

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } catch(e) {
      console.warn("Failed to load confetti", e);
    }
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files) return;
    const currentCount = imageFiles.length;
    const incomingFiles = Array.from(files);
    
    const oversizedFile = incomingFiles.find(f => f.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      onShowNotification(`File "${oversizedFile.name}" exceeds the 5MB size limit.`, "error");
      return;
    }
    
    if (currentCount + incomingFiles.length > 10) {
      onShowNotification("Maximum 10 photos allowed.", "error");
      return;
    }
    
    const newImageFiles = incomingFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImageFiles(prev => [...prev, ...newImageFiles]);
  };

  const handleRemoveImageFile = (index: number) => {
    setImageFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const s1Err = validateStep1();
    if (s1Err) {
      onShowNotification(s1Err, "info");
      setStep(1);
      return;
    }

    const s2Err = validateStep2();
    if (s2Err) {
      onShowNotification(s2Err, "info");
      setStep(2);
      return;
    }

    if (youtubeUrl.trim()) {
      const isValidYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(youtubeUrl);
      if (!isValidYoutube) {
        onShowNotification("Please enter a valid YouTube URL.", "info");
        setStep(3);
        return;
      }
    }

    const finalCertifyingName = currentUser?.displayName || certifyingName;
    if (!isAgreedToCheckList || !finalCertifyingName.trim()) {
      onShowNotification("Please complete step 4 checkmarks and authorize with your signature name.", "info");
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = []; // cloud or asset templates
    const liveStorage = isStorageConnected();

    try {
      if (imageFiles.length > 0) {
        if (liveStorage && currentUser) {
          onShowNotification("Uploading property images to Google Cloud Storage...", "success");
          for (let i = 0; i < imageFiles.length; i++) {
             setUploadProgress({ current: i + 1, total: imageFiles.length });
             const imgFile = imageFiles[i];
             try {
               const downloadUrl = await uploadPropertyImage(
                 currentUser.uid, 
                 imgFile.file, 
                 imgFile.file.name
               );
               uploadedUrls.push(downloadUrl.url);
             } catch (err: unknown) {
               console.error(`Upload failed for ${imgFile.file.name}:`, err);
               onShowNotification(`Failed to upload ${imgFile.file.name}. Please retry.`, "error");
               setIsUploading(false);
               return; // Stop submission
             }
          }
        } else {
          // Local fallback: don't convert files to Base64, use placeholders instead for demo
          onShowNotification(liveStorage ? "Guest uploads use placeholders. Log in for real image hosting." : "Images saved locally. Connect Firebase Storage for cloud hosting.", "info");
          for (let i = 0; i < imageFiles.length; i++) {
             setUploadProgress({ current: i + 1, total: imageFiles.length });
             const placeholderImages = [
               "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
               "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
               "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
             ];
             uploadedUrls.push(placeholderImages[i % placeholderImages.length]);
          }
        }
      }
    } catch (uploadError: unknown) {
      console.error("Image upload failed", uploadError);
      onShowNotification(`Cloud upload failed. Please try again.`, "error");
      setIsUploading(false);
      return;
    } finally {
      setIsUploading(false);
    }

    const priceNum = priceUnit === "Lakhs" 
      ? Number(price) * 100000 
      : Number(price) * 10000000;

    // Compile images list combining presets with custom ones
    const finalImages = [
      ...uploadedUrls,
      ...(presetPhotos[type] || presetPhotos.Flat)
    ];

    const newProperty: Property = {
      id: `user-prop-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      price: priceNum,
            location: `${locality.trim()}, ${city}`,
      locality: locality.trim(),
      city: city as City,
      type,
      category: type === "Commercial" ? "Commercial" : type === "Plot" ? "Plots" : "Buy",
      bhk: type === "Commercial" || type === "Plot" ? null : Number(bhk),
      area: Number(area),
      areaUnit,
      floor: type === "Plot" ? "N/A" : floor,
      facing,
      ageOfProperty: "New Launch",
      furnishing: type === "Plot" ? "Unfurnished" : furnishing,
      images: finalImages,
      imageUrls: uploadedUrls,
      ...(youtubeUrl.trim() ? { videoUrl: youtubeUrl.trim() } : {}),
      amenities,
      verified: false, // Undergoes audit review
      featured: false,
      newLaunch: true,
      availabilityStatus: "New Launch",
      postedBy: "Owner",
      postedDate: new Date().toISOString().split("T")[0]
    };

    // Callback to parent state
    onAddProperty(newProperty);
    
    // Clear localStorage values
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    
    setIsDone(true);
    triggerConfettiSuccess();
    onShowNotification("Property listed! The site and document audit is pending.", "success");
  };

  const stepsLabel = [
    { num: 1, label: "Basic Info", icon: ClipboardList },
    { num: 2, label: "Specifications", icon: FileText },
    { num: 3, label: "Media & Amenities", icon: Award },
    { num: 4, label: "Verification Audit", icon: ShieldAlert }
  ];

  return (
    <div className="font-sans text-on-surface bg-surface pt-24 pb-20 min-h-screen">
      {isUploading && (
        <div id="upload-overlay" className="fixed inset-0 z-50 bg-surface/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="bg-surface-container border border-outline-variant rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-md">
            <RefreshCw className="h-10 w-10 text-gold-accent animate-spin mx-auto animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-on-surface font-black text-lg">Uploading Property Media</h3>
              <p className="text-on-surface-variant text-xs font-medium">Please wait while we sync physical asset images to secure cluster storage.</p>
            </div>
            
            {/* Real progress indicators */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                <span>Progress Status</span>
                <span className="text-gold-accent">{uploadProgress.current} / {uploadProgress.total} Files</span>
              </div>
              <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-outline-variant/50">
                <div 
                  className="bg-gold-accent h-full rounded-full transition-all duration-350"
                  style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* HEADER SECTION */}
      <div className="bg-surface-container border-b border-outline-variant/50 py-10 px-4 sm:px-6 lg:px-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-gold-accent/5 rounded-full blur-2xl"></div>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-gold-accent font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-gold-accent" />
              Physical Audit Enabled Gateway
            </div>
            <h1 className="text-3xl font-black text-on-surface mt-1">List Your Asset</h1>
            <p className="text-on-surface-variant text-xs mt-2 font-medium leading-relaxed max-w-2xl">
              Become a verified direct owner seller. Post builder floors, luxury flats, plots, or shops in Delhi NCR. We perform strict document audits to showcase properties transparently.
            </p>
          </div>

          {!isDone && (
            <button
              onClick={handleClearDraft}
              className="py-2 px-3.5 border border-outline-variant hover:border-red-500/20 text-on-surface-variant hover:text-red-400 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-center cursor-pointer"
              title="Reset the entire multi-step form to empty state"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Form
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* PROGRESS STEPPER BAR */}
        {!isDone && (
          <div className="mb-10 bg-surface-container/60 border border-outline-variant/50 p-4 rounded-3xl">
            {/* Step Numbers & Labels */}
            <div className="grid grid-cols-4 gap-2">
              {stepsLabel.map((s) => {
                const isActive = step === s.num;
                const isCompleted = step > s.num;
                return (
                  <button
                    key={s.num}
                    onClick={() => {
                      // Allow moving back to previous steps but restrict skipping ahead without validation
                      if (s.num < step) {
                        setStep(s.num);
                      } else if (s.num > step) {
                        handleNextStep();
                      }
                    }}
                    className={`flex flex-col sm:flex-row items-center gap-2 py-2 px-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? "bg-gold-accent/10 text-gold-accent border border-gold-accent/20 font-bold" 
                        : isCompleted 
                        ? "text-emerald-400 font-semibold" 
                        : "text-outline"
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isActive 
                        ? "bg-gold-accent text-[#0F172A]" 
                        : isCompleted 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-slate-850 text-outline"
                    }`}>
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : s.num}
                    </div>
                    <span className="text-[10px] hidden sm:inline uppercase tracking-wider">{s.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Micro visual progress line */}
            <div className="relative mt-4 h-1 bg-surface rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gold-accent"
                initial={{ width: "25%" }}
                animate={{ width: `${(step / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isDone ? (
            
            /* ACTIVE REGISTRATION FORM PANEL WITH 4 STEPS */
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-surface-container border border-outline-variant/50 rounded-3xl p-6 sm:p-10 shadow-md"
            >
              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                
                {/* ================= STEP 1: GENERAL INFO ================= */}
                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-outline-variant/50 pb-3">
                      <ClipboardList className="h-5 w-5 text-gold-accent" />
                      <h3 className="text-on-surface font-extrabold text-sm">Step 1: General Category & Descriptive Assets</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Property Title */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label htmlFor="step1-title-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1.5">
                          Property Listing Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="step1-title-input"
                          type="text"
                          required
                          placeholder="e.g. Elegant 3 BHK Semi-Furnished Flat with Balcony"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-slate-650 outline-none transition-colors"
                        />
                        {title && title.trim().length < 10 && (
                          <p className="text-[10px] text-gold-accent font-semibold">Needs {10 - title.trim().length} more characters.</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label htmlFor="step1-desc-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Detailed Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="step1-desc-input"
                          rows={4}
                          required
                          placeholder="Provide details of the locality, nearby metro connectivity, builder reputation, balcony vistas, and physical documents checklist..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl p-4 text-xs text-on-surface placeholder-slate-650 outline-none resize-none transition-colors"
                        />
                        {description && description.trim().length < 30 && (
                          <p className="text-[10px] text-gold-accent font-semibold">Needs {30 - description.trim().length} more characters for verification.</p>
                        )}
                      </div>

                      {/* Type Select */}
                      <div className="space-y-1.5">
                        <label htmlFor="step1-type-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Property Type Asset Class</label>
                        <select
                          id="step1-type-select"
                          value={type}
                          onChange={(e) => setType(e.target.value as any)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none cursor-pointer"
                        >
                          <option value="Flat">Flat / Builder Apartment</option>
                          <option value="Villa">Luxury Villa Estate</option>
                          <option value="Plot">Residential Land Plot</option>
                          <option value="Builder Floor">Independent Builder Floor</option>
                          <option value="Commercial">Commercial Office / Shop</option>
                        </select>
                      </div>

                      {/* BHK Config (Disabled for Commercial/Plots) */}
                      {type !== "Commercial" && type !== "Plot" ? (
                        <div className="space-y-1.5">
                          <label htmlFor="step1-bhk-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">BHK Configuration</label>
                          <select
                            id="step1-bhk-select"
                            value={bhk}
                            onChange={(e) => setBhk(e.target.value)}
                            className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none cursor-pointer"
                          >
                            <option value="1">1 BHK</option>
                            <option value="2">2 BHK</option>
                            <option value="3">3 BHK</option>
                            <option value="4">4 BHK</option>
                            <option value="5">5+ BHK / Penthouse</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-1.5 opacity-40">
                          <label htmlFor="auto-listpropertyview-711" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">BHK Config</label>
                          <input id="auto-listpropertyview-711"
                            type="text"
                            disabled
                            value="Not Applicable for this asset class"
                            className="w-full bg-surface/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-outline outline-none"
                          />
                        </div>
                      )}

                      {/* City Select */}
                      <div className="space-y-1.5">
                        <label htmlFor="step1-city-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Delhi NCR City Hub</label>
                        <select
                          id="step1-city-select"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none cursor-pointer"
                        >
                          <option value="Dwarka">Dwarka, Delhi</option>
                          <option value="Gurugram">Gurugram, HR</option>
                          <option value="Noida">Noida, UP</option>
                          <option value="Greater Noida West">Greater Noida West, UP</option>
                          <option value="South Delhi">South Delhi, Delhi</option>
                          <option value="Faridabad">Faridabad, HR</option>
                          <option value="Rohini">Rohini, Delhi</option>
                          <option value="Pitampura">Pitampura, Delhi</option>
                        </select>
                      </div>

                      {/* Locality Address */}
                      <div className="space-y-1.5">
                        <label htmlFor="step1-locality-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Locality Sector / Block Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="step1-locality-input"
                          type="text"
                          required
                          placeholder="e.g. Sector 10, Pocket 2 Enclaves"
                          value={locality}
                          onChange={(e) => setLocality(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-slate-650 outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= STEP 2: MEASUREMENTS & PRICING ================= */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-outline-variant/50 pb-3">
                      <FileText className="h-5 w-5 text-gold-accent" />
                      <h3 className="text-on-surface font-extrabold text-sm">Step 2: Pricing Metrics & Specifications</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Price input */}
                      <div className="space-y-1.5">
                        <label htmlFor="step2-price-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Property Ask price <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2.5">
                          <input
                            id="step2-price-input"
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 85"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="flex-1 bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none placeholder-slate-650 transition-colors"
                          />
                          <select
                            id="step2-price-unit"
                            value={priceUnit}
                            onChange={(e) => setPriceUnit(e.target.value as any)}
                            className="w-[100px] bg-surface border border-outline-variant rounded-xl px-3 py-3 text-xs text-on-surface outline-none cursor-pointer"
                          >
                            <option value="Lakhs">Lakhs (L)</option>
                            <option value="Crore">Crore (Cr)</option>
                          </select>
                        </div>
                        {price && (
                          <p className="text-[10px] text-on-surface-variant font-bold">
                            Total valuation calculation: ₹{(Number(price) * (priceUnit === "Lakhs" ? 100000 : 10000000)).toLocaleString("en-IN")} INR.
                          </p>
                        )}
                      </div>

                      {/* Area input */}
                      <div className="space-y-1.5">
                        <label htmlFor="step2-area-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Super / Built-up Area <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2.5">
                          <input
                            id="step2-area-input"
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 1450"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="flex-1 bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none placeholder-slate-650 transition-colors"
                          />
                          <select
                            id="step2-area-unit"
                            value={areaUnit}
                            onChange={(e) => setAreaUnit(e.target.value as any)}
                            className="w-[100px] bg-surface border border-outline-variant rounded-xl px-3 py-3 text-xs text-on-surface outline-none cursor-pointer"
                          >
                            <option value="sqft">sqft</option>
                            <option value="sqyd">sqyd</option>
                          </select>
                        </div>
                      </div>

                      {/* Floor Coordinates (Not applicable for Land plots) */}
                      {type !== "Plot" ? (
                        <div className="space-y-1.5">
                          <label htmlFor="step2-floor-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Floor Coordinates</label>
                          <input
                            id="step2-floor-input"
                            type="text"
                            placeholder="e.g. Ground Floor, or 5th out of 10"
                            value={floor}
                            onChange={(e) => setFloor(e.target.value)}
                            className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none placeholder-slate-650 transition-colors"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5 opacity-40">
                          <label htmlFor="auto-listpropertyview-845" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Floor Coordinates</label>
                          <input id="auto-listpropertyview-845"
                            type="text"
                            disabled
                            value="N/A (Plot Class)"
                            className="w-full bg-surface/60 border border-outline-variant/50 rounded-xl px-4 py-3 text-xs text-outline outline-none"
                          />
                        </div>
                      )}

                      {/* Facing aspect */}
                      <div className="space-y-1.5">
                        <label htmlFor="step2-facing-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Facing Aspect Direction</label>
                        <select
                          id="step2-facing-select"
                          value={facing}
                          onChange={(e) => setFacing(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none cursor-pointer"
                        >
                          <option value="East">East Facing (Highly Recommended)</option>
                          <option value="North">North Facing</option>
                          <option value="North-East">North-East</option>
                          <option value="West">West Facing</option>
                          <option value="South">South Facing</option>
                          <option value="South-West">South-West</option>
                        </select>
                      </div>

                      {/* Furnishing */}
                      <div className="space-y-1.5">
                        <label htmlFor="step2-furnishing-select" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Furnishing Standards</label>
                        <select
                          id="step2-furnishing-select"
                          value={furnishing}
                          onChange={(e) => setFurnishing(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface outline-none cursor-pointer"
                        >
                          <option value="Semi-Furnished">Semi-Furnished (Wardrobes & Kitchen)</option>
                          <option value="Fully Furnished">Fully Furnished (With Sofa & Appliances)</option>
                          <option value="Unfurnished">Unfurnished raw construction</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= STEP 3: PHOTO URLs & AMENITIES ================= */}
                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-outline-variant/50 pb-3">
                      <Award className="h-5 w-5 text-gold-accent" />
                      <h3 className="text-on-surface font-extrabold text-sm">Step 3: Asset Photos & Key Amenities</h3>
                    </div>

                    {/* Pre-configured premium presets */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pre-attached Professional Presets</p>
                        <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase">Enabled</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant leading-relaxed">
                        To maintain direct premium visual standards, we auto-attach {presetPhotos[type]?.length || 1} high-resolution architecture images representing a typical <strong>{type}</strong>. You may also add custom links below.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {(presetPhotos[type] || presetPhotos.Flat).map((url, i) => (
                          <div key={i} className="relative h-20 rounded-xl overflow-hidden bg-surface border border-outline-variant/50">
                            <img width={800} height={600} src={`${url}&w=150&q=80`} alt="Property preview" className="h-full w-full object-cover" loading="lazy" />
                            <span className="absolute bottom-1 right-1 bg-surface/85 text-on-surface text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Preset {i+1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Add Custom Local Upload block */}
                    <div className="space-y-3.5 pt-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="property-image-file-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Include Custom Photos</label>
                        <span className="text-[9px] bg-surface-container-high border border-outline-variant text-on-surface-variant font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {imageFiles.length}/10 uploaded
                        </span>
                      </div>

                      {/* DRAG AND DROP ZONE */}
                      <div 
                        id="media-upload-zone"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFilesAdded(e.dataTransfer.files);
                        }}
                        onClick={() => document.getElementById("property-image-file-input")?.click()}
                        className="border border-dashed border-outline-variant hover:border-gold-accent/50 bg-surface rounded-2xl py-6 px-4 text-center cursor-pointer transition-all hover:bg-surface/80 group"
                      >
                        <input 
                          id="property-image-file-input"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={(e) => handleFilesAdded(e.target.files)}
                          className="hidden"
                        />
                        <Upload className="h-7 w-7 text-on-surface-variant group-hover:text-gold-accent mx-auto mb-2.5 transition-colors" />
                        <h4 className="text-on-surface text-xs font-bold group-hover:text-gold-accent transition-colors mb-1">Click to upload or drag and drop</h4>
                        <p className="text-[9px] text-on-surface-variant leading-normal">
                          JPG, PNG, WebP up to 5MB each. Maximum 10 photos.
                        </p>
                      </div>

                      {/* LIMIT WARNING OVERFLOW */}
                      {imageFiles.length > 10 && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-500/5 border border-red-500/10 p-3.5 rounded-xl text-[10px] font-bold">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          Maximum 10 photos allowed.
                        </div>
                      )}

                      {/* FILE PREVIEW GRID - 3 COLUMNS */}
                      {imageFiles.length > 0 && (
                        <div id="media-preview-grid" className="grid grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                          {imageFiles.map((img, i) => {
                            const formattedSize = img.file.size > 1024 * 1024 
                              ? `${(img.file.size / (1024 * 1024)).toFixed(1)} MB`
                              : `${(img.file.size / 1024).toFixed(0)} KB`;
                            const shortName = img.file.name.length > 20 
                              ? img.file.name.slice(0, 14) + "..." + img.file.name.slice(-4)
                              : img.file.name;

                            return (
                              <div key={i} className="relative bg-surface border border-outline-variant/50 rounded-xl overflow-hidden group p-2 flex flex-col justify-between">
                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-surface-container border border-outline-variant/50">
                                  <img width={800} height={600} src={img.previewUrl} alt={img.file.name || "Uploaded image"} className="h-full w-full object-cover" loading="lazy" />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveImageFile(i);
                                    }}
                                    className="absolute top-1 right-1 h-5 w-5 bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-on-surface flex items-center justify-center rounded-full shadow-md transition-all cursor-pointer"
                                    title="Delete photo"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="mt-2 px-0.5 text-left">
                                  <p className="text-[10px] font-bold text-on-surface truncate" title={img.file.name}>
                                    {shortName}
                                  </p>
                                  <p className="text-[8px] text-on-surface-variant mt-0.5">
                                    {formattedSize}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* YouTube Video URL block */}
                    <div className="space-y-1.5 pt-2">
                      <label htmlFor="step3-video-url-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Optional YouTube Video tour URL</label>
                      <input
                        id="step3-video-url-input"
                        type="url"
                        placeholder="e.g. https://www.youtube.com/watch?v=xxxxxx"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-slate-650 outline-none"
                      />
                    </div>

                    {/* Amenities checkboxes */}
                    <div className="space-y-3 pt-3">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Select Premium Amenities Installed</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {amenitiesList.map((am) => {
                          const isSelected = amenities.includes(am);
                          return (
                            <button
                              type="button"
                              key={am}
                              onClick={() => handleAmenityToggle(am)}
                              className={`p-3 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                                isSelected 
                                  ? "bg-gold-accent/15 border-gold-accent text-gold-accent shadow shadow-gold-accent/5" 
                                  : "border-outline-variant/50 bg-surface text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              {am}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= STEP 4: PHYSICAL AUDIT DECLARATION ================= */}
                {step === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center gap-2 border-b border-outline-variant/50 pb-3">
                      <ShieldAlert className="h-5 w-5 text-gold-accent" />
                      <h3 className="text-on-surface font-extrabold text-sm">Step 4: Owner Authenticity Declaration & Signature</h3>
                    </div>

                    <div className="p-5 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-3.5">
                      <div className="flex gap-2.5 items-center">
                        <ShieldAlert className="h-5 w-5 text-gold-accent shrink-0" />
                        <h4 className="text-xs font-extrabold text-on-surface">RERA Physical Compliance Warning</h4>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        To maintain a fully verified direct-to-owner marketplace at Shiv Saya Properties, we do not support false broker listings. Submitting this form authorizes our local consultants to trigger a structural inspection and coordinate an physically verified property report.
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* Legal Signature statement authorization */}
                      <div className="p-5 bg-surface border border-outline-variant/50 rounded-2xl text-[11px] text-on-surface-variant leading-relaxed font-mono">
                        "I, <span className="text-gold-accent font-bold">{certifyingName || "Guest Seller"}</span>, under penalty of Indian civil legal action, certify that all ownership documents, title deeds, and dimensions supplied for this property listed at <span className="text-on-surface font-bold">{locality || "[Locality]"}</span>, <span className="text-on-surface font-bold">{city}</span> represent absolute physical truth and that I am authorized to list this asset under RERA guidelines."
                      </div>

                      {/* ACCEPTANCE CHECKBOX */}
                      <label htmlFor="step4-agree-checkbox" className="flex items-start gap-3 p-4 bg-surface/40 border border-outline-variant/50 rounded-2xl hover:border-gold-accent/25 transition-all select-none cursor-pointer">
                        <input
                          id="step4-agree-checkbox"
                          type="checkbox"
                          checked={isAgreedToCheckList}
                          onChange={(e) => setIsAgreedToCheckList(e.target.checked)}
                          className="mt-0.5 rounded border-outline-variant text-gold-accent focus:ring-gold-accent/30 h-4 w-4 bg-surface"
                        />
                        <span className="text-xs text-slate-350 font-semibold leading-relaxed">
                          I accept the physically audited declaration, and I authorize {BUSINESS_CONFIG.consultantName}'s evaluation consultants to contact me directly using verified contact records.
                        </span>
                      </label>

                      {/* SIGNATURE NAME FIELD */}
                      <div className="space-y-1.5 pt-2">
                        <label htmlFor="step4-sig-input" className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Type Full Authorizing Name (Signature Proof)</label>
                        <input
                          id="step4-sig-input"
                          type="text"
                          required
                          placeholder={`e.g. ${BUSINESS_CONFIG.consultantName}`}
                          value={currentUser?.displayName || certifyingName}
                          disabled={!!currentUser?.displayName}
                          onChange={(e) => setCertifyingName(e.target.value)}
                          className="w-full bg-surface border border-outline-variant focus:border-gold-accent/50 rounded-xl px-4 py-3 text-xs text-on-surface placeholder-slate-650 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEPS PREVIOUS & NEXT ACTION BUTTONS */}
                <div className="pt-8 border-t border-outline-variant/50 flex gap-4">
                  {step > 1 && (
                    <button
                      id="wizard-prev-btn"
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 py-3 border border-outline-variant hover:bg-white/5 rounded-xl text-center text-on-surface-variant hover:text-on-surface text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}
                  
                  {step < 4 ? (
                    <button
                      id="wizard-next-btn"
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 py-3 bg-gold-accent text-[#0F172A] text-xs font-bold rounded-xl text-center shadow uppercase transition-all hover:bg-gold-hover hover:scale-105 shadow-md flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      id="wizard-submit-btn"
                      type="submit"
                      disabled={!isAgreedToCheckList || !(currentUser?.displayName || certifyingName).trim()}
                      onClick={handleFormSubmit}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#0F172A] text-xs font-black rounded-xl text-center shadow uppercase transition-all hover:bg-gold-hover hover:scale-105 shadow-md disabled:opacity-30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Publish For Audit
                    </button>
                  )}
                </div>

              </form>

            </motion.div>
          ) : (
            
            /* CELEBRATORY CELEBRATION BOX ON SUCCESS */
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container border border-gold-accent/30 text-center py-16 px-8 rounded-3xl shadow-md max-w-lg mx-auto space-y-6"
            >
              <div className="h-16 w-16 bg-gold-accent/15 text-gold-accent rounded-full flex items-center justify-center mx-auto border border-gold-accent/45 animate-bounce">
                <Check className="h-8 w-8" />
              </div>

              <div>
                <span className="text-gold-accent text-xs font-bold uppercase tracking-widest block">Audit Identifier Assigned</span>
                <p className="font-mono text-[10px] text-outline mt-1">SSP-AUDIT-{Date.now().toString().slice(-6)}</p>
              </div>

              <h2 className="text-2xl font-black text-on-surface">Listing Submitted!</h2>
              
              <p className="text-on-surface-variant text-xs leading-relaxed max-w-sm mx-auto">
                Excellent work! Your property listing has been successfully saved inside persistent Firestore and queued for verification. Our Ghaziabad/Delhi NCR audit team will coordinate a physical structural assessment in <span className="text-on-surface font-bold">48 hours</span> to publish it live under RERA-Verified.
              </p>

              <div className="pt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <button
                  id="celebration-view-btn"
                  onClick={() => navigate("/profile")}
                  className="w-full sm:w-auto px-6 py-3 bg-surface-container-high text-on-surface font-bold text-xs rounded-xl border border-outline-variant cursor-pointer"
                >
                  My Workspace Dashboard
                </button>
                <button
                  id="celebration-home-btn"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto px-6 py-3 bg-gold-accent text-[#0F172A] font-bold text-xs rounded-xl flex items-center justify-center gap-2 group shadow-md cursor-pointer"
                >
                  Explore Properties
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
