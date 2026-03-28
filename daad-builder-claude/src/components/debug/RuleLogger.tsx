import { useState, useEffect, useRef } from "react";
import { DaadGame, Rule } from "../../types/daad";
import "../../styles/debug.css";

interface RuleLoggerProps {
  game: DaadGame;
}

export interface RuleLogEntry {
  id: string;
  timestamp: number;
  ruleId: number;
  ruleName: string;
  conditions: string[];
  actions: string[];
  success: boolean;
  executionTime: number;
  flagsBefore: Record<number, number>;
  flagsAfter: Record<number, number>;
  locationBefore?: number;
  locationAfter?: number;
}

type LogFilter = "all" | "success" | "failed";
type LogSort = "newest" | "oldest" | "slowest";

export default function RuleLogger({ game }: RuleLoggerProps) {
  const [logs, setLogs] = useState<RuleLogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>("all");
  const [sort, setSort] = useState<LogSort>("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState<RuleLogEntry | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Simulate rule execution for demo purposes
  // In a real implementation, this would be integrated with the game interpreter
  const simulateRuleExecution = () => {
    if (isPaused || game.rules.length === 0) return;

    const randomRule = game.rules[Math.floor(Math.random() * game.rules.length)];
    const success = Math.random() > 0.3; // 70% success rate for demo
    const executionTime = Math.random() * 50 + 5; // 5-55ms

    const newLog: RuleLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      ruleId: randomRule.id,
      ruleName: randomRule.name || `Rule ${randomRule.id}`,
      conditions: randomRule.conditions.map((c) => `${c.type}(${JSON.stringify(c.params)})`),
      actions: randomRule.actions.map((a) => `${a.type}(${JSON.stringify(a.params)})`),
      success,
      executionTime,
      flagsBefore: {},
      flagsAfter: {},
      locationBefore: 0,
      locationAfter: 0,
    };

    setLogs((prev) => [...prev, newLog]);
  };

  // Auto-generate logs for demo
  useEffect(() => {
    const interval = setInterval(simulateRuleExecution, 2000);
    return () => clearInterval(interval);
  }, [game.rules, isPaused]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filter and sort logs
  const filteredLogs = logs
    .filter((log) => {
      // Apply filter
      if (filter === "success" && !log.success) return false;
      if (filter === "failed" && log.success) return false;

      // Apply search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = log.ruleName.toLowerCase().includes(searchLower);
        const idMatch = log.ruleId.toString().includes(searchLower);
        const condMatch = log.conditions.some((c) =>
          c.toLowerCase().includes(searchLower)
        );
        const actionMatch = log.actions.some((a) =>
          a.toLowerCase().includes(searchLower)
        );

        if (!nameMatch && !idMatch && !condMatch && !actionMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.timestamp - b.timestamp;
        case "slowest":
          return b.executionTime - a.executionTime;
        case "newest":
        default:
          return b.timestamp - a.timestamp;
      }
    });

  // Format timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const base = date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = date.getMilliseconds().toString().padStart(3, "0");
    return `${base}.${ms}`;
  };

  // Clear all logs
  const clearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
  };

  // Export logs as JSON
  const exportLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    navigator.clipboard.writeText(data);
    console.log("Rule logs exported to clipboard");
  };

  return (
    <div className="rule-logger">
      {/* Header */}
      <div className="rule-logger-header">
        <h3>Rule Execution Logger</h3>
        <div className="rule-logger-stats">
          {filteredLogs.length} / {logs.length} logs
        </div>
      </div>

      {/* Controls */}
      <div className="rule-logger-controls">
        {/* Search */}
        <input
          type="text"
          className="rule-logger-search"
          placeholder="Search rules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filter */}
        <div className="rule-logger-control-group">
          <label>Filter:</label>
          <select
            className="rule-logger-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as LogFilter)}
          >
            <option value="all">All</option>
            <option value="success">Success Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>

        {/* Sort */}
        <div className="rule-logger-control-group">
          <label>Sort:</label>
          <select
            className="rule-logger-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as LogSort)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="slowest">Slowest First</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="rule-logger-actions">
          <button
            className={`rule-logger-btn ${isPaused ? "active" : ""}`}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume logging" : "Pause logging"}
          >
            {isPaused ? "▶" : "⏸"}
          </button>
          <button
            className={`rule-logger-btn ${autoScroll ? "active" : ""}`}
            onClick={() => setAutoScroll(!autoScroll)}
            title="Toggle auto-scroll"
          >
            ↓
          </button>
          <button
            className="rule-logger-btn"
            onClick={clearLogs}
            title="Clear all logs"
          >
            🗑
          </button>
          <button
            className="rule-logger-btn"
            onClick={exportLogs}
            title="Export logs to clipboard"
          >
            📋
          </button>
        </div>
      </div>

      {/* Log Display */}
      <div className="rule-logger-content">
        {/* Log List */}
        <div className="rule-logger-list" ref={logContainerRef}>
          {filteredLogs.length === 0 ? (
            <div className="rule-logger-empty">
              {logs.length === 0
                ? "No rule executions logged yet. Start playing the game to see logs."
                : "No logs match the current filter."}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`rule-log-entry ${
                  log.success ? "success" : "failed"
                } ${selectedLog?.id === log.id ? "selected" : ""}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="rule-log-header">
                  <span className="rule-log-time">{formatTime(log.timestamp)}</span>
                  <span className="rule-log-name">{log.ruleName}</span>
                  <span className="rule-log-id">#{log.ruleId}</span>
                  <span
                    className={`rule-log-status ${
                      log.success ? "success" : "failed"
                    }`}
                  >
                    {log.success ? "✓" : "✗"}
                  </span>
                  <span className="rule-log-duration">
                    {log.executionTime.toFixed(2)}ms
                  </span>
                </div>
                {selectedLog?.id === log.id && (
                  <div className="rule-log-details">
                    <div className="rule-log-section">
                      <strong>Conditions:</strong>
                      {log.conditions.length > 0 ? (
                        <ul>
                          {log.conditions.map((cond, i) => (
                            <li key={i}>{cond}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty">No conditions</p>
                      )}
                    </div>
                    <div className="rule-log-section">
                      <strong>Actions:</strong>
                      {log.actions.length > 0 ? (
                        <ul>
                          {log.actions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="empty">No actions</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="rule-logger-footer">
        <div className="rule-logger-info">
          {isPaused && (
            <span className="rule-logger-paused">⏸ Logging Paused</span>
          )}
          {selectedLog && (
            <span className="rule-logger-selected">
              Selected: {selectedLog.ruleName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
