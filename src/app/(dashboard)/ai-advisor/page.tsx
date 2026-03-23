"use client";

import { useState, useRef, useEffect } from "react";
import { GlassCard, GlassButton, GlassBadge } from "@/components/glass";
import {
  Bot,
  Send,
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Target,
  Leaf,
  DollarSign,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  X,
  MapPin,
  BarChart3,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  Image as ImageIcon,
  File,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  date: string;
  type: "pdf" | "csv" | "image";
  analysis?: string;
}

type PlanStatus = "not-started" | "in-progress" | "complete";

interface PlanItem {
  id: number;
  title: string;
  description: string;
  metrics: string;
  timeline: string;
  priority: "High" | "Medium" | "Low";
  status: PlanStatus;
}

// ─── Mock Data ──────────────────────────────────────────────────────
const suggestedQuestions = [
  "How can I improve my pasture quality?",
  "When is the best time to sell my steers?",
  "What's the optimal stocking rate for my property?",
  "How can I improve my herd's weight gain?",
  "Analyse my financial performance",
  "What vaccinations should I schedule next?",
];

const mockResponses: Record<string, string> = {
  "How can I improve my pasture quality?": `Based on your Nimbin property's subtropical climate, here are my recommendations for improving pasture quality across your 215 hectares:

**1. Soil Testing & Amelioration**
Your Northern Rivers country typically runs acidic (pH 4.5-5.5). I'd recommend soil testing all paddocks and applying lime at 2-3 t/ha where pH is below 5.5. This alone can lift pasture production 20-30%.

**2. Oversowing Improved Species**
Consider oversowing with tropical legumes like Wynn Cassia or Burgundy Bean. For your higher-altitude paddocks, white clover and ryegrass will boost winter feed. A mix of Bambatsi panic and Rhodes grass suits your frost-free areas.

**3. Fertiliser Program**
With 120 cows plus followers, you're looking at a stocking rate of roughly 1.5 head/ha. A targeted fertiliser program with 150-200 kg/ha of superphosphate in autumn, plus strategic nitrogen applications (50-75 kg urea/ha) before the spring flush, can significantly improve carrying capacity.

**4. Weed Management**
Giant rat's tail grass and fireweed are common issues in the Northern Rivers. Spot-spray GRT with flupropanate and manage fireweed with a combination of grazing pressure and targeted herbicide applications.

Implementing these changes should improve your pasture dry matter production by 2-3 t DM/ha annually and potentially allow you to increase your stocking rate to 1.8-2.0 head/ha within 12-18 months.`,

  "When is the best time to sell my steers?": `Looking at your 48 steers and the current EYCI trend, here's my analysis for optimal sell timing:

**Current Market Position**
The EYCI is sitting at 518 c/kg, which is above the 5-year average of 480 c/kg. The market has been trending upward over the past 6 weeks with strong restocking demand.

**Your Steers' Profile**
If your steers are averaging around 380-420 kg liveweight (which is typical for Northern Rivers bred cattle at 18-24 months), you're looking at a gross of approximately $1,970-$2,175 per head at current rates.

**Timing Recommendation**
I'd suggest selling in two drafts:
- **Draft 1 (Next 2-4 weeks):** Your heavier steers (400+ kg) through Casino Saleyards or AuctionsPlus. Autumn demand from lot feeders is strong right now.
- **Draft 2 (6-8 weeks):** Hold your lighter steers to add another 30-40 kg. At current growth rates, this adds approximately $155-210 per head in value.

**Seasonal Factors**
The Northern Rivers typically sees a price dip in late autumn as seasonal conditions tighten and more stock hits the market. Selling before ANZAC Day historically captures better prices.

Based on the current market trajectory, I'd estimate selling now vs holding 90 days nets you approximately $45-60 more per head, factoring in the seasonal decline and additional feed costs.`,

  "What's the optimal stocking rate for my property?": `For your 215 ha Nimbin property running 325 head, let me break down the stocking rate analysis:

**Current Stocking Rate**
You're running approximately 1.51 head/ha, or in DSE terms roughly 380 DSE across 215 ha = **1.77 DSE/ha**.

Breakdown:
- 120 cows (1.2 DSE each) = 144 DSE
- 5 bulls (1.8 DSE each) = 9 DSE
- 100 weaners (0.7 DSE each) = 70 DSE
- 48 steers (1.2 DSE each) = 57.6 DSE
- 52 heifers (1.0 DSE each) = 52 DSE
- **Total: ~333 DSE**

**Recommended Stocking Rate**
For the Northern Rivers region with its 1,200-1,500 mm annual rainfall and subtropical pastures, the safe long-term carrying capacity is typically:
- **Improved pastures:** 2.0-2.5 DSE/ha
- **Native/unimproved:** 0.8-1.2 DSE/ha

**My Assessment**
At 1.55 DSE/ha, you're running slightly below the potential for improved country but within a safe range for mixed pasture types. If 60% of your property is improved pasture, your theoretical capacity is around 365-400 DSE.

**Recommendation**
You could safely increase by 30-50 DSE, but I'd suggest doing this through improved weaner retention rather than purchasing additional breeders. This optimises your turnoff rate while building herd quality.`,

  "How can I improve my herd's weight gain?": `Here's a targeted weight gain improvement plan for your Nimbin herd:

**Current Estimated Performance**
Based on typical Northern Rivers herds, your weaners are likely averaging 0.6-0.8 kg/day and steers around 0.7-0.9 kg/day. Top-performing properties in your area achieve 1.0-1.2 kg/day.

**Key Strategies:**

**1. Nutrition Management**
- Introduce a mineral lick program. Northern Rivers soils are typically deficient in phosphorus, copper, and cobalt. A loose lick with 15% P supplement can improve growth rates by 0.1-0.2 kg/day.
- Strategic supplementation: During the winter feed gap (June-August), provide molasses/urea blocks or hay to maintain growth rates above 0.5 kg/day minimum.

**2. Parasite Control**
Internal parasites can reduce weight gain by 15-25%. Implement a strategic drenching program with faecal egg counts to time treatments effectively. Target 3-4 treatments annually for weaners with rotation of drench families.

**3. Genetic Selection**
Select bulls with high EBVs for 400-day weight and positive fat cover. For your Northern Rivers environment, look for bulls with +40 or higher for 400-day weight EBV. Brahman or Santa Gertrudis crosses perform well in your climate.

**4. Weaning Management**
Yard wean your calves for 5-7 days with good quality hay before paddock release. This reduces weaning stress and gets them eating sooner, preventing the typical 2-3 week growth check.

**Target:** Improve average daily gain by 0.15-0.2 kg/day across all classes. For your 48 steers, that's an additional 27-36 kg per head over a 180-day finishing period, worth approximately $140-190 per head at current prices.`,

  "Analyse my financial performance": `Based on your property profile, here's a financial analysis for your Nimbin operation:

**Revenue Estimate (Annual)**
- Steer turnoff (48 head @ avg 420 kg @ 518 c/kg): **$104,803**
- Heifer turnoff (est. 20 surplus heifers @ 380 kg @ 490 c/kg): **$37,240**
- Cull cows (est. 15 head @ 520 kg @ 310 c/kg): **$24,180**
- **Total Gross Revenue: ~$166,223**

**Operating Costs Estimate**
- Pasture & fertiliser (215 ha @ $85/ha): $18,275
- Supplementary feed & licks: $12,500
- Animal health (325 head @ $18/head): $5,850
- Bull depreciation (5 bulls @ $8,000, 4-yr life): $10,000
- Freight & selling costs (6% of sales): $9,973
- Fuel, repairs & maintenance: $14,000
- Insurance & rates: $8,200
- Labour (owner + casual): $35,000
- **Total Operating Costs: ~$113,798**

**Key Metrics**
- **Gross Margin: $52,425** ($244/ha)
- **Operating Margin: 31.5%**
- **Cost per DSE: $342**
- **Return per hectare: $244**

**Benchmarking**
The top 25% of Northern Rivers beef enterprises achieve $350+/ha gross margin. To reach this level, you'd need to:
1. Improve turnoff weights by 10-15%
2. Increase stocking rate by 15-20% through pasture improvement
3. Reduce per-head health costs through better preventative programs

Your operation is performing in the middle 50% of comparable properties. The 10-Point Improvement Plan targets moving you into the top quartile within 2-3 years.`,

  "What vaccinations should I schedule next?": `Based on your herd profile of 325 head in the Northern Rivers, here's your vaccination schedule:

**Immediate (Next 2 Weeks)**
- **5-in-1 (Ultravac 5-in-1)** for your 100 weaners. This covers clostridial diseases (pulpy kidney, tetanus, blackleg, black disease, malignant oedema). Administer primary course: two shots 4-6 weeks apart. Cost: ~$3.20/dose.

**Next Month**
- **Pestiguard** for heifers being retained as breeders (est. 32 head). Two doses 4 weeks apart, with the second dose given at least 2 weeks before joining. Critical for preventing Pestivirus-related reproductive losses. Cost: ~$8.50/dose.
- **Vibrovax** for bulls pre-joining. All 5 bulls should receive a booster 4 weeks before the breeding season. Cost: ~$6.00/dose.

**Quarterly (Before Spring Joining)**
- **Botulism booster** (Longrange or similar) for the whole herd, especially if you have any carcass material in paddocks. Cost: ~$4.80/dose.
- **3-Day Sickness (Bovine Ephemeral Fever)** vaccine for all cattle over 6 months, critical in the Northern Rivers where insect vectors are prevalent during summer. Two initial doses 3 weeks apart. Cost: ~$2.60/dose.

**Annual Program**
- **Tick Fever vaccine** for any introduced cattle not previously vaccinated (3 Germ vaccine from Tick Fever Centre, Wacol). Essential for the Northern Rivers.

**Estimated Annual Vaccination Budget:** $4,200-$5,100 for 325 head.

I'd recommend setting up calendar reminders for each vaccination event, and always recording batch numbers and expiry dates.`,
};

