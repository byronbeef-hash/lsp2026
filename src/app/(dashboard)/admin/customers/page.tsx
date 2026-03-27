"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { GlassCard, GlassButton, GlassInput, GlassBadge } from "@/components/glass";
import { GlassSelect } from "@/components/glass/GlassSelect";
import {
  Bot,
  Send,
  Users,
  CreditCard,
  DollarSign,
  BarChart3,
  Search,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
  Mail,
  TrendingUp,
  Activity,
  Clock,
  Sparkles,
  X,
  MessageSquare,
  PieChart,
  Grid3X3,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────
interface Customer {
  id: number;
  name: string;
  email: string;
  farmName: string;
  location: string;
  plan: "Free" | "Starter" | "Pro" | "Enterprise" | "Trial";
  herdSize: number;
  lastLogin: string;
  status: "Active" | "Trial" | "Churned" | "Overdue";
  totalRecords: number;
  weighIns: number;
  scanSessions: number;
  monthlyRevenue: number;
  joinDate: string;
  features: {
    scanner: boolean;
    medical: boolean;
    maps: boolean;
    climate: boolean;
    reports: boolean;
    ai: boolean;
  };
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: AIResponseData;
}

interface AIResponseData {
  table?: { headers: string[]; rows: string[][] };
  insight?: string;
  actions?: string[];
  chartBars?: { label: string; value: number; max: number }[];
  sparkline?: number[];
}

type SortField = "name" | "farmName" | "location" | "plan" | "herdSize" | "lastLogin" | "status" | "monthlyRevenue";
type SortDir = "asc" | "desc";

// ─── Mock Customer Data ─────────────────────────────────────────────
const mockCustomers: Customer[] = [
  { id: 1, name: "Jack McPherson", email: "jack@mcphersoncattle.com.au", farmName: "McPherson Cattle Co", location: "Casino, NSW", plan: "Pro", herdSize: 450, lastLogin: "2026-03-26", status: "Active", totalRecords: 1240, weighIns: 89, scanSessions: 134, monthlyRevenue: 79, joinDate: "2024-06-15", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 2, name: "Sarah Williams", email: "sarah@willowcreek.com.au", farmName: "Willow Creek Station", location: "Lismore, NSW", plan: "Enterprise", herdSize: 1200, lastLogin: "2026-03-27", status: "Active", totalRecords: 3450, weighIns: 210, scanSessions: 380, monthlyRevenue: 199, joinDate: "2023-11-20", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 3, name: "Tom Bradley", email: "tom@bradleyranch.com.au", farmName: "Bradley Ranch", location: "Toowoomba, QLD", plan: "Starter", herdSize: 180, lastLogin: "2026-02-18", status: "Active", totalRecords: 420, weighIns: 34, scanSessions: 12, monthlyRevenue: 29, joinDate: "2025-01-10", features: { scanner: false, medical: true, maps: true, climate: false, reports: false, ai: false } },
  { id: 4, name: "Emily Chen", email: "emily@greenvalleyfarm.com.au", farmName: "Green Valley Farm", location: "Byron Bay, NSW", plan: "Pro", herdSize: 320, lastLogin: "2026-03-25", status: "Active", totalRecords: 890, weighIns: 67, scanSessions: 95, monthlyRevenue: 79, joinDate: "2024-09-03", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: false } },
  { id: 5, name: "Dave O'Brien", email: "dave@obrienpastures.com.au", farmName: "O'Brien Pastures", location: "Dalby, QLD", plan: "Enterprise", herdSize: 890, lastLogin: "2026-03-27", status: "Active", totalRecords: 2100, weighIns: 156, scanSessions: 245, monthlyRevenue: 199, joinDate: "2024-02-28", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 6, name: "Michelle Torres", email: "michelle@sunrisefarm.com.au", farmName: "Sunrise Farm", location: "Grafton, NSW", plan: "Starter", herdSize: 95, lastLogin: "2026-03-20", status: "Active", totalRecords: 210, weighIns: 18, scanSessions: 5, monthlyRevenue: 29, joinDate: "2025-07-22", features: { scanner: false, medical: true, maps: false, climate: false, reports: false, ai: false } },
  { id: 7, name: "Bruce Henderson", email: "bruce@hendersoncattle.com.au", farmName: "Henderson Cattle", location: "Roma, QLD", plan: "Pro", herdSize: 560, lastLogin: "2026-01-15", status: "Churned", totalRecords: 1580, weighIns: 112, scanSessions: 178, monthlyRevenue: 0, joinDate: "2023-08-11", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: false } },
  { id: 8, name: "Lisa Nguyen", email: "lisa@riverview.com.au", farmName: "Riverview Angus", location: "Hamilton, VIC", plan: "Pro", herdSize: 410, lastLogin: "2026-03-26", status: "Active", totalRecords: 960, weighIns: 78, scanSessions: 112, monthlyRevenue: 79, joinDate: "2024-04-18", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 9, name: "Craig Watson", email: "craig@bluemountainstation.com.au", farmName: "Blue Mountain Station", location: "Nimbin, NSW", plan: "Free", herdSize: 45, lastLogin: "2026-02-01", status: "Churned", totalRecords: 65, weighIns: 4, scanSessions: 0, monthlyRevenue: 0, joinDate: "2025-09-15", features: { scanner: false, medical: false, maps: false, climate: false, reports: false, ai: false } },
  { id: 10, name: "Amanda Scott", email: "amanda@scottproperty.com.au", farmName: "Scott Property Group", location: "Sale, VIC", plan: "Enterprise", herdSize: 1450, lastLogin: "2026-03-27", status: "Active", totalRecords: 4200, weighIns: 290, scanSessions: 410, monthlyRevenue: 199, joinDate: "2023-05-07", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 11, name: "Peter Hall", email: "peter@hallhereford.com.au", farmName: "Hall Hereford Stud", location: "Murray Bridge, SA", plan: "Pro", herdSize: 380, lastLogin: "2026-03-24", status: "Active", totalRecords: 1100, weighIns: 92, scanSessions: 145, monthlyRevenue: 79, joinDate: "2024-01-30", features: { scanner: true, medical: true, maps: true, climate: false, reports: true, ai: false } },
  { id: 12, name: "Jenny Fraser", email: "jenny@fraserdownsfarm.com.au", farmName: "Fraser Downs", location: "Albany, WA", plan: "Starter", herdSize: 150, lastLogin: "2026-03-22", status: "Active", totalRecords: 340, weighIns: 28, scanSessions: 15, monthlyRevenue: 29, joinDate: "2025-04-12", features: { scanner: false, medical: true, maps: true, climate: false, reports: false, ai: false } },
  { id: 13, name: "Ryan Mitchell", email: "ryan@mitchellgrazing.com.au", farmName: "Mitchell Grazing Co", location: "Casino, NSW", plan: "Trial", herdSize: 220, lastLogin: "2026-03-27", status: "Trial", totalRecords: 45, weighIns: 6, scanSessions: 8, monthlyRevenue: 0, joinDate: "2026-03-20", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 14, name: "Kate Sullivan", email: "kate@sullivanfarms.com.au", farmName: "Sullivan Family Farms", location: "Toowoomba, QLD", plan: "Pro", herdSize: 340, lastLogin: "2026-03-15", status: "Overdue", totalRecords: 780, weighIns: 55, scanSessions: 88, monthlyRevenue: 79, joinDate: "2024-08-25", features: { scanner: true, medical: true, maps: true, climate: true, reports: false, ai: false } },
  { id: 15, name: "Mark Thompson", email: "mark@redsoilcattle.com.au", farmName: "Red Soil Cattle", location: "Dalby, QLD", plan: "Starter", herdSize: 160, lastLogin: "2026-03-26", status: "Active", totalRecords: 380, weighIns: 30, scanSessions: 22, monthlyRevenue: 29, joinDate: "2025-02-18", features: { scanner: true, medical: true, maps: false, climate: false, reports: false, ai: false } },
  { id: 16, name: "Fiona Burke", email: "fiona@burkestation.com.au", farmName: "Burke Station", location: "Roma, QLD", plan: "Enterprise", herdSize: 980, lastLogin: "2026-03-27", status: "Active", totalRecords: 2800, weighIns: 198, scanSessions: 310, monthlyRevenue: 199, joinDate: "2023-12-01", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 17, name: "Steve Grant", email: "steve@grantpastures.com.au", farmName: "Grant Pastures", location: "Lismore, NSW", plan: "Free", herdSize: 35, lastLogin: "2026-03-10", status: "Active", totalRecords: 42, weighIns: 3, scanSessions: 0, monthlyRevenue: 0, joinDate: "2025-11-05", features: { scanner: false, medical: false, maps: false, climate: false, reports: false, ai: false } },
  { id: 18, name: "Helen Park", email: "helen@parklandgrazing.com.au", farmName: "Parkland Grazing", location: "Grafton, NSW", plan: "Trial", herdSize: 175, lastLogin: "2026-03-26", status: "Trial", totalRecords: 28, weighIns: 4, scanSessions: 6, monthlyRevenue: 0, joinDate: "2026-03-22", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 19, name: "Daniel Cooper", email: "dan@cooperhills.com.au", farmName: "Cooper Hills", location: "Hamilton, VIC", plan: "Pro", herdSize: 290, lastLogin: "2026-02-10", status: "Churned", totalRecords: 650, weighIns: 45, scanSessions: 70, monthlyRevenue: 0, joinDate: "2024-07-14", features: { scanner: true, medical: true, maps: true, climate: false, reports: true, ai: false } },
  { id: 20, name: "Rebecca Lewis", email: "bec@lewisfarms.com.au", farmName: "Lewis Farms", location: "Byron Bay, NSW", plan: "Starter", herdSize: 120, lastLogin: "2026-03-25", status: "Active", totalRecords: 290, weighIns: 22, scanSessions: 18, monthlyRevenue: 29, joinDate: "2025-06-30", features: { scanner: true, medical: true, maps: false, climate: false, reports: false, ai: false } },
  { id: 21, name: "Shane Kelly", email: "shane@kellyangus.com.au", farmName: "Kelly Angus Stud", location: "Nimbin, NSW", plan: "Trial", herdSize: 260, lastLogin: "2026-03-25", status: "Trial", totalRecords: 38, weighIns: 5, scanSessions: 10, monthlyRevenue: 0, joinDate: "2026-03-18", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 22, name: "Tanya Morris", email: "tanya@morrisstud.com.au", farmName: "Morris Stud Farm", location: "Murray Bridge, SA", plan: "Pro", herdSize: 520, lastLogin: "2026-03-23", status: "Overdue", totalRecords: 1350, weighIns: 98, scanSessions: 160, monthlyRevenue: 79, joinDate: "2024-03-09", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: false } },
  { id: 23, name: "Luke Dawson", email: "luke@dawsonproperty.com.au", farmName: "Dawson Property", location: "Sale, VIC", plan: "Starter", herdSize: 85, lastLogin: "2026-03-19", status: "Active", totalRecords: 190, weighIns: 14, scanSessions: 8, monthlyRevenue: 29, joinDate: "2025-10-20", features: { scanner: false, medical: true, maps: true, climate: false, reports: false, ai: false } },
  { id: 24, name: "Natalie Ward", email: "nat@wardcattle.com.au", farmName: "Ward Cattle Company", location: "Albany, WA", plan: "Pro", herdSize: 380, lastLogin: "2026-03-26", status: "Active", totalRecords: 920, weighIns: 72, scanSessions: 105, monthlyRevenue: 79, joinDate: "2024-05-22", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
  { id: 25, name: "James Whitfield", email: "james@whitfieldstation.com.au", farmName: "Whitfield Station", location: "Casino, NSW", plan: "Trial", herdSize: 310, lastLogin: "2026-03-27", status: "Trial", totalRecords: 52, weighIns: 7, scanSessions: 12, monthlyRevenue: 0, joinDate: "2026-03-15", features: { scanner: true, medical: true, maps: true, climate: true, reports: true, ai: true } },
];

