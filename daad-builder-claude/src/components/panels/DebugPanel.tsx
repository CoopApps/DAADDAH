import { useState } from "react";
import { DaadGame } from "../../types/daad";
import FlagInspector from "../debug/FlagInspector";
import RuleLogger from "../debug/RuleLogger";
import BreakpointManager from "../debug/BreakpointManager";
import "../../styles/debug.css";

interface DebugPanelProps {
  game: DaadGame;
  setGame: (game: DaadGame | ((prev: DaadGame) => DaadGame)) => void;
}

type DebugTab = "flags" | "rules" | "breakpoints";

export default function DebugPanel({ game, setGame }: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState<DebugTab>("flags");

  return (
    <div className="debug-panel">
      {/* Tab Navigation */}
      <div className="debug-tabs">
        <button
          className={`debug-tab ${activeTab === "flags" ? "active" : ""}`}
          onClick={() => setActiveTab("flags")}
        >
          Flag Inspector
        </button>
        <button
          className={`debug-tab ${activeTab === "rules" ? "active" : ""}`}
          onClick={() => setActiveTab("rules")}
        >
          Rule Logger
        </button>
        <button
          className={`debug-tab ${activeTab === "breakpoints" ? "active" : ""}`}
          onClick={() => setActiveTab("breakpoints")}
        >
          Breakpoints
        </button>
      </div>

      {/* Tab Content */}
      <div className="debug-content">
        {activeTab === "flags" && (
          <FlagInspector game={game} setGame={setGame} />
        )}
        {activeTab === "rules" && (
          <RuleLogger game={game} />
        )}
        {activeTab === "breakpoints" && (
          <BreakpointManager game={game} />
        )}
      </div>
    </div>
  );
}