const defaultResponse = `That's a great question. Based on your 215-hectare Nimbin property running 325 head of mixed cattle, I'd need to consider several factors specific to the Northern Rivers region.

Your subtropical climate with 1,200-1,500 mm annual rainfall provides excellent pasture growth potential, but also presents challenges with parasite pressure and summer heat stress.

I'd recommend we look at this in the context of your overall property management plan. Would you like me to provide more specific advice on any particular aspect of your operation?`;

const initialPlanItems: PlanItem[] = [
  {
    id: 1,
    title: "Pasture Renovation & Soil Testing",
    description: "Conduct comprehensive soil tests across all paddocks. Apply lime to acidic soils and develop a targeted fertiliser program. Oversow with improved subtropical pasture species suited to the Northern Rivers.",
    metrics: "Increase pasture DM production from 6 t/ha to 8-9 t/ha. Achieve soil pH 5.5+ across all paddocks.",
    timeline: "Month 1-6",
    priority: "High",
    status: "not-started",
  },
  {
    id: 2,
    title: "Genetic Improvement Program",
    description: "Evaluate current bull team using EBV data. Source high-performance bulls with strong 400-day weight and carcase EBVs. Consider AI program for top 30% of breeders.",
    metrics: "Improve 400-day weight EBV by +10 kg within 3 years. Target 200-day weaning weights of 240+ kg.",
    timeline: "Month 1-12",
    priority: "High",
    status: "not-started",
  },
  {
    id: 3,
    title: "Weight Gain Optimisation",
    description: "Implement mineral supplementation program. Introduce strategic supplementary feeding during winter feed gap. Optimise weaning protocols with yard weaning.",
    metrics: "Lift average daily gain from 0.7 to 0.9+ kg/day. Reduce weaning stress weight loss by 50%.",
    timeline: "Month 1-3",
    priority: "High",
    status: "not-started",
  },
  {
    id: 4,
    title: "Strategic Selling - Timing & Location",
    description: "Analyse market cycles and EYCI trends to time turnoff. Establish relationships with Casino, Grafton, and online platforms. Draft cattle in weight bands for optimal returns.",
    metrics: "Achieve 5-10% premium over average market prices. Reduce selling costs by 2% through direct-to-feedlot sales.",
    timeline: "Month 2-6",
    priority: "High",
    status: "not-started",
  },
  {
    id: 5,
    title: "Water Infrastructure Upgrade",
    description: "Audit all water points, troughs, and dam levels. Install gravity-fed trough systems in key paddocks. Ensure every paddock has reliable water within 500m of all grazing areas.",
    metrics: "100% paddock coverage with permanent water. Reduce stock walking distance to water by 30%.",
    timeline: "Month 3-9",
    priority: "Medium",
    status: "not-started",
  },
  {
    id: 6,
    title: "Rotational Grazing Implementation",
    description: "Design and implement a rotational grazing system with 8-12 paddock cells. Allow 30-60 day rest periods for pasture recovery. Use electric fencing for flexible subdivision.",
    metrics: "Increase carrying capacity by 15-20%. Improve ground cover to 90%+ year-round.",
    timeline: "Month 2-8",
    priority: "Medium",
    status: "not-started",
  },
  {
    id: 7,
    title: "Health Management Protocol",
    description: "Establish structured vaccination calendar. Implement strategic drench rotation based on FECs. Set up quarterly herd health assessments with BCS monitoring.",
    metrics: "Reduce mortality rate to <1%. Achieve 95%+ weaning rate. Maintain BCS 3+ across all breeders.",
    timeline: "Month 1-3",
    priority: "Medium",
    status: "not-started",
  },
  {
    id: 8,
    title: "Feed Efficiency Program",
    description: "Conduct feed-cost analysis per DSE. Identify lowest-cost feed sources for winter supplementation. Establish silage or hay reserves for drought resilience.",
    metrics: "Reduce feed cost per kg of liveweight gain by 15%. Maintain 90-day feed reserve.",
    timeline: "Month 3-12",
    priority: "Medium",
    status: "not-started",
  },
  {
    id: 9,
    title: "Carbon Credit Registration",
    description: "Investigate Emissions Reduction Fund (ERF) methodologies for beef properties. Register soil carbon or vegetation projects. Assess carbon income potential from improved land management.",
    metrics: "Generate $10,000-25,000/year in carbon credit income. Sequester 1-2 t CO2-e/ha/year.",
    timeline: "Month 6-12",
    priority: "Low",
    status: "not-started",
  },
  {
    id: 10,
    title: "Technology & Data Integration",
    description: "Full EID tag rollout for all cattle. Implement digital record keeping for weights, treatments, and movements. Use satellite pasture monitoring for grazing decisions.",
    metrics: "100% herd traceability. Real-time paddock DM estimates. Data-driven culling decisions.",
    timeline: "Ongoing",
    priority: "Low",
    status: "not-started",
  },
];

