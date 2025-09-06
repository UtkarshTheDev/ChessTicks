import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import GlareHover from "../../Animations/GlareHover/GlareHover";

interface StartGameButtonProps {
  onClick: () => void;
}

const StartGameButton: React.FC<StartGameButtonProps> = ({ onClick }) => (
  <div className="flex justify-center items-center w-full fixed bottom-4 left-0 right-0 px-4 sm:px-8">
    <div className="relative w-full">
      <Button
        className="cursor-target group relative w-full mb-3 sm:mb-4 font-unbounded text-2xl sm:text-2xl font-bold text-white bg-green-500 border border-neutral-300 hover:border-white hover:bg-green-600 transition-all duration-300 rounded-lg flex items-center justify-center py-7 sm:py-7 overflow-hidden"
        onClick={onClick}
      >
        <div className="absolute inset-0 pointer-events-none">
          <GlareHover
            width="100%"
            height="100%"
            glareColor="#22c55e"
            glareOpacity={0.75}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
            className="!border-transparent !bg-transparent"
            style={{ pointerEvents: "none" }}
          />
        </div>
        Start <PlayIcon className="!size-6" /> Now
      </Button>
    </div>
  </div>
);

export default StartGameButton;