// ─── AI Response Simulation Data ────────────────────────────────────
const aiResponses: Record<string, { text: string; data?: AIResponseData }> = {
  "Show me customers who haven't logged in for 30+ days": {
    text: "I found 5 customers who haven't logged in for 30+ days. These accounts represent $187/mo in revenue at risk. Two are on paid plans that may churn without intervention.",
    data: {
      table: {
        headers: ["Customer", "Plan", "Last Login", "Days Inactive", "Revenue"],
        rows: [
          ["Bruce Henderson", "Pro", "15 Jan 2026", "71 days", "$79/mo"],
          ["Craig Watson", "Free", "1 Feb 2026", "54 days", "$0/mo"],
          ["Daniel Cooper", "Pro", "10 Feb 2026", "45 days", "$79/mo"],
          ["Tom Bradley", "Starter", "18 Feb 2026", "37 days", "$29/mo"],
          ["Steve Grant", "Free", "10 Mar 2026", "17 days", "$0/mo"],
        ],
      },
      insight: "Bruce Henderson and Daniel Cooper are both Pro plan users representing $158/mo in at-risk revenue. Bruce has been inactive for 71 days and may already be lost. Daniel at 45 days is still recoverable with a timely outreach.",
      actions: ["Send Re-engagement Campaign", "Offer 20% Retention Discount", "Schedule Personal Follow-up"],
      chartBars: [
        { label: "Bruce H.", value: 71, max: 80 },
        { label: "Craig W.", value: 54, max: 80 },
        { label: "Daniel C.", value: 45, max: 80 },
        { label: "Tom B.", value: 37, max: 80 },
        { label: "Steve G.", value: 17, max: 80 },
      ],
    },
  },
  "Which customers have the largest herds?": {
    text: "Here are the top 8 customers by herd size. Large-herd customers tend to be on Enterprise or Pro plans and are your highest-value accounts.",
    data: {
      table: {
        headers: ["Customer", "Farm", "Herd Size", "Plan", "Revenue"],
        rows: [
          ["Amanda Scott", "Scott Property Group", "1,450 head", "Enterprise", "$199/mo"],
          ["Sarah Williams", "Willow Creek Station", "1,200 head", "Enterprise", "$199/mo"],
          ["Fiona Burke", "Burke Station", "980 head", "Enterprise", "$199/mo"],
          ["Dave O'Brien", "O'Brien Pastures", "890 head", "Enterprise", "$199/mo"],
          ["Bruce Henderson", "Henderson Cattle", "560 head", "Pro", "$79/mo"],
          ["Tanya Morris", "Morris Stud Farm", "520 head", "Pro", "$79/mo"],
          ["Jack McPherson", "McPherson Cattle Co", "450 head", "Pro", "$79/mo"],
          ["Lisa Nguyen", "Riverview Angus", "410 head", "Pro", "$79/mo"],
        ],
      },
      insight: "Your top 4 customers by herd size are all on Enterprise plans, validating the correlation between operation size and plan tier. Bruce Henderson has 560 head but recently churned -- this is a high-value recovery target.",
      actions: ["Export Top Customers List", "Send VIP Newsletter", "Schedule Account Reviews"],
      chartBars: [
        { label: "Scott", value: 1450, max: 1500 },
        { label: "Williams", value: 1200, max: 1500 },
        { label: "Burke", value: 980, max: 1500 },
        { label: "O'Brien", value: 890, max: 1500 },
        { label: "Henderson", value: 560, max: 1500 },
        { label: "Morris", value: 520, max: 1500 },
        { label: "McPherson", value: 450, max: 1500 },
        { label: "Nguyen", value: 410, max: 1500 },
      ],
    },
  },
  "Show customers on trial that expire this week": {
    text: "There are 4 customers currently on trial. Based on their join dates, 2 trials are expiring within the next 7 days. These prospects show strong engagement and are likely to convert.",
    data: {
      table: {
        headers: ["Customer", "Farm", "Started", "Herd Size", "Activity Score"],
        rows: [
          ["James Whitfield", "Whitfield Station", "15 Mar 2026", "310 head", "High"],
          ["Shane Kelly", "Kelly Angus Stud", "18 Mar 2026", "260 head", "Medium"],
          ["Ryan Mitchell", "Mitchell Grazing Co", "20 Mar 2026", "220 head", "High"],
          ["Helen Park", "Parkland Grazing", "22 Mar 2026", "175 head", "Medium"],
        ],
      },
      insight: "James Whitfield and Shane Kelly have trials expiring soonest. James has logged 52 records and 12 scan sessions in just 12 days -- a strong conversion signal. Recommend a personalised outreach with a Pro plan offer.",
      actions: ["Send Trial Expiry Reminder", "Offer First-Month Discount", "Schedule Demo Call"],
    },
  },
  "Which customers use the scanner feature most?": {
    text: "Scanner feature adoption is strong among Pro and Enterprise users. Here are the top scanner users ranked by total scan sessions.",
    data: {
      table: {
        headers: ["Customer", "Plan", "Scan Sessions", "Herd Size", "Scans/Head"],
        rows: [
          ["Amanda Scott", "Enterprise", "410 sessions", "1,450 head", "0.28"],
          ["Sarah Williams", "Enterprise", "380 sessions", "1,200 head", "0.32"],
          ["Fiona Burke", "Enterprise", "310 sessions", "980 head", "0.32"],
          ["Dave O'Brien", "Enterprise", "245 sessions", "890 head", "0.28"],
          ["Bruce Henderson", "Pro (Churned)", "178 sessions", "560 head", "0.32"],
        ],
      },
      insight: "Scanner usage correlates strongly with Enterprise plan adoption and retention. All top 4 active scanner users are Enterprise customers. This feature is a key differentiator for upselling.",
      actions: ["Promote Scanner to Starter Users", "Create Scanner Tutorial Campaign"],
      chartBars: [
        { label: "Scott", value: 410, max: 450 },
        { label: "Williams", value: 380, max: 450 },
        { label: "Burke", value: 310, max: 450 },
        { label: "O'Brien", value: 245, max: 450 },
        { label: "Henderson", value: 178, max: 450 },
      ],
    },
  },
  "What's our monthly churn rate?": {
    text: "Your current monthly churn rate is 2.1%, which is below the industry average of 3-5% for agricultural SaaS. However, there's been a slight uptick in the last quarter.",
    data: {
      insight: "3 customers churned in the last 90 days (Bruce Henderson, Craig Watson, Daniel Cooper), representing $158/mo in lost revenue. The primary churn driver appears to be lack of engagement -- all three had declining login frequency before churning.",
      actions: ["View Churn Analysis Report", "Set Up Automated Churn Alerts", "Review At-Risk Accounts"],
      chartBars: [
        { label: "Oct", value: 1.2, max: 5 },
        { label: "Nov", value: 0.8, max: 5 },
        { label: "Dec", value: 1.5, max: 5 },
        { label: "Jan", value: 2.0, max: 5 },
        { label: "Feb", value: 1.8, max: 5 },
        { label: "Mar", value: 2.1, max: 5 },
      ],
      sparkline: [1.2, 0.8, 1.5, 2.0, 1.8, 2.1],
    },
  },
  "Show customers by subscription tier": {
    text: "Here's the breakdown of your 247 customers across subscription tiers. Pro plan is the most popular paid tier, accounting for 45% of revenue.",
    data: {
      table: {
        headers: ["Plan", "Customers", "% of Total", "Monthly Revenue", "Avg Herd Size"],
        rows: [
          ["Enterprise", "24 customers", "9.7%", "$4,776/mo", "1,130 head"],
          ["Pro", "112 customers", "45.3%", "$8,848/mo", "395 head"],
          ["Starter", "53 customers", "21.5%", "$1,537/mo", "130 head"],
          ["Free", "25 customers", "10.1%", "$0/mo", "42 head"],
          ["Trial", "33 customers", "13.4%", "$0/mo", "240 head"],
        ],
      },
      insight: "Your Pro tier is the revenue engine at $8,848/mo (46.7% of total). There are 53 Starter customers who could be upsell targets. On average, customers upgrade to Pro once their herd exceeds 250 head.",
      actions: ["View Upgrade Funnel", "Launch Upsell Campaign for Starter Users"],
      chartBars: [
        { label: "Enterprise", value: 24, max: 120 },
        { label: "Pro", value: 112, max: 120 },
        { label: "Starter", value: 53, max: 120 },
        { label: "Free", value: 25, max: 120 },
        { label: "Trial", value: 33, max: 120 },
      ],
    },
  },
  "Which customers are most likely to upgrade?": {
    text: "Based on usage patterns, herd size, and feature adoption, I've identified 5 Starter customers with the highest upgrade probability to Pro.",
    data: {
      table: {
        headers: ["Customer", "Plan", "Herd Size", "Usage Score", "Upgrade Probability"],
        rows: [
          ["Mark Thompson", "Starter", "160 head", "85/100", "92%"],
          ["Tom Bradley", "Starter", "180 head", "72/100", "84%"],
          ["Rebecca Lewis", "Starter", "120 head", "68/100", "76%"],
          ["Jenny Fraser", "Starter", "150 head", "61/100", "71%"],
          ["Luke Dawson", "Starter", "85 head", "54/100", "58%"],
        ],
      },
      insight: "Mark Thompson is the strongest upgrade candidate. He has 160 head, 30 weigh-ins, and uses the scanner feature -- all indicators that he's outgrowing Starter. His usage pattern mirrors typical Pro users 2 weeks before upgrading.",
      actions: ["Send Personalised Upgrade Offers", "Enable Pro Trial Features", "Schedule Upgrade Demos"],
    },
  },
  "Revenue forecast for next quarter": {
    text: "Based on current growth trends, trial conversion rates, and churn patterns, here's the Q2 2026 revenue forecast.",
    data: {
      table: {
        headers: ["Metric", "Current (March)", "April (Est)", "May (Est)", "June (Est)"],
        rows: [
          ["MRR", "$18,940", "$19,820", "$20,650", "$21,400"],
          ["New Customers", "12", "14", "15", "16"],
          ["Churned", "3", "2", "2", "3"],
          ["Net Growth", "9", "12", "13", "13"],
          ["Trial Conversions", "8", "10", "11", "12"],
        ],
      },
      insight: "Projected Q2 revenue: $61,870 (+13.2% QoQ). Key growth drivers are improving trial conversion rates (now 65%) and the upcoming scanner feature update. Biggest risk is seasonal churn during winter months (June).",
      actions: ["Export Forecast Report", "Set Revenue Targets", "Plan Q2 Marketing Budget"],
      chartBars: [
        { label: "Mar", value: 18940, max: 22000 },
        { label: "Apr", value: 19820, max: 22000 },
        { label: "May", value: 20650, max: 22000 },
        { label: "Jun", value: 21400, max: 22000 },
      ],
    },
  },
  "Most active users this month": {
    text: "Here are the most active users in March 2026, ranked by total sessions and feature usage.",
    data: {
      table: {
        headers: ["Customer", "Sessions", "Records Added", "Scan Sessions", "Features Used"],
        rows: [
          ["Amanda Scott", "42 sessions", "180 records", "35 scans", "6/6"],
          ["Sarah Williams", "38 sessions", "165 records", "28 scans", "6/6"],
          ["Dave O'Brien", "35 sessions", "142 records", "24 scans", "6/6"],
          ["Fiona Burke", "33 sessions", "128 records", "22 scans", "6/6"],
          ["Jack McPherson", "28 sessions", "95 records", "18 scans", "6/6"],
        ],
      },
      insight: "Your power users are all Enterprise or Pro customers using all 6 features. Amanda Scott is your most engaged customer with 42 sessions this month. Consider featuring these users in case studies or referral programs.",
      actions: ["Invite to Beta Program", "Request Testimonials", "Offer Referral Incentives"],
    },
  },
  "Which features are most/least used?": {
    text: "Feature adoption varies significantly across your customer base. Here's the breakdown by active users.",
    data: {
      table: {
        headers: ["Feature", "Active Users", "Adoption Rate", "Avg Sessions/User", "Trend"],
        rows: [
          ["Medical Records", "210 users", "85.0%", "12.4/mo", "Stable"],
          ["Maps & Paddocks", "178 users", "72.1%", "8.2/mo", "Growing"],
          ["Scanner", "156 users", "63.2%", "15.8/mo", "Growing"],
          ["Reports", "134 users", "54.3%", "4.6/mo", "Stable"],
          ["Climate", "112 users", "45.3%", "6.1/mo", "Growing"],
          ["AI Advisor", "89 users", "36.0%", "3.2/mo", "New"],
        ],
      },
      insight: "Medical Records is the core feature (85% adoption). Scanner has the highest sessions-per-user (15.8/mo), suggesting it's highly valued by those who use it. AI Advisor has the lowest adoption at 36% -- consider in-app prompts to drive awareness.",
      actions: ["Create Feature Adoption Campaign", "Add In-App Tooltips for AI Advisor", "Survey Low-Adoption Users"],
      chartBars: [
        { label: "Medical", value: 85, max: 100 },
        { label: "Maps", value: 72, max: 100 },
        { label: "Scanner", value: 63, max: 100 },
        { label: "Reports", value: 54, max: 100 },
        { label: "Climate", value: 45, max: 100 },
        { label: "AI", value: 36, max: 100 },
      ],
    },
  },
  "Average session duration by plan type": {
    text: "Session duration increases significantly with plan tier, indicating deeper engagement from higher-tier customers.",
    data: {
      table: {
        headers: ["Plan", "Avg Session", "Sessions/Month", "Total Time/Month", "Top Feature"],
        rows: [
          ["Enterprise", "18.5 min", "32 sessions", "9.9 hrs", "Scanner"],
          ["Pro", "14.2 min", "22 sessions", "5.2 hrs", "Medical"],
          ["Starter", "8.6 min", "12 sessions", "1.7 hrs", "Medical"],
          ["Free", "4.1 min", "4 sessions", "0.3 hrs", "Records"],
          ["Trial", "12.8 min", "18 sessions", "3.8 hrs", "Scanner"],
        ],
      },
      insight: "Trial users show engagement levels close to Pro users (12.8 vs 14.2 min/session), indicating strong product-market fit during trials. Free users average only 4.1 minutes -- these accounts may not see enough value to convert.",
      actions: ["Improve Free Tier Onboarding", "Add Engagement Triggers for Short Sessions"],
      chartBars: [
        { label: "Enterprise", value: 18.5, max: 20 },
        { label: "Pro", value: 14.2, max: 20 },
        { label: "Starter", value: 8.6, max: 20 },
        { label: "Free", value: 4.1, max: 20 },
        { label: "Trial", value: 12.8, max: 20 },
      ],
    },
  },
  "Customers who haven't recorded a weigh-in this month": {
    text: "I found 8 customers who haven't recorded any weigh-in this month. This could indicate disengagement or seasonal factors.",
    data: {
      table: {
        headers: ["Customer", "Plan", "Last Weigh-in", "Total Weigh-ins", "Herd Size"],
        rows: [
          ["Bruce Henderson", "Pro (Churned)", "12 Jan 2026", "112", "560 head"],
          ["Craig Watson", "Free (Churned)", "28 Jan 2026", "4", "45 head"],
          ["Daniel Cooper", "Pro (Churned)", "5 Feb 2026", "45", "290 head"],
          ["Steve Grant", "Free", "2 Mar 2026", "3", "35 head"],
          ["Michelle Torres", "Starter", "28 Feb 2026", "18", "95 head"],
        ],
      },
      insight: "3 of these customers have already churned, confirming that weigh-in inactivity is a leading churn indicator. Michelle Torres (Starter, 95 head) is still active but at risk -- her last weigh-in was 27 days ago.",
      actions: ["Send Weigh-in Reminder Email", "Enable Push Notifications", "Set Up Inactivity Alerts"],
    },
  },
};

