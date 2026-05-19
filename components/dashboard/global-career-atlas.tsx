"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  Globe,
  MapPin,
  List,
  Map as MapIcon,
  Filter,
  X,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  DollarSign,
  Shield,
  Wifi,
  TrendingUp,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  Layers,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  GitCompareArrows,
  Sparkles,
  Building2,
  GraduationCap,
  Lightbulb,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PersonalizedHub,
  AtlasRegion,
  WorkMode,
  MobilityDifficulty,
} from "@/lib/types";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ── Helpers ──

function matchColor(score: number): string {
  if (score >= 80) return "#2d8a4e";
  if (score >= 65) return "#d4a017";
  return "#e17055";
}

function matchLabel(score: number): string {
  if (score >= 80) return "Strong match";
  if (score >= 65) return "Good potential";
  return "Worth exploring";
}

function markerRadius(score: number): number {
  if (score >= 80) return 8;
  if (score >= 65) return 6;
  return 5;
}

const regionColors: Record<AtlasRegion, string> = {
  "Southeast Asia": "#4164b4",
  "East Asia": "#6783c3",
  "Middle East": "#d4a017",
  Europe: "#2d8a4e",
  "North America": "#e17055",
  Oceania: "#8b5cf6",
};

const allRegions: AtlasRegion[] = [
  "Southeast Asia",
  "East Asia",
  "Middle East",
  "Europe",
  "North America",
  "Oceania",
];
const allWorkModes: WorkMode[] = ["Remote", "Hybrid", "On-site"];
const allMobility: MobilityDifficulty[] = ["Low", "Medium", "High"];

// ── Main Component ──

interface GlobalCareerAtlasProps {
  hubs: PersonalizedHub[];
}

