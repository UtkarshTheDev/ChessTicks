import { TimerMode } from "@/stores/timerTypeStore";
import { TimerOff, Pause, RotateCcw, Hourglass, TimerReset, Pencil, X } from "lucide-react";
import { createCustomConfig } from "@/lib/timerConfigs";
import { useCustomTimerStore } from "@/stores/customTimerStore";
import React from "react";
import { WheelPicker, WheelPickerWrapper, WheelPickerOption } from "@/components/wheel-picker";

export const types = [
  {
    title: "Sudden Death",
    mode: "SUDDEN_DEATH" as TimerMode,
    description: "Standard countdown",
    icon: <TimerOff className="w-5 h-5 text-white" />,
    config: (baseMinutes: number) => {
      // Minutes come from caller; no override here
      return createCustomConfig("SUDDEN_DEATH", baseMinutes);
    },
  },
  {
    title: "Simple Delay",
    mode: "SIMPLE_DELAY" as TimerMode,
    description: "US Delay: 5s",
    icon: <Pause className="w-5 h-5 text-white" />,
    config: (baseMinutes: number) => {
      const { enabled, overrides } = useCustomTimerStore.getState();
      const ov = overrides["SIMPLE_DELAY"];
      const delaySeconds = enabled && ov?.delaySeconds !== undefined ? ov.delaySeconds : 5;
      return createCustomConfig("SIMPLE_DELAY", baseMinutes, { delaySeconds });
    },
  },
  {
    title: "Bronstein",
    mode: "BRONSTEIN_DELAY" as TimerMode,
    description: "Bronstein: 3s",
    icon: <RotateCcw className="w-5 h-5 text-white" />,
    config: (baseMinutes: number) => {
      const { enabled, overrides } = useCustomTimerStore.getState();
      const ov = overrides["BRONSTEIN_DELAY"];
      const delaySeconds = enabled && ov?.delaySeconds !== undefined ? ov.delaySeconds : 3;
      return createCustomConfig("BRONSTEIN_DELAY", baseMinutes, { delaySeconds });
    },
  },
  {
    title: "Fischer",
    mode: "FISCHER_INCREMENT" as TimerMode,
    description: "Increment: +5s",
    icon: <Hourglass className="w-5 h-5 text-white" />,
    config: (baseMinutes: number) => {
      const { enabled, overrides } = useCustomTimerStore.getState();
      const ov = overrides["FISCHER_INCREMENT"];
      const incrementSeconds = enabled && ov?.incrementSeconds !== undefined ? ov.incrementSeconds : 5;
      return createCustomConfig("FISCHER_INCREMENT", baseMinutes, { incrementSeconds });
    },
  },
  {
    title: "Multi-Stage",
    mode: "MULTI_STAGE" as TimerMode,
    description: "Tournament style",
    icon: <TimerReset className="w-5 h-5 text-white" />,
    config: (baseMinutes: number) => {
      // Use baseMinutes directly for deciding template
      const effectiveBase = baseMinutes;
      if (effectiveBase >= 60) {
        // Classical tournament format
        return createCustomConfig("MULTI_STAGE", 90, {
          incrementSeconds: 30,
          stages: [{ afterMoves: 40, addMinutes: 30 }]
        });
      } else {
        // Rapid tournament format
        return createCustomConfig("MULTI_STAGE", baseMinutes, {
          incrementSeconds: 10,
          stages: [{ afterMoves: 30, addMinutes: baseMinutes / 2 }]
        });
      }
    },
  },
];

interface TimerModeSelectorProps {
  selectedMode: TimerMode;
  onModeSelect: (mode: TimerMode) => void;
}