const saleyards = [
  { name: "Casino Saleyards", distance: "32 km", nextSale: "Every Tuesday", avgPrice: "525 c/kg" },
  { name: "Grafton Saleyards", distance: "68 km", nextSale: "Fortnightly Thursday", avgPrice: "510 c/kg" },
  { name: "Lismore Saleyards", distance: "45 km", nextSale: "Monthly", avgPrice: "505 c/kg" },
  { name: "AuctionsPlus (Online)", distance: "Online", nextSale: "Weekly", avgPrice: "530 c/kg" },
];

// ─── Component ──────────────────────────────────────────────────────
export default function AIAdvisorPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "plan" | "upload" | "market">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [planItems, setPlanItems] = useState<PlanItem[]>(initialPlanItems);
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = mockResponses[text.trim()] || defaultResponse;
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const togglePlanStatus = (id: number) => {
    setPlanItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next: PlanStatus =
          item.status === "not-started"
            ? "in-progress"
            : item.status === "in-progress"
            ? "complete"
            : "not-started";
        return { ...item, status: next };
      })
    );
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const fileType: "pdf" | "csv" | "image" = ext === "csv" ? "csv" : ext === "pdf" ? "pdf" : "image";
      const analyses: Record<string, string> = {
        pdf: "Soil test results analysed. pH levels range from 4.8-5.6 across sampled paddocks. Phosphorus levels are low (12-18 mg/kg Colwell P). Recommendation: Apply 2.5 t/ha lime to paddocks 3, 5, and 7. Apply single superphosphate at 200 kg/ha across all paddocks in autumn.",
        csv: "Financial data imported. Revenue trending upward 8% YoY. Feed costs represent 34% of total operating costs, which is above the benchmark of 28%. Opportunity to reduce costs by $8,200 annually through improved pasture management.",
        image: "Pasture assessment complete. Estimated ground cover: 72%. Dominant species: Setaria (40%), Rhodes grass (25%), native grasses (20%), weeds (15%). Recommendation: Oversow with Wynn Cassia and apply targeted herbicide for broadleaf weeds. Current condition rates as Fair - improvement needed before summer.",
      };

      const newFile: UploadedFile = {
        id: Date.now().toString() + file.name,
        name: file.name,
        size: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        date: new Date().toLocaleDateString("en-AU"),
        type: fileType,
        analysis: analyses[fileType],
      };
      setUploadedFiles((prev) => [...prev, newFile]);
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const statusIcon = (status: PlanStatus) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "in-progress":
        return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />;
      default:
        return <Circle className="w-5 h-5 text-white/30" />;
    }
  };

  const priorityVariant = (p: string): "danger" | "warning" | "info" => {
    if (p === "High") return "danger";
    if (p === "Medium") return "warning";
    return "info";
  };

  const tabs = [
    { id: "chat" as const, label: "AI Chat", icon: Bot },
    { id: "plan" as const, label: "10-Point Plan", icon: Target },
    { id: "upload" as const, label: "Upload & Analyse", icon: Upload },
    { id: "market" as const, label: "Market Timing", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Farm Advisor</h1>
            <p className="text-white/50 text-sm">Powered by AI &middot; Tailored to your 215 ha Nimbin property</p>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <GlassCard className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/50">Optimal Sell Window</span>
          </div>
          <p className="text-lg font-bold text-white">Next 2-4 wks</p>
          <p className="text-[11px] text-emerald-400">EYCI trending up +3.2%</p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/50">Stocking Rate</span>
          </div>
          <p className="text-lg font-bold text-white">1.55 DSE/ha</p>
          <p className="text-[11px] text-amber-400">Rec: 1.8-2.0 DSE/ha</p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/50">Pasture Health</span>
          </div>
          <p className="text-lg font-bold text-white">72/100</p>
          <p className="text-[11px] text-amber-400">Fair - needs improvement</p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/50">Financial Health</span>
          </div>
          <p className="text-lg font-bold text-white">$166K rev</p>
          <p className="text-[11px] text-emerald-400">31.5% operating margin</p>
        </GlassCard>

        <GlassCard className="col-span-2 lg:col-span-1 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-white/50">Next Actions</span>
          </div>
          <ul className="space-y-1">
            <li className="text-[11px] text-white/80 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
              Vaccinate 100 weaners (5-in-1)
            </li>
            <li className="text-[11px] text-white/80 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
              Soil test paddocks 3, 5, 7
            </li>
            <li className="text-[11px] text-white/80 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
              Draft steers for Casino sale
            </li>
          </ul>
        </GlassCard>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB: AI Chat ────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <GlassCard padding="none" className="flex flex-col" style={{ minHeight: "520px" }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "480px" }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-purple-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">G&rsquo;day! How can I help?</h3>
                  <p className="text-sm text-white/50 max-w-md mb-6">
                    Ask me anything about your Nimbin property. I have data on your 325 head across 215 hectares and can provide tailored advice for the Northern Rivers region.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="px-3.5 py-2 rounded-full text-xs font-medium bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200 border border-white/10"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-purple-300" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-500/30 text-white ml-auto"
                        : "bg-white/10 text-white/90"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <p className="text-[10px] text-white/30 mt-2">
                      {msg.timestamp.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                  <div className="bg-white/10 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your farm..."
                  className="glass-input flex-1 !rounded-xl"
                  disabled={isTyping}
                />
                <GlassButton
                  variant="primary"
                  size="md"
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  icon={<Send className="w-4 h-4" />}
                >
                  Send
                </GlassButton>
              </div>
              {messages.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedQuestions.filter((q) => !messages.some((m) => m.content === q)).slice(0, 3).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80 transition-all duration-200 border border-white/5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── TAB: 10-Point Plan ──────────────────────────────────── */}
      {activeTab === "plan" && (
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-white">10-Point Profitability Improvement Plan</h2>
              <p className="text-xs text-white/40 mt-0.5">
                Tailored for your 215 ha Nimbin property &middot; {planItems.filter((i) => i.status === "complete").length}/10 complete
              </p>
            </div>
            <div className="flex items-center gap-2">
              <GlassBadge variant="success">{planItems.filter((i) => i.status === "complete").length} Done</GlassBadge>
              <GlassBadge variant="warning">{planItems.filter((i) => i.status === "in-progress").length} Active</GlassBadge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(planItems.filter((i) => i.status === "complete").length / 10) * 100}%` }}
            />
          </div>

          {planItems.map((item, idx) => (
            <GlassCard
              key={item.id}
              padding="none"
              className="animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${200 + idx * 50}ms` }}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedPlan(expandedPlan === item.id ? null : item.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlanStatus(item.id);
                  }}
                  className="shrink-0 hover:scale-110 transition-transform"
                  title="Toggle status"
                >
                  {statusIcon(item.status)}
                </button>

                <span className="text-white/30 font-mono text-sm w-6 shrink-0">{String(item.id).padStart(2, "0")}</span>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${item.status === "complete" ? "text-white/50 line-through" : "text-white"}`}>
                    {item.title}
                  </p>
                </div>

                <GlassBadge variant={priorityVariant(item.priority)} className="shrink-0">
                  {item.priority}
                </GlassBadge>

                <span className="text-[11px] text-white/40 shrink-0 hidden sm:block">{item.timeline}</span>

                {expandedPlan === item.id ? (
                  <ChevronDown className="w-4 h-4 text-white/30 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
                )}
              </div>

              {/* Expanded content */}
              {expandedPlan === item.id && (
                <div className="border-t border-white/10 p-4 space-y-3 bg-white/5">
                  <div>
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Action</p>
                    <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Target Metrics / KPIs</p>
                    <p className="text-sm text-white/80 leading-relaxed">{item.metrics}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Timeline</p>
                      <p className="text-sm text-white/80">{item.timeline}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1">Status</p>
                      <button
                        onClick={() => togglePlanStatus(item.id)}
                        className={`text-sm px-3 py-1 rounded-lg transition-colors ${
                          item.status === "complete"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : item.status === "in-progress"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {item.status === "not-started" ? "Not Started" : item.status === "in-progress" ? "In Progress" : "Complete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* ── TAB: Upload & Analyse ───────────────────────────────── */}
      {activeTab === "upload" && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          {/* Dropzone */}
          <GlassCard
            padding="none"
            className={`border-2 border-dashed transition-colors ${
              isDragging ? "border-purple-400/60 bg-purple-500/10" : "border-white/20"
            }`}
          >
            <div
              className="p-8 flex flex-col items-center justify-center text-center"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Upload className="w-7 h-7 text-purple-300" />
              </div>
              <h3 className="text-base font-semibold text-white mb-1">Upload Files for AI Analysis</h3>
              <p className="text-sm text-white/50 mb-4 max-w-md">
                Drag and drop soil test results (PDF/CSV), pasture assessment photos, or financial reports. Our AI will analyse and provide actionable insights.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.csv,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <GlassButton variant="primary" onClick={() => fileInputRef.current?.click()}>
                Choose Files
              </GlassButton>
              <p className="text-[11px] text-white/30 mt-3">Supports PDF, CSV, JPG, PNG &middot; Max 25 MB per file</p>
            </div>
          </GlassCard>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white/70">Analysed Files</h3>
              {uploadedFiles.map((file) => (
                <GlassCard key={file.id} padding="sm" className="animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      file.type === "pdf" ? "bg-red-500/20" : file.type === "csv" ? "bg-green-500/20" : "bg-blue-500/20"
                    }`}>
                      {file.type === "pdf" ? (
                        <FileText className="w-5 h-5 text-red-300" />
                      ) : file.type === "csv" ? (
                        <File className="w-5 h-5 text-green-300" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-blue-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <button onClick={() => removeFile(file.id)} className="text-white/30 hover:text-white/60 transition-colors shrink-0 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-white/40">{file.size} &middot; {file.date}</p>
                      {file.analysis && (
                        <div className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-400/20">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                            <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">AI Analysis</span>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed">{file.analysis}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Market Timing ──────────────────────────────────── */}
      {activeTab === "market" && (
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          {/* Current Price */}
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Eastern Young Cattle Indicator</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold text-white">518</span>
                  <span className="text-sm text-white/50">c/kg cwt</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-emerald-400">+3.2%</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-400/20">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-300 mb-1">AI Recommendation: SELL</p>
                  <p className="text-xs text-white/70 leading-relaxed">
                    The EYCI is currently 8% above the 5-year average and showing seasonal strength. With autumn typically bringing more supply to market, I recommend selling your heavier steers (400+ kg) within the next 2-4 weeks to capture current premiums. Hold lighter cattle for an additional 6-8 weeks of weight gain.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Revenue Projections */}
          <GlassCard>
            <h3 className="text-sm font-semibold text-white mb-3">Projected Revenue - 48 Steers</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Sell Now", price: "518 c/kg", revenue: "$104,803", trend: "up", recommended: true },
                { label: "+30 Days", price: "505 c/kg", revenue: "$106,050", trend: "neutral", recommended: false },
                { label: "+60 Days", price: "488 c/kg", revenue: "$103,420", trend: "down", recommended: false },
                { label: "+90 Days", price: "475 c/kg", revenue: "$102,600", trend: "down", recommended: false },
              ].map((proj) => (
                <div
                  key={proj.label}
                  className={`p-3 rounded-xl border ${
                    proj.recommended ? "bg-emerald-500/10 border-emerald-400/30" : "bg-white/5 border-white/10"
                  }`}
                >
                  <p className="text-xs text-white/50">{proj.label}</p>
                  <p className="text-lg font-bold text-white mt-1">{proj.revenue}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[11px] text-white/40">@ {proj.price}</span>
                    {proj.trend === "up" && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                    {proj.trend === "down" && <TrendingDown className="w-3 h-3 text-red-400" />}
                  </div>
                  {proj.recommended && (
                    <GlassBadge variant="success" className="mt-2">Recommended</GlassBadge>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/30 mt-3">
              Projections based on EYCI seasonal trends, current weight (avg 420 kg), and estimated ADG of 0.8 kg/day. Feed costs of $1.20/head/day factored into hold scenarios.
            </p>
          </GlassCard>

          {/* Saleyards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                Nearest Saleyards
              </h3>
              <div className="space-y-2">
                {saleyards.map((yard) => (
                  <div key={yard.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{yard.name}</p>
                      <p className="text-[11px] text-white/40">{yard.nextSale}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{yard.avgPrice}</p>
                      <p className="text-[11px] text-white/40">{yard.distance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Online Selling Platforms
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">AuctionsPlus</p>
                    <p className="text-[11px] text-white/40">Weekly online auctions &middot; Wider buyer pool</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">+2-5% premium</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">StockLive</p>
                    <p className="text-[11px] text-white/40">Live-streamed sales &middot; Real-time bidding</p>
                  </div>
                  <div className="flex items-center gap-1 text-blue-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Growing platform</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">Direct to Feedlot</p>
                    <p className="text-[11px] text-white/40">Contract selling &middot; Price certainty</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Grid price only</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20">
                <p className="text-xs text-white/70 leading-relaxed">
                  <span className="font-semibold text-blue-300">Tip:</span> For your 48 steers, AuctionsPlus typically achieves a 2-5% premium over physical saleyards for well-described lines with good photos and weight data. Consider splitting: sell 24 through Casino and 24 through AuctionsPlus to compare returns.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