export function GlobalCareerAtlas({ hubs }: GlobalCareerAtlasProps) {
  // View & UI state
  const [view, setView] = useState<"map" | "list">("map");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHub, setSelectedHub] = useState<PersonalizedHub | null>(null);
  const [savedCities, setSavedCities] = useState<Set<string>>(new Set());
  const [compareCities, setCompareCities] = useState<PersonalizedHub[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Filters
  const [filterRegion, setFilterRegion] = useState<AtlasRegion | "all">("all");
  const [filterWorkMode, setFilterWorkMode] = useState<WorkMode | "all">(
    "all"
  );
  const [filterMobility, setFilterMobility] = useState<
    MobilityDifficulty | "all"
  >("all");
  const [filterMinMatch, setFilterMinMatch] = useState(0);

  const filteredHubs = useMemo(() => {
    return hubs.filter((h) => {
      if (filterRegion !== "all" && h.region !== filterRegion) return false;
      if (filterWorkMode !== "all" && !h.workModes.includes(filterWorkMode))
        return false;
      if (filterMobility !== "all" && h.mobilityDifficulty !== filterMobility)
        return false;
      if (h.matchScore < filterMinMatch) return false;
      return true;
    });
  }, [hubs, filterRegion, filterWorkMode, filterMobility, filterMinMatch]);

  const toggleSave = useCallback((id: string) => {
    setSavedCities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleCompare = useCallback(
    (hub: PersonalizedHub) => {
      setCompareCities((prev) => {
        const exists = prev.find((c) => c.id === hub.id);
        if (exists) return prev.filter((c) => c.id !== hub.id);
        if (prev.length >= 3) return prev;
        return [...prev, hub];
      });
    },
    []
  );

  const clearFilters = () => {
    setFilterRegion("all");
    setFilterWorkMode("all");
    setFilterMobility("all");
    setFilterMinMatch(0);
  };

  const hasActiveFilters =
    filterRegion !== "all" ||
    filterWorkMode !== "all" ||
    filterMobility !== "all" ||
    filterMinMatch > 0;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-navy-600 to-gold-500 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-navy-900">
              Global Career Atlas
            </h3>
            <p className="text-xs text-navy-500">
              {filteredHubs.length} career hubs worldwide based on your profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare button */}
          {compareCities.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompare(true)}
              className="text-xs"
            >
              <GitCompareArrows className="w-3.5 h-3.5 mr-1" />
              Compare ({compareCities.length})
            </Button>
          )}

          {/* Saved count */}
          {savedCities.size > 0 && (
            <Badge variant="secondary" className="text-xs">
              <BookmarkCheck className="w-3 h-3 mr-1" />
              {savedCities.size} saved
            </Badge>
          )}

          {/* Filter toggle */}
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs"
          >
            <Filter className="w-3.5 h-3.5 mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">
                !
              </span>
            )}
          </Button>

          {/* View toggle */}
          <div className="flex rounded-lg border border-navy-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setView("map")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "map"
                  ? "bg-navy-700 text-white"
                  : "bg-white text-navy-600 hover:bg-navy-50"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5 inline mr-1" />
              Map
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "list"
                  ? "bg-navy-700 text-white"
                  : "bg-white text-navy-600 hover:bg-navy-50"
              }`}
            >
              <List className="w-3.5 h-3.5 inline mr-1" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-navy-800">
                    Filter Career Hubs
                  </span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-navy-500 hover:text-navy-700 underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Region */}
                  <div>
                    <label className="text-xs font-medium text-navy-600 mb-1 block">
                      Region
                    </label>
                    <select
                      value={filterRegion}
                      onChange={(e) =>
                        setFilterRegion(e.target.value as AtlasRegion | "all")
                      }
                      className="w-full text-xs px-2 py-1.5 rounded-md border border-navy-200 bg-white"
                      aria-label="Filter by region"
                    >
                      <option value="all">All Regions</option>
                      {allRegions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Work Mode */}
                  <div>
                    <label className="text-xs font-medium text-navy-600 mb-1 block">
                      Work Mode
                    </label>
                    <select
                      value={filterWorkMode}
                      onChange={(e) =>
                        setFilterWorkMode(e.target.value as WorkMode | "all")
                      }
                      className="w-full text-xs px-2 py-1.5 rounded-md border border-navy-200 bg-white"
                      aria-label="Filter by work mode"
                    >
                      <option value="all">All Modes</option>
                      {allWorkModes.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mobility */}
                  <div>
                    <label className="text-xs font-medium text-navy-600 mb-1 block">
                      Visa Difficulty
                    </label>
                    <select
                      value={filterMobility}
                      onChange={(e) =>
                        setFilterMobility(
                          e.target.value as MobilityDifficulty | "all"
                        )
                      }
                      className="w-full text-xs px-2 py-1.5 rounded-md border border-navy-200 bg-white"
                      aria-label="Filter by visa difficulty"
                    >
                      <option value="all">Any</option>
                      {allMobility.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min match */}
                  <div>
                    <label className="text-xs font-medium text-navy-600 mb-1 block">
                      Min Match: {filterMinMatch}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={90}
                      step={10}
                      value={filterMinMatch}
                      onChange={(e) =>
                        setFilterMinMatch(Number(e.target.value))
                      }
                      className="w-full accent-navy-600"
                      aria-label="Minimum match percentage"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      {view === "map" ? (
        <AtlasMapView
          hubs={filteredHubs}
          selectedHub={selectedHub}
          onSelectHub={setSelectedHub}
          savedCities={savedCities}
          onToggleSave={toggleSave}
          compareCities={compareCities}
          onToggleCompare={toggleCompare}
        />
      ) : (
        <AtlasListView
          hubs={filteredHubs}
          onSelectHub={setSelectedHub}
          savedCities={savedCities}
          onToggleSave={toggleSave}
          compareCities={compareCities}
          onToggleCompare={toggleCompare}
        />
      )}

      {/* City detail panel */}
      <AnimatePresence>
        {selectedHub && !showCompare && (
          <CityDetailPanel
            hub={selectedHub}
            onClose={() => setSelectedHub(null)}
            isSaved={savedCities.has(selectedHub.id)}
            onToggleSave={() => toggleSave(selectedHub.id)}
            isComparing={compareCities.some((c) => c.id === selectedHub.id)}
            onToggleCompare={() => toggleCompare(selectedHub)}
            compareCount={compareCities.length}
          />
        )}
      </AnimatePresence>

      {/* Compare panel */}
      <AnimatePresence>
        {showCompare && compareCities.length > 0 && (
          <ComparePanel
            cities={compareCities}
            onClose={() => setShowCompare(false)}
            onRemove={(id) =>
              setCompareCities((prev) => prev.filter((c) => c.id !== id))
            }
            savedCities={savedCities}
            onToggleSave={toggleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Map View ──

function AtlasMapView({
  hubs,
  selectedHub,
  onSelectHub,
  savedCities,
  onToggleSave,
  compareCities,
  onToggleCompare,
}: {
  hubs: PersonalizedHub[];
  selectedHub: PersonalizedHub | null;
  onSelectHub: (h: PersonalizedHub) => void;
  savedCities: Set<string>;
  onToggleSave: (id: string) => void;
  compareCities: PersonalizedHub[];
  onToggleCompare: (h: PersonalizedHub) => void;
}) {
  const [tooltipHub, setTooltipHub] = useState<PersonalizedHub | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="bg-gradient-to-br from-navy-50 via-beige-50 to-navy-50 relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 130,
              center: [50, 20],
            }}
            className="w-full"
            style={{ maxHeight: 520 }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e8edf5"
                      stroke="#c8d1e3"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#d9e0f0", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Thread lines connecting hubs */}
              {hubs.length > 1 &&
                hubs.slice(0, -1).map((hub, i) => {
                  const next = hubs[i + 1];
                  return (
                    <line
                      key={`thread-${hub.id}-${next.id}`}
                      x1={0}
                      y1={0}
                      x2={0}
                      y2={0}
                      stroke="#d4a017"
                      strokeWidth={0.3}
                      strokeOpacity={0.2}
                      strokeDasharray="4 4"
                    />
                  );
                })}

              {/* City markers */}
              {hubs.map((hub) => {
                const isSelected = selectedHub?.id === hub.id;
                const isComparing = compareCities.some(
                  (c) => c.id === hub.id
                );
                const r = markerRadius(hub.matchScore);

                return (
                  <Marker
                    key={hub.id}
                    coordinates={hub.coordinates}
                    onMouseEnter={() => setTooltipHub(hub)}
                    onMouseLeave={() => setTooltipHub(null)}
                    onClick={() => onSelectHub(hub)}
                    style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" }, pressed: {} }}
                  >
                    {/* Glow */}
                    <circle
                      r={r + 6}
                      fill={matchColor(hub.matchScore)}
                      fillOpacity={isSelected ? 0.25 : 0.1}
                    />
                    {/* Ring for comparing */}
                    {isComparing && (
                      <circle
                        r={r + 3}
                        fill="none"
                        stroke="#d4a017"
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                      />
                    )}
                    {/* Main dot */}
                    <circle
                      r={r}
                      fill={
                        isSelected ? "#d4a017" : matchColor(hub.matchScore)
                      }
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    {/* Score label */}
                    <text
                      textAnchor="middle"
                      y={-r - 6}
                      style={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: 8,
                        fontWeight: 600,
                        fill: "#273c6c",
                      }}
                    >
                      {hub.matchScore}%
                    </text>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          <AnimatePresence>
            {tooltipHub && !selectedHub && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/95 backdrop-blur border border-navy-100 rounded-lg shadow-lg px-4 py-3 pointer-events-none max-w-xs"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin
                    className="w-4 h-4"
                    style={{ color: matchColor(tooltipHub.matchScore) }}
                  />
                  <span className="font-semibold text-sm text-navy-900">
                    {tooltipHub.city}, {tooltipHub.country}
                  </span>
                  <Badge
                    variant={
                      tooltipHub.matchScore >= 80
                        ? "success"
                        : tooltipHub.matchScore >= 65
                          ? "warning"
                          : "outline"
                    }
                    className="text-[10px] ml-auto"
                  >
                    {tooltipHub.matchScore}% match
                  </Badge>
                </div>
                <p className="text-xs text-navy-500">{tooltipHub.hubType}</p>
                <p className="text-[10px] text-navy-400 mt-1">
                  Click to explore
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-lg border border-navy-100 p-2.5 text-[10px] space-y-1.5">
            <div className="font-medium text-navy-700 text-xs mb-1">
              Match Level
            </div>
            {[
              { color: "#2d8a4e", label: "Strong (80%+)" },
              { color: "#d4a017", label: "Good (65-79%)" },
              { color: "#e17055", label: "Exploring (<65%)" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-navy-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick-access city chips below map */}
        <div className="p-3 bg-white border-t border-navy-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] text-navy-400 flex-shrink-0 mr-1">
              Top matches:
            </span>
            {hubs.slice(0, 8).map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => onSelectHub(hub)}
                className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  selectedHub?.id === hub.id
                    ? "bg-navy-700 text-white border-navy-700"
                    : "bg-white text-navy-700 border-navy-200 hover:border-navy-400"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: matchColor(hub.matchScore) }}
                />
                {hub.city}
                <span className="text-[10px] opacity-70">
                  {hub.matchScore}%
                </span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── List View ──

function AtlasListView({
  hubs,
  onSelectHub,
  savedCities,
  onToggleSave,
  compareCities,
  onToggleCompare,
}: {
  hubs: PersonalizedHub[];
  onSelectHub: (h: PersonalizedHub) => void;
  savedCities: Set<string>;
  onToggleSave: (id: string) => void;
  compareCities: PersonalizedHub[];
  onToggleCompare: (h: PersonalizedHub) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {hubs.map((hub, i) => {
        const isSaved = savedCities.has(hub.id);
        const isComparing = compareCities.some((c) => c.id === hub.id);

        return (
          <motion.div
            key={hub.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div
                    className="flex items-start gap-3 flex-1"
                    onClick={() => onSelectHub(hub)}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: matchColor(hub.matchScore) + "15",
                      }}
                    >
                      <MapPin
                        className="w-5 h-5"
                        style={{ color: matchColor(hub.matchScore) }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-navy-900">
                          {hub.city}
                        </h4>
                        <span className="text-xs text-navy-400">
                          {hub.country}
                        </span>
                      </div>
                      <p className="text-xs text-navy-500 mt-0.5">
                        {hub.hubType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCompare(hub);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isComparing
                          ? "bg-gold-100 text-gold-700"
                          : "text-navy-300 hover:text-navy-600 hover:bg-navy-50"
                      }`}
                      title={isComparing ? "Remove from compare" : "Add to compare"}
                    >
                      <GitCompareArrows className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(hub.id);
                      }}
                      className={`p-1.5 rounded-md transition-colors ${
                        isSaved
                          ? "bg-gold-100 text-gold-700"
                          : "text-navy-300 hover:text-navy-600 hover:bg-navy-50"
                      }`}
                      title={isSaved ? "Remove from plan" : "Save to plan"}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Match bar */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="h-1.5 bg-navy-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: matchColor(hub.matchScore) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${hub.matchScore}%` }}
                        transition={{ duration: 0.6, delay: i * 0.04 }}
                      />
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{ color: matchColor(hub.matchScore) }}
                  >
                    {hub.matchScore}%
                  </span>
                </div>

                {/* Quick tags */}
                <div
                  className="flex flex-wrap gap-1"
                  onClick={() => onSelectHub(hub)}
                >
                  <Badge variant="outline" className="text-[10px]">
                    {hub.workModes[0]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    Visa: {hub.mobilityDifficulty}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {hub.matchingSkills.length} skills match
                  </Badge>
                  {hub.matchScore >= 80 && (
                    <Badge variant="success" className="text-[10px]">
                      Recommended
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── City Detail Panel ──

function CityDetailPanel({
  hub,
  onClose,
  isSaved,
  onToggleSave,
  isComparing,
  onToggleCompare,
  compareCount,
}: {
  hub: PersonalizedHub;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  isComparing: boolean;
  onToggleCompare: () => void;
  compareCount: number;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "skills" | "opportunities" | "actions"
  >("overview");

  const mobilityBadge: Record<
    MobilityDifficulty,
    "success" | "warning" | "danger"
  > = {
    Low: "success",
    Medium: "warning",
    High: "danger",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <Card className="mt-4 border-2" style={{ borderColor: matchColor(hub.matchScore) + "40" }}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${matchColor(hub.matchScore)}20, ${matchColor(hub.matchScore)}40)`,
                }}
              >
                <Globe
                  className="w-6 h-6"
                  style={{ color: matchColor(hub.matchScore) }}
                />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {hub.city}
                  <span className="text-sm font-normal text-navy-400">
                    {hub.country}
                  </span>
                </CardTitle>
                <p className="text-sm text-navy-500 mt-0.5">{hub.hubType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <div
                  className="text-2xl font-bold"
                  style={{ color: matchColor(hub.matchScore) }}
                >
                  {hub.matchScore}%
                </div>
                <div className="text-[10px] text-navy-400">
                  {matchLabel(hub.matchScore)}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-navy-50 text-navy-400"
                title="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm text-navy-600 mt-2 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
            {hub.tagline}
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={onToggleSave}
              className="text-xs"
            >
              {isSaved ? (
                <BookmarkCheck className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Bookmark className="w-3.5 h-3.5 mr-1" />
              )}
              {isSaved ? "Saved to Plan" : "Save to Plan"}
            </Button>
            <Button
              variant={isComparing ? "secondary" : "outline"}
              size="sm"
              onClick={onToggleCompare}
              disabled={!isComparing && compareCount >= 3}
              className="text-xs"
            >
              <GitCompareArrows className="w-3.5 h-3.5 mr-1" />
              {isComparing ? "Comparing" : "Compare"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <QuickStat
              icon={<DollarSign className="w-4 h-4" />}
              label="Salary Range"
              value={`${(hub.salaryRange.min / 1000).toFixed(0)}k–${(hub.salaryRange.max / 1000).toFixed(0)}k ${hub.salaryRange.currency}`}
            />
            <QuickStat
              icon={<Wifi className="w-4 h-4" />}
              label="Work Mode"
              value={hub.workModes.join(", ")}
            />
            <QuickStat
              icon={<Shield className="w-4 h-4" />}
              label="Visa Difficulty"
              value={hub.mobilityDifficulty}
              badge={mobilityBadge[hub.mobilityDifficulty]}
            />
            <QuickStat
              icon={<BarChart3 className="w-4 h-4" />}
              label="Cost of Living"
              value={hub.costOfLiving}
            />
          </div>

          {/* Match reasons */}
          <div className="bg-gradient-to-r from-navy-50 to-beige-50 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-navy-700 mb-2">
              Why this could be a fit for you
            </p>
            <ul className="space-y-1.5">
              {hub.matchReasons.map((reason, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-navy-600"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg bg-beige-100 p-1 mb-4">
            {(
              [
                { key: "overview", label: "Overview", icon: Layers },
                { key: "skills", label: "Skills", icon: Zap },
                {
                  key: "opportunities",
                  label: "Opportunities",
                  icon: Briefcase,
                },
                { key: "actions", label: "Next Steps", icon: Target },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-white shadow-sm text-navy-900"
                    : "text-navy-500 hover:text-navy-700"
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Industries */}
              <div>
                <p className="text-xs font-medium text-navy-700 mb-2 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Key Industries
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {hub.industries.map((ind) => (
                    <Badge key={ind} variant="secondary" className="text-[11px]">
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div>
                <p className="text-xs font-medium text-navy-700 mb-2 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Suitable Roles
                </p>
                <div className="space-y-1.5">
                  {hub.suitableRoles.map((role) => (
                    <div
                      key={role}
                      className="flex items-center gap-2 text-xs text-navy-600"
                    >
                      <ArrowRight className="w-3 h-3 text-navy-400" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathway tags */}
              <div>
                <p className="text-xs font-medium text-navy-700 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Aligned Career
                  Pathways
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {hub.pathwayTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[11px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-4">
              {/* Matching skills */}
              <div>
                <p className="text-xs font-medium text-navy-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Skills
                  You Already Have
                </p>
                {hub.matchingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {hub.matchingSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="success"
                        className="text-[11px]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-navy-400 italic">
                    No direct skill matches — this hub could help you develop new
                    skills
                  </p>
                )}
              </div>

              {/* Skill gaps */}
              <div>
                <p className="text-xs font-medium text-navy-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Skills
                  to Develop
                </p>
                {hub.skillGaps.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {hub.skillGaps.map((skill) => (
                      <Badge
                        key={skill}
                        variant="warning"
                        className="text-[11px]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-600">
                    You have all the key skills for this hub!
                  </p>
                )}
              </div>

              {/* Skill match meter */}
              <div>
                <p className="text-xs font-medium text-navy-700 mb-2">
                  Skill Coverage
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Progress
                      value={
                        hub.demandSkills.length > 0
                          ? (hub.matchingSkills.length /
                              hub.demandSkills.length) *
                            100
                          : 0
                      }
                    />
                  </div>
                  <span className="text-xs font-semibold text-navy-700">
                    {hub.matchingSkills.length}/{hub.demandSkills.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "opportunities" && (
            <div className="space-y-2">
              {hub.opportunities.map((opp, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-navy-50/50 hover:bg-navy-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    {opp.type === "job" && (
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    )}
                    {opp.type === "internship" && (
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                    )}
                    {opp.type === "course" && (
                      <BookOpen className="w-4 h-4 text-emerald-600" />
                    )}
                    {opp.type === "challenge" && (
                      <Star className="w-4 h-4 text-amber-600" />
                    )}
                    {opp.type === "mentor" && (
                      <Users className="w-4 h-4 text-pink-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy-800 truncate">
                      {opp.title}
                    </p>
                    <p className="text-[10px] text-navy-400">
                      {opp.organization} &middot;{" "}
                      <span className="capitalize">{opp.type}</span>
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-navy-300" />
                </div>
              ))}
            </div>
          )}

          {activeTab === "actions" && (
            <div className="space-y-3">
              <p className="text-xs text-navy-500 mb-2">
                Recommended next steps to explore{" "}
                <span className="font-medium text-navy-700">{hub.city}</span> as
                a career hub
              </p>
              {hub.recommendedActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-navy-50 to-transparent"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                    style={{ backgroundColor: matchColor(hub.matchScore) }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-xs text-navy-700 leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-[10px] text-navy-400 mt-4 pt-3 border-t border-navy-100">
            Based on your profile, this location may offer relevant career
            pathways. This is a potential fit — explore further to understand
            specific opportunities and requirements.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Quick Stat ──

function QuickStat({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: "success" | "warning" | "danger";
}) {
  return (
    <div className="bg-navy-50/50 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-navy-400">{icon}</span>
        <span className="text-[10px] text-navy-400">{label}</span>
      </div>
      {badge ? (
        <Badge variant={badge} className="text-[11px]">
          {value}
        </Badge>
      ) : (
        <p className="text-xs font-semibold text-navy-800">{value}</p>
      )}
    </div>
  );
}

// ── Compare Panel ──

function ComparePanel({
  cities,
  onClose,
  onRemove,
  savedCities,
  onToggleSave,
}: {
  cities: PersonalizedHub[];
  onClose: () => void;
  onRemove: (id: string) => void;
  savedCities: Set<string>;
  onToggleSave: (id: string) => void;
}) {
  const rows: {
    label: string;
    icon: React.ReactNode;
    render: (h: PersonalizedHub) => React.ReactNode;
  }[] = [
    {
      label: "Match Score",
      icon: <Target className="w-3.5 h-3.5" />,
      render: (h) => (
        <span
          className="text-lg font-bold"
          style={{ color: matchColor(h.matchScore) }}
        >
          {h.matchScore}%
        </span>
      ),
    },
    {
      label: "Hub Type",
      icon: <Globe className="w-3.5 h-3.5" />,
      render: (h) => (
        <span className="text-xs text-navy-700">{h.hubType}</span>
      ),
    },
    {
      label: "Industries",
      icon: <Building2 className="w-3.5 h-3.5" />,
      render: (h) => (
        <div className="flex flex-wrap gap-1">
          {h.industries.slice(0, 3).map((ind) => (
            <Badge key={ind} variant="outline" className="text-[9px]">
              {ind}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: "Salary Range",
      icon: <DollarSign className="w-3.5 h-3.5" />,
      render: (h) => (
        <span className="text-xs font-medium text-navy-700">
          {(h.salaryRange.min / 1000).toFixed(0)}k–
          {(h.salaryRange.max / 1000).toFixed(0)}k {h.salaryRange.currency}
        </span>
      ),
    },
    {
      label: "Work Modes",
      icon: <Wifi className="w-3.5 h-3.5" />,
      render: (h) => (
        <span className="text-xs text-navy-600">
          {h.workModes.join(", ")}
        </span>
      ),
    },
    {
      label: "Visa Difficulty",
      icon: <Shield className="w-3.5 h-3.5" />,
      render: (h) => {
        const v: Record<MobilityDifficulty, "success" | "warning" | "danger"> =
          { Low: "success", Medium: "warning", High: "danger" };
        return (
          <Badge variant={v[h.mobilityDifficulty]} className="text-[10px]">
            {h.mobilityDifficulty}
          </Badge>
        );
      },
    },
    {
      label: "Cost of Living",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      render: (h) => (
        <span className="text-xs text-navy-600">{h.costOfLiving}</span>
      ),
    },
    {
      label: "Skills Match",
      icon: <Zap className="w-3.5 h-3.5" />,
      render: (h) => (
        <span className="text-xs font-medium text-navy-700">
          {h.matchingSkills.length}/{h.demandSkills.length} skills
        </span>
      ),
    },
    {
      label: "Top Roles",
      icon: <Briefcase className="w-3.5 h-3.5" />,
      render: (h) => (
        <div className="text-[10px] text-navy-600 space-y-0.5">
          {h.suitableRoles.slice(0, 2).map((r) => (
            <div key={r}>{r}</div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="mt-4 border-2 border-gold-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GitCompareArrows className="w-5 h-5 text-gold-600" />
              Compare Career Hubs
            </CardTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-navy-50 text-navy-400"
              title="Close comparison"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-2 pr-3 w-32">
                    <span className="sr-only">Metric</span>
                  </th>
                  {cities.map((city) => (
                    <th
                      key={city.id}
                      className="text-center py-2 px-3 min-w-[150px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <MapPin
                          className="w-4 h-4"
                          style={{ color: matchColor(city.matchScore) }}
                        />
                        <span className="font-semibold text-sm text-navy-900">
                          {city.city}
                        </span>
                        <span className="text-[10px] text-navy-400">
                          {city.country}
                        </span>
                        <div className="flex gap-1 mt-1">
                          <button
                            type="button"
                            onClick={() => onToggleSave(city.id)}
                            className={`p-1 rounded ${
                              savedCities.has(city.id)
                                ? "text-gold-600"
                                : "text-navy-300 hover:text-navy-500"
                            }`}
                            title="Save to plan"
                          >
                            {savedCities.has(city.id) ? (
                              <BookmarkCheck className="w-3 h-3" />
                            ) : (
                              <Bookmark className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(city.id)}
                            className="p-1 rounded text-navy-300 hover:text-red-500"
                            title="Remove from comparison"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-navy-100">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-navy-400">{row.icon}</span>
                        <span className="text-[11px] font-medium text-navy-600">
                          {row.label}
                        </span>
                      </div>
                    </td>
                    {cities.map((city) => (
                      <td
                        key={city.id}
                        className="py-2.5 px-3 text-center"
                      >
                        {row.render(city)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-navy-400 mt-3 pt-2 border-t border-navy-100">
            Comparing career hubs helps you evaluate potential destinations.
            These are potential fits — explore further before making decisions.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