// ─── Utility ─────────────────────────────────────────────────────────
function getStatusVariant(status: Customer["status"]): "success" | "info" | "danger" | "warning" {
  switch (status) {
    case "Active": return "success";
    case "Trial": return "info";
    case "Churned": return "danger";
    case "Overdue": return "warning";
  }
}

function getPlanColor(plan: Customer["plan"]): string {
  switch (plan) {
    case "Free": return "text-white/50";
    case "Starter": return "text-blue-300";
    case "Pro": return "text-emerald-300";
    case "Enterprise": return "text-amber-300";
    case "Trial": return "text-purple-300";
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Pie Chart Component ─────────────────────────────────────────────
function SegmentPieChart() {
  const segments = [
    { label: "Active Pro", pct: 45, color: "#34d399" },
    { label: "Active Starter", pct: 25, color: "#60a5fa" },
    { label: "Trial", pct: 15, color: "#a78bfa" },
    { label: "Free", pct: 10, color: "#fbbf24" },
    { label: "Churned", pct: 5, color: "#f87171" },
  ];

  let cumulative = 0;
  const paths = segments.map((seg) => {
    const startAngle = (cumulative / 100) * 360;
    cumulative += seg.pct;
    const endAngle = (cumulative / 100) * 360;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);

    const largeArc = seg.pct > 50 ? 1 : 0;

    return (
      <path
        key={seg.label}
        d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={seg.color}
        opacity={0.85}
        className="transition-opacity duration-200 hover:opacity-100"
      />
    );
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-48 h-48 shrink-0">
        {paths}
        <circle cx="100" cy="100" r="40" fill="rgba(0,0,30,0.6)" />
        <text x="100" y="95" textAnchor="middle" className="fill-white text-lg font-bold" fontSize="16">247</text>
        <text x="100" y="112" textAnchor="middle" className="fill-white/50" fontSize="10">customers</text>
      </svg>
      <div className="flex flex-col gap-2 min-w-0">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-white/80 whitespace-nowrap">{seg.label}</span>
            <span className="text-sm font-semibold text-white ml-auto">{seg.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Usage Heatmap Component ─────────────────────────────────────────
function UsageHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Mock data: peak 5-8am and 4-6pm (farmer schedule)
  const getIntensity = (day: number, hour: number): number => {
    const isSunday = day === 6;
    const isSaturday = day === 5;
    const weekend = isSaturday || isSunday;

    // Early morning peak (5-8am)
    if (hour >= 5 && hour <= 7) return weekend ? 0.4 : 0.9 - (day === 2 ? 0 : 0.05 * Math.abs(day - 2));
    if (hour === 8) return weekend ? 0.3 : 0.6;
    // Mid-day moderate
    if (hour >= 9 && hour <= 11) return weekend ? 0.15 : 0.35;
    if (hour >= 12 && hour <= 14) return weekend ? 0.1 : 0.25;
    // Afternoon peak (4-6pm)
    if (hour >= 16 && hour <= 18) return weekend ? 0.3 : 0.8 - (day === 3 ? 0 : 0.03 * Math.abs(day - 3));
    if (hour === 15 || hour === 19) return weekend ? 0.2 : 0.45;
    // Evening
    if (hour >= 20 && hour <= 21) return weekend ? 0.15 : 0.3;
    // Night (low)
    return weekend ? 0.02 : 0.05;
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center text-[9px] text-white/40">
              {h % 3 === 0 ? `${h.toString().padStart(2, "0")}` : ""}
            </div>
          ))}
        </div>
        {/* Grid */}
        {days.map((day, di) => (
          <div key={day} className="flex items-center gap-1 mb-1">
            <span className="w-8 text-right text-xs text-white/50 shrink-0">{day}</span>
            <div className="flex flex-1 gap-[2px]">
              {hours.map((h) => {
                const intensity = getIntensity(di, h);
                return (
                  <div
                    key={h}
                    className="flex-1 h-5 rounded-sm transition-colors"
                    style={{
                      backgroundColor: intensity > 0.7
                        ? `rgba(52, 211, 153, ${intensity})`
                        : intensity > 0.4
                          ? `rgba(96, 165, 250, ${intensity})`
                          : intensity > 0.15
                            ? `rgba(148, 163, 184, ${intensity})`
                            : `rgba(148, 163, 184, ${Math.max(0.05, intensity)})`,
                    }}
                    title={`${day} ${h.toString().padStart(2, "0")}:00 — ${Math.round(intensity * 100)}% activity`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center gap-2 ml-10 mt-3">
          <span className="text-xs text-white/40">Less</span>
          {[0.05, 0.2, 0.4, 0.7, 0.9].map((v) => (
            <div
              key={v}
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor: v > 0.7
                  ? `rgba(52, 211, 153, ${v})`
                  : v > 0.4
                    ? `rgba(96, 165, 250, ${v})`
                    : `rgba(148, 163, 184, ${v})`,
              }}
            />
          ))}
          <span className="text-xs text-white/40">More</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sparkline Component ─────────────────────────────────────────────
function Sparkline({ data, className = "" }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-[120px] h-8 ${className}`}>
      <polyline points={points} fill="none" stroke="rgba(96,165,250,0.8)" strokeWidth="2" />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={(i / (data.length - 1)) * w}
          cy={h - ((v - min) / range) * (h - 4) - 2}
          r="2.5"
          fill="rgba(96,165,250,1)"
        />
      ))}
    </svg>
  );
}

// ─── Inline Bar Chart Component ──────────────────────────────────────
function InlineBars({ bars }: { bars: AIResponseData["chartBars"] }) {
  if (!bars) return null;
  return (
    <div className="space-y-2 mt-3">
      {bars.map((bar) => (
        <div key={bar.label} className="flex items-center gap-3">
          <span className="text-xs text-white/60 w-20 text-right shrink-0 truncate">{bar.label}</span>
          <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500/60 to-emerald-500/60 transition-all duration-700"
              style={{ width: `${Math.round((bar.value / bar.max) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-white/80 w-14 text-right shrink-0">{typeof bar.value === "number" && bar.value % 1 !== 0 ? bar.value.toFixed(1) : bar.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Customer Detail Card ────────────────────────────────────────────
function CustomerDetailCard({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const featureList = Object.entries(customer.features);
  const activeFeatures = featureList.filter(([, v]) => v).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-lg p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{customer.name}</h3>
            <p className="text-sm text-white/50">{customer.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-white/40 mb-0.5">Farm</p>
            <p className="text-sm text-white">{customer.farmName}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Location</p>
            <p className="text-sm text-white">{customer.location}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Plan</p>
            <p className={`text-sm font-semibold ${getPlanColor(customer.plan)}`}>{customer.plan}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Status</p>
            <GlassBadge variant={getStatusVariant(customer.status)}>{customer.status}</GlassBadge>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Herd Size</p>
            <p className="text-sm text-white font-semibold">{customer.herdSize.toLocaleString()} head</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Monthly Revenue</p>
            <p className="text-sm text-white font-semibold">${customer.monthlyRevenue}/mo</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Last Login</p>
            <p className="text-sm text-white">{formatDate(customer.lastLogin)}</p>
          </div>
          <div>
            <p className="text-xs text-white/40 mb-0.5">Joined</p>
            <p className="text-sm text-white">{formatDate(customer.joinDate)}</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 mb-4">
          <p className="text-xs text-white/40 mb-2">Activity</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-lg font-bold text-white">{customer.totalRecords.toLocaleString()}</p>
              <p className="text-[10px] text-white/40">Records</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-lg font-bold text-white">{customer.weighIns}</p>
              <p className="text-[10px] text-white/40">Weigh-ins</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-white/5">
              <p className="text-lg font-bold text-white">{customer.scanSessions}</p>
              <p className="text-[10px] text-white/40">Scans</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs text-white/40 mb-2">Features ({activeFeatures}/6 active)</p>
          <div className="flex flex-wrap gap-2">
            {featureList.map(([key, active]) => (
              <span
                key={key}
                className={`text-xs px-2 py-1 rounded-lg ${active ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/30"}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────
export default function AdminCustomersPage() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Handle sending a query
  const handleSendQuery = useCallback(
    (query: string) => {
      if (!query.trim() || isThinking) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: query.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsThinking(true);

      // Simulate AI thinking delay
      const delay = 1200 + Math.random() * 800;
      setTimeout(() => {
        // Find matching response or generate generic one
        const matchKey = Object.keys(aiResponses).find(
          (k) => k.toLowerCase() === query.trim().toLowerCase()
        );

        let responseText: string;
        let responseData: AIResponseData | undefined;

        if (matchKey) {
          const resp = aiResponses[matchKey];
          responseText = resp.text;
          responseData = resp.data;
        } else {
          // Generic intelligent response
          responseText = `I've analysed your query: "${query.trim()}". Based on the current data across 247 customers, here's what I found:\n\nYour customer base shows healthy engagement overall, with 76.5% on active subscriptions. Pro plan customers show the highest feature adoption rate at 89%. I'd recommend focusing on trial conversion and Starter-to-Pro upgrades for maximum revenue growth.`;
          responseData = {
            insight: "For more specific insights, try asking about customer segments, revenue metrics, feature adoption, or individual customer behaviour.",
            actions: ["View All Customers", "Export Customer Report"],
            chartBars: [
              { label: "Active", value: 189, max: 250 },
              { label: "Trial", value: 33, max: 250 },
              { label: "Free", value: 25, max: 250 },
              { label: "Churned", value: 12, max: 250 },
            ],
          };
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
          data: responseData,
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsThinking(false);
      }, delay);
    },
    [isThinking]
  );

  // Sort + filter customers
  const filteredCustomers = useMemo(() => {
    let result = [...mockCustomers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.farmName.toLowerCase().includes(q)
      );
    }
    if (planFilter) result = result.filter((c) => c.plan === planFilter);
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);

    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [searchQuery, planFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-white/20" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-300" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-300" />
    );
  };

  // Pre-built query categories
  const queryCategories = [
    {
      title: "Customer Segments",
      icon: Users,
      queries: [
        "Show me customers who haven't logged in for 30+ days",
        "Which customers have the largest herds?",
        "Show customers on trial that expire this week",
        "Which customers use the scanner feature most?",
      ],
    },
    {
      title: "Revenue & Billing",
      icon: DollarSign,
      queries: [
        "What's our monthly churn rate?",
        "Show customers by subscription tier",
        "Which customers are most likely to upgrade?",
        "Revenue forecast for next quarter",
      ],
    },
    {
      title: "Usage & Engagement",
      icon: Activity,
      queries: [
        "Most active users this month",
        "Which features are most/least used?",
        "Average session duration by plan type",
        "Customers who haven't recorded a weigh-in this month",
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Page Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-white mb-1">Customer Intelligence</h1>
        <p className="text-white/50 text-sm">AI-powered insights into your customer base</p>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: "247", sub: "+12 this month", icon: Users, color: "text-blue-300", bg: "bg-blue-500/20" },
          { label: "Active Subscriptions", value: "189", sub: "76.5% of total", icon: CreditCard, color: "text-emerald-300", bg: "bg-emerald-500/20" },
          { label: "Monthly Revenue", value: "$18,940", sub: "+8.3% MoM", icon: DollarSign, color: "text-amber-300", bg: "bg-amber-500/20" },
          { label: "Avg Herd Size", value: "285", sub: "head per customer", icon: BarChart3, color: "text-purple-300", bg: "bg-purple-500/20" },
        ].map((stat, i) => (
          <GlassCard key={stat.label} className={`animate-fade-in-up`} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/50 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1 flex items-center gap-1">
                  {stat.sub.startsWith("+") && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                  {stat.sub}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* ── AI Query Interface ────────────────────────────────────── */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "320ms" }} padding="none">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-lg font-semibold text-white">AI Customer Query</h2>
          </div>
          <p className="text-xs text-white/40">Ask anything about your customers, revenue, or engagement</p>
        </div>

        {/* Pre-built query buttons */}
        {messages.length === 0 && (
          <div className="p-5 space-y-5">
            {queryCategories.map((cat) => (
              <div key={cat.title}>
                <div className="flex items-center gap-2 mb-2.5">
                  <cat.icon className="w-4 h-4 text-white/40" />
                  <span className="text-sm font-medium text-white/60">{cat.title}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.queries.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSendQuery(q)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0 mr-3 mt-1">
                    <Bot className="w-4 h-4 text-blue-300" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-blue-600/30 border border-blue-400/20 text-white"
                      : "bg-white/5 border border-white/10 text-white/90"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>

                  {/* Data Table */}
                  {msg.data?.table && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            {msg.data.table.headers.map((h) => (
                              <th key={h} className="text-left py-2 px-2 text-white/50 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.data.table.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-white/5">
                              {row.map((cell, ci) => (
                                <td key={ci} className="py-2 px-2 text-white/80">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Chart Bars */}
                  {msg.data?.chartBars && <InlineBars bars={msg.data.chartBars} />}

                  {/* Sparkline */}
                  {msg.data?.sparkline && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-white/40">Trend:</span>
                      <Sparkline data={msg.data.sparkline} />
                    </div>
                  )}

                  {/* Insight */}
                  {msg.data?.insight && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-400/20">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-200/80 leading-relaxed">{msg.data.insight}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {msg.data?.actions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.data.actions.map((action) => (
                        <button
                          key={action}
                          className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/20 text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-1.5"
                        >
                          {action.includes("Email") || action.includes("Campaign") || action.includes("Send") ? (
                            <Mail className="w-3 h-3" />
                          ) : action.includes("Export") || action.includes("Report") ? (
                            <BarChart3 className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {action}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-white/25 mt-2">
                    {msg.timestamp.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center shrink-0 mr-3">
                  <Bot className="w-4 h-4 text-blue-300" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-300 animate-spin" />
                  <span className="text-sm text-white/50">Analysing customer data...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}

        {/* Input bar */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendQuery(inputValue);
                  }
                }}
                placeholder="Ask about your customers..."
                className="glass-input w-full text-sm"
                disabled={isThinking}
              />
            </div>
            <GlassButton
              variant="primary"
              size="md"
              onClick={() => handleSendQuery(inputValue)}
              disabled={!inputValue.trim() || isThinking}
              icon={<Send className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Ask</span>
            </GlassButton>
          </div>

          {/* Quick queries when chat has messages */}
          {messages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-white/30 self-center mr-1">Quick:</span>
              {[
                "Show customers by subscription tier",
                "Which customers are most likely to upgrade?",
                "What's our monthly churn rate?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendQuery(q)}
                  disabled={isThinking}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors disabled:opacity-30"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Customer Table ─────────────────────────────────────────── */}
      <GlassCard className="animate-fade-in-up" style={{ animationDelay: "400ms" }} padding="none">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-300" />
              <h2 className="text-lg font-semibold text-white">Customer Directory</h2>
              <GlassBadge variant="default">{filteredCustomers.length}</GlassBadge>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or farm..."
                className="glass-input w-full pl-10 text-sm"
              />
            </div>
            <GlassSelect
              options={[
                { value: "Free", label: "Free" },
                { value: "Starter", label: "Starter" },
                { value: "Pro", label: "Pro" },
                { value: "Enterprise", label: "Enterprise" },
                { value: "Trial", label: "Trial" },
              ]}
              placeholder="All Plans"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="sm:w-40"
            />
            <GlassSelect
              options={[
                { value: "Active", label: "Active" },
                { value: "Trial", label: "Trial" },
                { value: "Churned", label: "Churned" },
                { value: "Overdue", label: "Overdue" },
              ]}
              placeholder="All Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="sm:w-40"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {([
                  ["name", "Name"],
                  ["farmName", "Farm"],
                  ["location", "Location"],
                  ["plan", "Plan"],
                  ["herdSize", "Herd Size"],
                  ["monthlyRevenue", "Revenue"],
                  ["lastLogin", "Last Login"],
                  ["status", "Status"],
                ] as [SortField, string][]).map(([field, label]) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="text-left py-3 px-4 text-xs font-medium text-white/50 cursor-pointer hover:text-white/80 transition-colors select-none"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-white">{customer.name}</p>
                      <p className="text-xs text-white/40">{customer.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-white/70 hidden sm:table-cell">{customer.farmName}</td>
                  <td className="py-3 px-4 text-white/60 hidden md:table-cell">{customer.location}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${getPlanColor(customer.plan)}`}>{customer.plan}</span>
                  </td>
                  <td className="py-3 px-4 text-white/70 hidden lg:table-cell">{customer.herdSize.toLocaleString()}</td>
                  <td className="py-3 px-4 text-white/70 hidden lg:table-cell">
                    {customer.monthlyRevenue > 0 ? `$${customer.monthlyRevenue}` : "--"}
                  </td>
                  <td className="py-3 px-4 text-white/60 hidden md:table-cell">{formatDate(customer.lastLogin)}</td>
                  <td className="py-3 px-4">
                    <GlassBadge variant={getStatusVariant(customer.status)}>{customer.status}</GlassBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="p-12 text-center">
              <Search className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">No customers match your search</p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ── Bottom Row: Pie Chart + Heatmap ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "480ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-semibold text-white">Customer Segments</h2>
          </div>
          <SegmentPieChart />
        </GlassCard>

        {/* Heatmap */}
        <GlassCard className="animate-fade-in-up" style={{ animationDelay: "560ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3 className="w-5 h-5 text-blue-300" />
            <h2 className="text-lg font-semibold text-white">Usage Heatmap</h2>
            <span className="text-xs text-white/30 ml-auto">Last 7 days</span>
          </div>
          <UsageHeatmap />
        </GlassCard>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailCard customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}
