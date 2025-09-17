import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import GlowButton from "@/components/ui/GlowButton";

interface StartGameButtonProps {
  onClick: () => void;
  isInstalled?: boolean; // PWA/TWA installed state from parent
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ onClick, isInstalled = false }) => (
  <div className="flex justify-center items-center w-full fixed bottom-4 left-0 right-0 px-4 sm:px-8">
    <div className="relative w-full">
      {/* Mobile: use Glow when installed, otherwise minimal gray */}
      {isInstalled ? (
        <div className="block sm:hidden">
          <GlowButton
            variant="green"
            disableChevron
            className="w-full justify-center mb-3 sm:mb-4 font-unbounded text-lg font-bold text-white py-1"
            onClick={onClick}
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              Start <PlayIcon className="!size-5" /> Now
            </span>
          </GlowButton>
        </div>
      ) : (
        <Button
          className="block sm:hidden cursor-target group relative w-full mb-3 sm:mb-4 font-unbounded
          text-base font-medium
          text-white
          bg-neutral-800
          border border-white/30 hover:border-white/50
          hover:bg-neutral-700
          transition-all duration-300 rounded-lg flex items-center justify-center
          py-6 overflow-hidden"
          onClick={onClick}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            Start <PlayIcon className="!size-4" /> Now
          </span>
        </Button>
      )}

      {/* Desktop: always GlowButton */}
      <div className="hidden sm:block">
        <GlowButton
          variant="green"
          disableChevron
          className="w-full justify-center mb-3 sm:mb-4 font-unbounded text-2xl font-bold text-white py-1"
          onClick={onClick}
        >
          <span className="inline-flex items-center gap-2 whitespace-nowrap">
            Start <PlayIcon className="!size-6" /> Now
          </span>
        </GlowButton>
      </div>
    </div>
  </div>
);

export default StartGameButton;