const TimerModeSelector: React.FC<TimerModeSelectorProps> = ({ selectedMode, onModeSelect }) => {
  const { enabled, overrides, setOverride, resetOverride, setEnabled } = useCustomTimerStore();
  const [openMode, setOpenMode] = React.useState<TimerMode | null>(null);

  // Child dialog component to keep hooks scoped properly
  const ModeSettingDialog: React.FC<{
    mode: TimerMode;
    open: boolean;
    overrideObj: any;
    enabled: boolean;
    setEnabled: (val: boolean) => void;
    onSaveOverride: (seconds: number) => void;
    onReset: () => void;
    onClose: () => void;
  }> = ({ mode, open, overrideObj, enabled, setEnabled, onSaveOverride, onReset, onClose }) => {
    if (!open) return null;
    const isFischer = mode === "FISCHER_INCREMENT";
    const isSimpleDelay = mode === "SIMPLE_DELAY";
    const isBronstein = mode === "BRONSTEIN_DELAY";
    const title = isFischer ? "Fischer Increment" : isSimpleDelay ? "Simple Delay" : isBronstein ? "Bronstein Delay" : "";

    // Options (MM:SS)
    const minuteOptions: WheelPickerOption[] = Array.from({ length: 61 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i) }));
    const secondOptions: WheelPickerOption[] = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, "0"), value: String(i) }));

    const [mm, setMm] = React.useState<string>('0');
    const [ss, setSs] = React.useState<string>('5');

    React.useEffect(() => {
      const fallback = isBronstein ? 3 : 5; // Bronstein 3s, others 5s
      const currentSeconds = isFischer ? (overrideObj?.incrementSeconds ?? 5) : (overrideObj?.delaySeconds ?? fallback);
      const defM = Math.floor(currentSeconds / 60);
      const defS = currentSeconds % 60;
      setMm(String(defM));
      setSs(String(defS));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const onSave = () => {
      const total = parseInt(mm) * 60 + parseInt(ss);
      onSaveOverride(total);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">{title}</h3>
              <label className="text-xs text-neutral-300 flex items-center gap-2">
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                Use custom for this mode
              </label>
            </div>
            <button className="p-1 rounded hover:bg-neutral-800" onClick={onClose} aria-label="Close">
              <X className="w-4 h-4 text-neutral-300" />
            </button>
          </div>

          <div className="mb-3 text-xs text-neutral-400">Set value in minutes and seconds.</div>
          <WheelPickerWrapper>
            <WheelPicker options={minuteOptions} infinite value={mm} onValueChange={setMm} />
            <WheelPicker options={secondOptions} infinite value={ss} onValueChange={setSs} />
          </WheelPickerWrapper>

          <div className="mt-4 flex items-center justify-between">
            <button className="text-xs text-neutral-300 underline hover:text-white" onClick={() => { onReset(); onClose(); }}>Reset</button>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded border border-neutral-700 text-neutral-200 hover:border-neutral-400" onClick={onClose}>Cancel</button>
              <button className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-500" onClick={onSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="text-white py-4 font-ubuntu flex flex-col items-center justify-center w-full space-y-3 border-t border-neutral-500">
      <h2 className="text-lg font-semibold font-ubuntu text-center w-full">Timer Modes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full justify-center items-center">
        {types.map((typeItem, index) => {
          const ov = overrides[typeItem.mode];
          const hasCustom = !!ov && Object.keys(ov).length > 0 && enabled;
          const hidePencil = typeItem.mode === "SUDDEN_DEATH" || typeItem.mode === "MULTI_STAGE";
          return (
            <div key={index} className={`w-full ${typeItem.mode === "MULTI_STAGE" ? "col-span-2 md:col-span-1" : ""}`}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onModeSelect(typeItem.mode)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onModeSelect(typeItem.mode); }}
                className={`relative cursor-target border ${selectedMode === typeItem.mode
                  ? "border-white bg-green-500"
                  : "border-neutral-800 bg-primary"
                  } hover:border-neutral-300 w-full flex flex-col items-center justify-center p-3 hover:bg-green-600 rounded-lg transition-all duration-300 group cursor-pointer`}
              >
                <div className="absolute top-1 right-1 flex items-center gap-1">
                  {!hidePencil && (
                    <button
                      type="button"
                      className={`p-1.5 rounded-md border backdrop-blur-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
                        hasCustom
                          ? "bg-black/30 text-emerald-300 border-white/10 ring-1 ring-emerald-400/60 shadow-sm shadow-emerald-500/20 hover:bg-black/40 hover:ring-emerald-300/80 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                          : "bg-white/10 text-white border-white/15 hover:bg-white/20 hover:shadow hover:shadow-white/10 hover:-translate-y-0.5"
                      }`}
                      onClick={(e) => { e.stopPropagation(); setOpenMode(typeItem.mode); }}
                      aria-label={`Customize ${typeItem.title}${hasCustom ? " (custom active)" : ""}`}
                      title={hasCustom ? "Custom settings active" : "Customize"}
                    >
                      <Pencil className={`w-4 h-4 ${hasCustom ? "text-emerald-300" : "text-white"}`} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-1 mb-1">
                  {typeItem.icon}
                  <span className="text-[13px] sm:text-sm text-white font-bold max-sm:font-semibold group-hover:text-white transition-colors duration-300">
                    {typeItem.title}
                  </span>
                </div>
                {(() => {
                  let desc = typeItem.description;
                  if (typeItem.mode === "FISCHER_INCREMENT") {
                    const inc = enabled ? (ov?.incrementSeconds ?? 5) : 5;
                    desc = `Increment: +${inc}s`;
                  } else if (typeItem.mode === "SIMPLE_DELAY") {
                    const d = enabled ? (ov?.delaySeconds ?? 5) : 5;
                    desc = `US Delay: ${d}s`;
                  } else if (typeItem.mode === "BRONSTEIN_DELAY") {
                    const d = enabled ? (ov?.delaySeconds ?? 3) : 3;
                    desc = `Bronstein: ${d}s`;
                  }
                  return (
                    <span
                      className={`text-[11px] sm:text-xs ${selectedMode === typeItem.mode ? "text-white" : "text-neutral-400"
                        } group-hover:text-white transition-colors duration-300 text-center`}
                    >
                      {desc}
                    </span>
                  );
                })()}
              </div>

              <ModeSettingDialog
                mode={typeItem.mode}
                open={openMode === typeItem.mode}
                overrideObj={overrides[typeItem.mode]}
                enabled={enabled}
                setEnabled={setEnabled}
                onSaveOverride={(seconds) => {
                  if (typeItem.mode === "FISCHER_INCREMENT") {
                    setOverride(typeItem.mode, { incrementSeconds: seconds });
                  } else if (typeItem.mode === "SIMPLE_DELAY" || typeItem.mode === "BRONSTEIN_DELAY") {
                    setOverride(typeItem.mode, { delaySeconds: seconds });
                  }
                }}
                onReset={() => resetOverride(typeItem.mode)}
                onClose={() => setOpenMode(null)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimerModeSelector;
