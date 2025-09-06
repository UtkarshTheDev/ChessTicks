import { Zap, Clock, Timer, Pencil } from "lucide-react";
import { TimerMode } from "@/stores/timerTypeStore";
import { useCustomTimerStore } from "@/stores/customTimerStore";
import { WheelPicker, WheelPickerWrapper, WheelPickerOption } from "@/components/wheel-picker";
import { useState, useEffect } from "react";

interface Duration {
  title: string;
  time: string;
  duration: number;
  icon: React.ReactNode;
}

const durations: Duration[] = [
  {
    title: "Blitz",
    time: "5 mins",
    duration: 5,
    icon: <Zap className="w-5 h-5 text-white" />,
  },
  {
    title: "Rapid",
    time: "15 mins",
    duration: 15,
    icon: <Clock className="w-5 h-5 text-white" />,
  },
  {
    title: "Classical",
    time: "60 mins",
    duration: 60,
    icon: <Timer className="w-5 h-5 text-white" />,
  },
];

interface DurationSelectorProps {
  selectedTime: number;
  onTimeSelect: (duration: number) => void;
  currentMode: TimerMode;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ selectedTime, onTimeSelect, currentMode }) => {
  const { durationEditorOpen, openDurationEditor, overrides, setOverride, resetOverride } = useCustomTimerStore();
  const o = overrides[currentMode] || {};

  // Wheel options for H:M:S (limit hours 0..11)
  const hourOptions: WheelPickerOption[] = Array.from({ length: 12 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i) }));
  const minuteOptions: WheelPickerOption[] = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i) }));
  const secondOptions: WheelPickerOption[] = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i) }));

  // Local state for tabs (WheelPicker requires string values and onValueChange)
  const [activeTab, setActiveTab] = useState<'both' | 'white' | 'black'>('both');
  const [bothH, setBothH] = useState<string>('0');
  const [bothM, setBothM] = useState<string>('15');
  const [bothS, setBothS] = useState<string>('0');
  const [whiteH, setWhiteH] = useState<string>('0');
  const [whiteM, setWhiteM] = useState<string>('15');
  const [whiteS, setWhiteS] = useState<string>('0');
  const [blackH, setBlackH] = useState<string>('0');
  const [blackM, setBlackM] = useState<string>('15');
  const [blackS, setBlackS] = useState<string>('0');

  // Initialize wheel values when opening the dialog
  useEffect(() => {
    if (!durationEditorOpen) return;
    const bothMinutes = selectedTime; // from presets UI
    const wMinutes = o.whiteMinutes ?? bothMinutes;
    const bMinutes = o.blackMinutes ?? bothMinutes;
    const setFromMinutes = (mins: number, setH: (v: string) => void, setM: (v: string) => void, setS: (v: string) => void) => {
      const maxMins = 11 * 60 + 59; // 11:59
      const capped = Math.max(0, Math.min(maxMins, Math.floor(mins)));
      const h = Math.floor(capped / 60);
      const m = capped % 60;
      setH(String(h));
      setM(String(m));
      setS('0');
    };
    setFromMinutes(bothMinutes, setBothH, setBothM, setBothS);
    setFromMinutes(wMinutes, setWhiteH, setWhiteM, setWhiteS);
    setFromMinutes(bMinutes, setBlackH, setBlackM, setBlackS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationEditorOpen, currentMode]);

  // Helpers to compute minutes from H:M:S strings
  const hmsToMinutes = (h: string, m: string, s: string) => {
    const totalSeconds = parseInt(h || '0') * 3600 + parseInt(m || '0') * 60 + parseInt(s || '0');
    const maxMins = 11 * 60 + 59; // cap at 11:59
    return Math.max(1, Math.min(maxMins, Math.floor(totalSeconds / 60)));
  };

  // Commit current tab values when switching tabs so user changes are not lost
  const commitTabValues = (tab: 'both' | 'white' | 'black') => {
    if (tab === 'both') {
      const mins = hmsToMinutes(bothH, bothM, bothS);
      setOverride(currentMode, { durationMinutes: mins });
    } else if (tab === 'white') {
      const mins = hmsToMinutes(whiteH, whiteM, whiteS);
      setOverride(currentMode, { whiteMinutes: mins });
    } else if (tab === 'black') {
      const mins = hmsToMinutes(blackH, blackM, blackS);
      setOverride(currentMode, { blackMinutes: mins });
    }
  };

  const saveBoth = () => {
    const totalMinutes = hmsToMinutes(bothH, bothM, bothS);
    // Save only for the current mode and clear per-side for this mode
    setOverride(currentMode, { durationMinutes: totalMinutes, whiteMinutes: undefined, blackMinutes: undefined });
    onTimeSelect(totalMinutes);
    openDurationEditor(false);
  };
  const saveWhite = () => {
    const totalMinutes = hmsToMinutes(whiteH, whiteM, whiteS);
    setOverride(currentMode, { whiteMinutes: totalMinutes });
    openDurationEditor(false);
  };
  const saveBlack = () => {
    const totalMinutes = hmsToMinutes(blackH, blackM, blackS);
    setOverride(currentMode, { blackMinutes: totalMinutes });
    openDurationEditor(false);
  };

  const resetAll = () => {
    resetOverride(currentMode);
    openDurationEditor(false);
  };

  return (
    <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3">
      <h2 className="text-lg font-semibold font-ubuntu w-full text-center">Duration</h2>
      {/* Preset row + Custom in same grid; Custom spans full row on mobile (col-span-3) */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full justify-center items-center">
        {(() => {
          const hasCustom = Boolean(o.whiteMinutes || o.blackMinutes || o.durationMinutes);
          const isCustomActive = Boolean(o.whiteMinutes || o.blackMinutes || (o.durationMinutes !== undefined && selectedTime === o.durationMinutes));
          return durations.map((duration, index) => {
            const isPresetActive = selectedTime === duration.duration && !isCustomActive;
            return (
              <button
                key={index}
                onClick={() => onTimeSelect(duration.duration)}
                className={`cursor-target border ${isPresetActive
                  ? "border-white bg-green-500"
                  : "border-neutral-800 bg-primary"
                  } hover:border-neutral-300 w-full flex flex-col items-center justify-center p-4 hover:bg-green-600 rounded-lg transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {duration.icon}
                  <span className="text-[14px] sm:text-lg text-white font-bold max-sm:font-semibold group-hover:text-white transition-colors duration-300">
                    {duration.title}
                  </span>
                </div>
                <span
                  className={`text-xs text-neutral-400 ${isPresetActive
                    ? "text-white"
                    : "text-neutral-400"
                    } group-hover:text-white transition-colors duration-300 text-[11px] sm:text-xs`}
                >
                  {duration.time}
                </span>
              </button>
            );
          });
        })()}

        {/* Custom tile in grid; spans entire row on mobile */}
        {(() => {
          const hasCustom = Boolean(o.durationMinutes || o.whiteMinutes || o.blackMinutes);
          const isCustomActive = Boolean(o.whiteMinutes || o.blackMinutes || (o.durationMinutes !== undefined && selectedTime === o.durationMinutes));
          const fmt = (mins?: number) => {
            if (!mins && mins !== 0) return "--:--";
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const mm = String(m).padStart(2, '0');
            return h > 0 ? `${h}:${mm}:00` : `${m}:00`;
          };
          let summary = "";
          if (o.whiteMinutes || o.blackMinutes) {
            const w = o.whiteMinutes ?? undefined;
            const b = o.blackMinutes ?? undefined;
            summary = `W: ${fmt(w)} · B: ${fmt(b)}`;
          } else if (o.durationMinutes !== undefined) {
            summary = `Both: ${fmt(o.durationMinutes)}`;
          } else {
            summary = "Set H:M:S or per-side";
          }
          return (
            <div
              role="button"
              tabIndex={0}
              onClick={() => openDurationEditor(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openDurationEditor(true); }}
              className={`col-span-3 md:col-span-1 cursor-target border ${isCustomActive ? "border-white bg-green-500" : "border-neutral-700 bg-primary/90"}
                hover:border-neutral-300 w-full flex flex-col items-center justify-center py-3 sm:py-4 px-4 hover:bg-green-600 rounded-lg transition-all duration-300 group cursor-pointer md:max-w-xl md:mx-auto relative`}
            >
              {hasCustom && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); openDurationEditor(true); }}
                  className={`absolute top-1 right-1 p-1 rounded-md border backdrop-blur-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${isCustomActive ? "bg-black/30 text-emerald-300 border-white/10 ring-1 ring-emerald-400/60 shadow-sm shadow-emerald-500/20 hover:bg-black/40 hover:ring-emerald-300/80 hover:shadow-emerald-500/30 hover:-translate-y-0.5" : "bg-white/10 text-white border-white/15 hover:bg-white/20 hover:shadow hover:shadow-white/10 hover:-translate-y-0.5"}`}
                  aria-label="Edit custom duration"
                  title="Edit custom duration"
                >
                  <Pencil className={`w-4 h-4 ${isCustomActive ? "text-emerald-300" : "text-white"}`} />
                </button>
              )}
              <div className="flex items-center justify-center space-x-2">
                <Pencil className="w-4 h-4 text-white/90 sm:w-5 sm:h-5" />
                <span className="text-base sm:text-lg text-white font-bold group-hover:text-white transition-colors duration-300">
                  Custom
                </span>
              </div>
              <span className={`text-[11px] sm:text-xs ${isCustomActive ? "text-white/90" : "text-neutral-300"} transition-colors duration-300`}>{summary}</span>
            </div>
          );
        })()}
      </div>

      {durationEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => openDurationEditor(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-xl">
            <div className="mb-3">
              <h3 className="text-white font-semibold">Custom Duration</h3>
              <p className="text-xs text-neutral-400">Set time via scroll wheel. Max 24h. Three tabs: Both, White, Black.</p>
            </div>

            {/* Tabs */}
            <div className="mb-3 flex items-center gap-2">
              {(["both", "white", "black"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { commitTabValues(activeTab); setActiveTab(tab); }}
                  className={`px-3 py-1.5 rounded border ${activeTab === tab ? "border-white bg-green-600 text-white" : "border-neutral-700 text-neutral-200 hover:border-neutral-400"}`}
                >
                  {tab === 'both' ? 'Both' : tab === 'white' ? 'White' : 'Black'}
                </button>
              ))}
            </div>

            {/* Wheel picker per tab */}
            {activeTab === 'both' && (
              <WheelPickerWrapper className="mx-auto">
                <WheelPicker options={hourOptions} infinite value={bothH} onValueChange={setBothH} />
                <WheelPicker options={minuteOptions} infinite value={bothM} onValueChange={setBothM} />
                <WheelPicker options={secondOptions} infinite value={bothS} onValueChange={setBothS} />
              </WheelPickerWrapper>
            )}
            {activeTab === 'white' && (
              <WheelPickerWrapper className="mx-auto">
                <WheelPicker options={hourOptions} infinite value={whiteH} onValueChange={setWhiteH} />
                <WheelPicker options={minuteOptions} infinite value={whiteM} onValueChange={setWhiteM} />
                <WheelPicker options={secondOptions} infinite value={whiteS} onValueChange={setWhiteS} />
              </WheelPickerWrapper>
            )}
            {activeTab === 'black' && (
              <WheelPickerWrapper className="mx-auto">
                <WheelPicker options={hourOptions} infinite value={blackH} onValueChange={setBlackH} />
                <WheelPicker options={minuteOptions} infinite value={blackM} onValueChange={setBlackM} />
                <WheelPicker options={secondOptions} infinite value={blackS} onValueChange={setBlackS} />
              </WheelPickerWrapper>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button className="text-xs text-neutral-300 underline hover:text-white" onClick={resetAll}>Reset</button>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded border border-neutral-700 text-neutral-200 hover:border-neutral-400" onClick={() => openDurationEditor(false)}>Cancel</button>
                {activeTab === 'both' && (
                  <button className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-500" onClick={saveBoth}>Save</button>
                )}
                {activeTab === 'white' && (
                  <button className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-500" onClick={saveWhite}>Save</button>
                )}
                {activeTab === 'black' && (
                  <button className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-500" onClick={saveBlack}>Save</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DurationSelector;
