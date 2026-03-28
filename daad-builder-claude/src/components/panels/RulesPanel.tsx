import { useState, useEffect, useMemo } from "react";
import { DaadGame, Rule, Condition, Action, ProcessTable, ConditionType, ActionType } from "../../types/daad";
import { CONDITIONS, ACTIONS, getConditionsByCategory, getActionsByCategory } from "../../data/condacts";
import { useDebounce } from "../../hooks/useDebounce";

interface RulesPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteConfirmDialog {
  show: boolean;
  rule: Rule | null;
}

// ── Quick template definitions ───────────────────────────────────────────────

const QUICK_TEMPLATES: { key: string; label: string; title: string }[] = [
  { key: "examineObject", label: "Examine", title: "Create Examine Object rule" },
  { key: "takeObject",    label: "Take",    title: "Create Take Object rule" },
  { key: "dropObject",    label: "Drop",    title: "Create Drop Object rule" },
  { key: "useItemOn",     label: "Use On",  title: "Create Use Item On rule" },
  { key: "unlockDoor",    label: "Unlock",  title: "Create Unlock Door rule" },
];

// ── Process table metadata ───────────────────────────────────────────────────

const PROCESS_LABELS: Record<string, string> = {
  PRO0: "PRO 0 — Location loop (wildcard _ _ rules)",
  PRO1: "PRO 1 — Pre-input / intercept",
  PRO2: "PRO 2 — Before description / automatic",
  PRO3: "PRO 3 — After description / system",
  PRO4: "PRO 4 — Auto events (before each input prompt)",
  PRO5: "PRO 5 — Response table (verb/noun matched rules)",
};

export default function RulesPanel({ game, setGame, selectItemId }: RulesPanelProps) {
  const [selectedRule, setSelectedRule] = useState<number | null>(null);
  const [processFilter, setProcessFilter] = useState<ProcessTable | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [showConditions, setShowConditions] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({ show: false, rule: null });
  const [draggedRuleId, setDraggedRuleId] = useState<number | null>(null);
  const [dragOverRuleId, setDragOverRuleId] = useState<number | null>(null);

  // Auto-select when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) setSelectedRule(selectItemId);
  }, [selectItemId]);

  // Ctrl+↑↓ to move selected rule
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedRule || processFilter !== "all" || debouncedSearchTerm) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "ArrowUp") { e.preventDefault(); moveRuleUp(selectedRule); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "ArrowDown") { e.preventDefault(); moveRuleDown(selectedRule); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRule, processFilter, debouncedSearchTerm]);

  // Delete / Ctrl+D shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedRule) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const rule = game.rules?.find(r => r.id === selectedRule);
        if (rule) { e.preventDefault(); setDeleteDialog({ show: true, rule }); }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        const rule = game.rules?.find(r => r.id === selectedRule);
        if (rule) duplicateRule(rule);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRule, game.rules]);

  // ── Rule CRUD ──────────────────────────────────────────────────────────────

  const getNextRuleId = () =>
    game.rules && game.rules.length > 0 ? Math.max(...game.rules.map(r => r.id)) + 1 : 1;

  const addNewRule = () => {
    const newId = getNextRuleId();
    const newRule: Rule = {
      id: newId, name: `Rule ${newId}`, process: "PRO5",
      enabled: true, conditions: [], actions: [],
      verb: "_", noun: "_",
    };
    setGame(prev => ({ ...prev, rules: [...(prev.rules || []), newRule] }));
    setSelectedRule(newId);
  };

  const duplicateRule = (rule: Rule) => {
    const newId = getNextRuleId();
    const dup: Rule = { ...rule, id: newId, name: `${rule.name} (Copy)` };
    setGame(prev => ({ ...prev, rules: [...(prev.rules || []), dup] }));
    setSelectedRule(newId);
  };

  const confirmDeleteRule = () => {
    if (!deleteDialog.rule) return;
    const ruleId = deleteDialog.rule.id;
    setGame(prev => ({ ...prev, rules: (prev.rules || []).filter(r => r.id !== ruleId) }));
    if (selectedRule === ruleId) setSelectedRule(null);
    setDeleteDialog({ show: false, rule: null });
  };

  const updateRule = (ruleId: number, updates: Partial<Rule>) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r => r.id === ruleId ? { ...r, ...updates } : r),
    }));
  };

  const reorderRules = (draggedId: number, targetId: number) => {
    setGame(prev => {
      const rules = [...(prev.rules || [])];
      const di = rules.findIndex(r => r.id === draggedId);
      const ti = rules.findIndex(r => r.id === targetId);
      if (di === -1 || ti === -1) return prev;
      const [item] = rules.splice(di, 1);
      rules.splice(ti, 0, item);
      return { ...prev, rules };
    });
  };

  const moveRuleUp = (id: number) => {
    setGame(prev => {
      const rules = [...(prev.rules || [])];
      const i = rules.findIndex(r => r.id === id);
      if (i <= 0) return prev;
      [rules[i - 1], rules[i]] = [rules[i], rules[i - 1]];
      return { ...prev, rules };
    });
  };

  const moveRuleDown = (id: number) => {
    setGame(prev => {
      const rules = [...(prev.rules || [])];
      const i = rules.findIndex(r => r.id === id);
      if (i === -1 || i >= rules.length - 1) return prev;
      [rules[i], rules[i + 1]] = [rules[i + 1], rules[i]];
      return { ...prev, rules };
    });
  };

  // ── Condition / action CRUD ────────────────────────────────────────────────

  const getDefaultParams = (type: string): Record<string, unknown> => {
    const def = CONDITIONS[type as ConditionType] ?? ACTIONS[type as ActionType];
    if (!def) return {};
    const params: Record<string, unknown> = {};
    def.params.forEach(p => {
      params[p.name] = (p.type === "word" || p.type === "string") ? "_" : 0;
    });
    return params;
  };

  const addCondition = (ruleId: number, type: string) => {
    if (!CONDITIONS[type as ConditionType]) return;
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r =>
        r.id === ruleId
          ? { ...r, conditions: [...r.conditions, { type: type as ConditionType, params: getDefaultParams(type) }] }
          : r
      ),
    }));
  };

  const updateCondition = (ruleId: number, index: number, params: Record<string, unknown>) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r =>
        r.id === ruleId
          ? { ...r, conditions: r.conditions.map((c, i) => i === index ? { ...c, params } : c) }
          : r
      ),
    }));
  };

  const deleteCondition = (ruleId: number, index: number) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r =>
        r.id === ruleId ? { ...r, conditions: r.conditions.filter((_, i) => i !== index) } : r
      ),
    }));
  };

  const moveCondition = (ruleId: number, from: number, to: number) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r => {
        if (r.id !== ruleId) return r;
        const arr = [...r.conditions];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return { ...r, conditions: arr };
      }),
    }));
  };

  const addAction = (ruleId: number, type: string) => {
    if (!ACTIONS[type as ActionType]) return;
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r =>
        r.id === ruleId
          ? { ...r, actions: [...r.actions, { type: type as ActionType, params: getDefaultParams(type) }] }
          : r
      ),
    }));
  };

  const updateAction = (ruleId: number, index: number, params: Record<string, unknown>) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r =>
        r.id === ruleId
          ? { ...r, actions: r.actions.map((a, i) => i === index ? { ...a, params } : a) }
          : r
      ),
    }));
  };

  const deleteAction = (ruleId: number, index: number) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r =>
        r.id === ruleId ? { ...r, actions: r.actions.filter((_, i) => i !== index) } : r
      ),
    }));
  };

  const moveAction = (ruleId: number, from: number, to: number) => {
    setGame(prev => ({
      ...prev,
      rules: (prev.rules || []).map(r => {
        if (r.id !== ruleId) return r;
        const arr = [...r.actions];
        const [item] = arr.splice(from, 1);
        arr.splice(to, 0, item);
        return { ...r, actions: arr };
      }),
    }));
  };

  // ── Quick templates ────────────────────────────────────────────────────────

  const applyTemplate = (templateType: string) => {
    const id = getNextRuleId();
    const templates: Record<string, Partial<Rule>> = {
      examineObject: {
        name: "Examine Object", process: "PRO5", verb: "_", noun: "_",
        conditions: [{ type: "PRESENT", params: { objno: 0 } }],
        actions: [{ type: "MESSAGE", params: { mesno: 0 } }, { type: "DONE", params: {} }],
      },
      takeObject: {
        name: "Take Object", process: "PRO5", verb: "_", noun: "_",
        conditions: [{ type: "PRESENT", params: { objno: 0 } }],
        actions: [{ type: "GET", params: { objno: 0 } }, { type: "DONE", params: {} }],
      },
      dropObject: {
        name: "Drop Object", process: "PRO5", verb: "_", noun: "_",
        conditions: [{ type: "CARRIED", params: { objno: 0 } }],
        actions: [{ type: "DROP", params: { objno: 0 } }, { type: "DONE", params: {} }],
      },
      useItemOn: {
        name: "Use Item On Target", process: "PRO5", verb: "_", noun: "_",
        conditions: [
          { type: "CARRIED", params: { objno: 0 } },
          { type: "PRESENT", params: { objno: 1 } },
        ],
        actions: [{ type: "MESSAGE", params: { mesno: 0 } }, { type: "DONE", params: {} }],
      },
      unlockDoor: {
        name: "Unlock Door", process: "PRO5", verb: "_", noun: "_",
        conditions: [
          { type: "CARRIED", params: { objno: 0 } },
          { type: "AT", params: { locno: 0 } },
          { type: "ZERO", params: { flagno: 64 } },
        ],
        actions: [
          { type: "SET", params: { flagno: 64 } },
          { type: "MESSAGE", params: { mesno: 0 } },
          { type: "DONE", params: {} },
        ],
      },
    };

    const tpl = templates[templateType];
    if (!tpl) return;

    const newRule: Rule = {
      id, enabled: true, conditions: [], actions: [],
      ...tpl,
    } as Rule;

    setGame(prev => ({ ...prev, rules: [...(prev.rules || []), newRule] }));
    setSelectedRule(id);
  };

  // ── Filtered rules ─────────────────────────────────────────────────────────

  const filteredRules = useMemo(() =>
    (game.rules || []).filter(r => {
      if (processFilter !== "all" && r.process !== processFilter) return false;
      if (debouncedSearchTerm) {
        const q = debouncedSearchTerm.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          (r.verb ?? "").toLowerCase().includes(q) ||
          (r.noun ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    }),
    [game.rules, processFilter, debouncedSearchTerm]
  );

  const selectedRuleData = useMemo(
    () => game.rules?.find(r => r.id === selectedRule),
    [game.rules, selectedRule]
  );

  const canDrag = processFilter === "all" && !debouncedSearchTerm;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="panel-content" style={{ display: "flex", gap: 20, height: "calc(100vh - 180px)" }}>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && deleteDialog.rule && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 480, padding: 24 }}>
            <h3 style={{ marginBottom: 16, color: "var(--red-bright)" }}>⚠️ Delete Rule?</h3>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to delete <strong>{deleteDialog.rule.name}</strong>?
            </p>
            <div style={{ background: "rgba(255,0,0,0.1)", padding: 12, borderRadius: 4, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
                <strong>This will permanently delete:</strong>
              </p>
              <ul style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 20 }}>
                <li>{deleteDialog.rule.conditions.length} condition(s)</li>
                <li>{deleteDialog.rule.actions.length} action(s)</li>
                <li>Process: {deleteDialog.rule.process}</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-danger" onClick={confirmDeleteRule}>Yes, Delete Rule</button>
              <button className="btn btn-secondary" onClick={() => setDeleteDialog({ show: false, rule: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Left sidebar: rule list ──────────────────────────────────────── */}
      <div style={{ width: 290, display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Add + templates */}
        <button className="btn btn-primary" onClick={addNewRule}>+ New Rule</button>

        <div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 6 }}>Quick Templates:</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {QUICK_TEMPLATES.map(t => (
              <button
                key={t.key}
                className="btn btn-secondary"
                onClick={() => applyTemplate(t.key)}
                style={{ fontSize: 10, padding: "4px 8px" }}
                title={t.title}
              >{t.label}</button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text" className="form-input"
          placeholder="Search rules… (name, verb, noun)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ fontSize: 12 }}
        />

        {/* Process filter — standard PRO0-5 plus any custom tables used by rules */}
        <select
          className="form-input form-select"
          value={processFilter}
          onChange={e => setProcessFilter(e.target.value as ProcessTable | "all")}
          style={{ fontSize: 11 }}
        >
          <option value="all">All Processes</option>
          <option value="PRO0">PRO 0 — Location loop</option>
          <option value="PRO1">PRO 1 — Pre-input</option>
          <option value="PRO2">PRO 2 — Before description</option>
          <option value="PRO3">PRO 3 — After description</option>
          <option value="PRO4">PRO 4 — Auto events</option>
          <option value="PRO5">PRO 5 — Response table</option>
          {/* Dynamic: show any custom process tables (PRO6+) used by rules */}
          {Array.from(new Set((game.rules || []).map(r => r.process)))
            .filter(p => !["PRO0","PRO1","PRO2","PRO3","PRO4","PRO5"].includes(p))
            .sort()
            .map(p => <option key={p} value={p}>{p.replace("PRO", "PRO ")} — Custom</option>)
          }
        </select>

        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green-bright)" }}>
          RULES ({filteredRules.length}/{(game.rules || []).length})
        </div>

        {canDrag && (game.rules || []).length > 1 && (
          <div style={{
            fontSize: 10, color: "var(--text-dim)", padding: 8,
            background: "rgba(0,255,65,0.05)", border: "1px solid rgba(0,255,65,0.2)", borderRadius: 4,
          }}>
            💡 Drag ⋮⋮ · Click ▲▼ · Ctrl+↑↓ to reorder
          </div>
        )}
        {!canDrag && (
          <div style={{
            fontSize: 10, color: "var(--amber-bright)", padding: 8,
            background: "rgba(255,193,7,0.05)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: 4,
          }}>
            ⚠ Clear filter to enable drag-and-drop
          </div>
        )}

        {/* Rule list */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          {filteredRules.map(rule => {
            const globalIdx = (game.rules || []).findIndex(r => r.id === rule.id);
            const verb = rule.verb ?? "_";
            const noun = rule.noun ?? "_";
            return (
              <div
                key={rule.id}
                className="card"
                draggable={canDrag}
                onClick={() => setSelectedRule(rule.id)}
                onDragStart={e => { if (canDrag) { setDraggedRuleId(rule.id); e.dataTransfer.effectAllowed = "move"; } }}
                onDragOver={e => { if (canDrag && draggedRuleId !== null && draggedRuleId !== rule.id) { e.preventDefault(); setDragOverRuleId(rule.id); } }}
                onDragLeave={() => setDragOverRuleId(null)}
                onDrop={e => { e.preventDefault(); if (draggedRuleId !== null && draggedRuleId !== rule.id && canDrag) reorderRules(draggedRuleId, rule.id); setDraggedRuleId(null); setDragOverRuleId(null); }}
                onDragEnd={() => { setDraggedRuleId(null); setDragOverRuleId(null); }}
                style={{
                  cursor: canDrag ? "grab" : "pointer",
                  borderColor: selectedRule === rule.id ? "var(--green-bright)" : dragOverRuleId === rule.id ? "var(--amber-bright)" : undefined,
                  opacity: rule.enabled ? (draggedRuleId === rule.id ? 0.5 : 1) : 0.5,
                  background: dragOverRuleId === rule.id ? "rgba(255,193,7,0.08)" : undefined,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {canDrag && (
                    <span style={{ color: "var(--text-dim)", fontSize: 16 }} title="Drag to reorder">⋮⋮</span>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rule.enabled ? "✓" : "✗"} {rule.name}
                    </div>
                    {/* ── CHANGE 1: Show verb/noun in rule list item ── */}
                    <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                      <span style={{ color: "var(--cyan-dim, rgba(0,255,255,0.5))" }}>{rule.process}</span>
                      {" · "}
                      <span style={{ color: "var(--cyan-bright)", fontFamily: "monospace", fontWeight: 600 }}>
                        {verb} {noun}
                      </span>
                      {" · "}
                      {rule.conditions.length}C · {rule.actions.length}A
                    </div>
                  </div>
                  {canDrag && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button
                        onClick={e => { e.stopPropagation(); moveRuleUp(rule.id); }}
                        disabled={globalIdx === 0}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-dim)", cursor: "pointer", padding: "1px 5px", fontSize: 10, opacity: globalIdx === 0 ? 0.3 : 1 }}
                        title="Move up (Ctrl+↑)"
                      >▲</button>
                      <button
                        onClick={e => { e.stopPropagation(); moveRuleDown(rule.id); }}
                        disabled={globalIdx === (game.rules || []).length - 1}
                        style={{ background: "none", border: "1px solid var(--border)", borderRadius: 3, color: "var(--text-dim)", cursor: "pointer", padding: "1px 5px", fontSize: 10, opacity: globalIdx === (game.rules || []).length - 1 ? 0.3 : 1 }}
                        title="Move down (Ctrl+↓)"
                      >▼</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredRules.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--text-dim)", padding: 40, fontSize: 13 }}>
              {debouncedSearchTerm ? "No rules match your search." : "No rules yet. Click '+ New Rule' to start."}
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: rule editor ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {selectedRuleData ? (
          <div>
            {/* Sticky header */}
            <div className="card" style={{ marginBottom: 16, position: "sticky", top: 0, zIndex: 10 }}>

              {/* Name */}
              <div className="form-group">
                <label className="form-label">Rule Name</label>
                <input
                  type="text" className="form-input"
                  value={selectedRuleData.name}
                  onChange={e => updateRule(selectedRuleData.id, { name: e.target.value.slice(0, 60) })}
                  maxLength={60}
                />
                {selectedRuleData.name.length >= 55 && (
                  <span style={{ fontSize: 10, color: selectedRuleData.name.length >= 60 ? "var(--red-bright)" : "var(--amber-bright)" }}>
                    {selectedRuleData.name.length}/60
                  </span>
                )}
              </div>

              {/* Process / Status / Duplicate / Delete */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Process Table</label>
                  {/* Process table selector — standard + custom (type any PRO number) */}
                  <div style={{ display: "flex", gap: 4 }}>
                    <select
                      className="form-input form-select"
                      value={selectedRuleData.process}
                      onChange={e => updateRule(selectedRuleData.id, { process: e.target.value as ProcessTable })}
                      style={{ fontSize: 12, flex: 1 }}
                    >
                      <option value="PRO0">PRO 0 — Location loop</option>
                      <option value="PRO1">PRO 1 — Pre-input</option>
                      <option value="PRO2">PRO 2 — Before description</option>
                      <option value="PRO3">PRO 3 — After description</option>
                      <option value="PRO4">PRO 4 — Auto events</option>
                      <option value="PRO5">PRO 5 — Response table</option>
                      {/* Show any custom tables already in use */}
                      {Array.from(new Set((game.rules || []).map(r => r.process)))
                        .filter(p => !["PRO0","PRO1","PRO2","PRO3","PRO4","PRO5"].includes(p))
                        .sort()
                        .map(p => <option key={p} value={p}>{p.replace("PRO", "PRO ")} — Custom</option>)
                      }
                    </select>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="PRO13"
                      style={{ fontSize: 11, width: 64 }}
                      title="Type a custom process table (e.g. PRO13)"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                          if (val.match(/^PRO\d+$/)) {
                            updateRule(selectedRuleData.id, { process: val as ProcessTable });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedRuleData.enabled}
                      onChange={e => updateRule(selectedRuleData.id, { enabled: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 12, color: selectedRuleData.enabled ? "var(--green-bright)" : "var(--text-dim)" }}>
                      {selectedRuleData.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </label>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ marginTop: 24, fontSize: 11, padding: "6px 12px" }}
                  onClick={() => duplicateRule(selectedRuleData)}
                  title="Duplicate this rule (Ctrl+D)"
                >Duplicate</button>

                <button
                  className="btn btn-danger"
                  style={{ marginTop: 24, fontSize: 11, padding: "6px 12px" }}
                  onClick={() => setDeleteDialog({ show: true, rule: selectedRuleData })}
                  title="Delete this rule (Delete key)"
                >Delete</button>
              </div>

              {/* ── CHANGE 3: Verb / Noun fields ─────────────────────────── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Verb
                    <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: "normal" }}>
                      — DSF entry trigger (use _ to match any)
                    </span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={selectedRuleData.verb ?? "_"}
                    onChange={e => updateRule(selectedRuleData.id, { verb: e.target.value })}
                    style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "var(--cyan-bright)" }}
                  >
                    <option value="_">_ (match any verb)</option>
                    {(game.vocabulary || [])
                      .filter(v => v.wordType === "verb")
                      .map(v => (
                        <option key={v.word} value={v.word}>{v.word}</option>
                      ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    Noun
                    <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: "normal" }}>
                      — DSF entry trigger (use _ to match any)
                    </span>
                  </label>
                  <select
                    className="form-input form-select"
                    value={selectedRuleData.noun ?? "_"}
                    onChange={e => updateRule(selectedRuleData.id, { noun: e.target.value })}
                    style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "var(--cyan-bright)" }}
                  >
                    <option value="_">_ (match any noun)</option>
                    {(game.vocabulary || [])
                      .filter(v => v.wordType === "noun")
                      .map(v => (
                        <option key={v.word} value={v.word}>{v.word}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Process help hint */}
              <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-dim)" }}>
                {selectedRuleData.process === "PRO5" && (
                  <span>
                    <strong style={{ color: "var(--green-bright)" }}>PRO 5:</strong> Matched by verb/noun. Set both above. Use <code>_ _</code> only for catch-all responses.
                  </span>
                )}
                {selectedRuleData.process === "PRO0" && (
                  <span>
                    <strong style={{ color: "var(--cyan-bright)" }}>PRO 0:</strong> Runs every turn. Use <code>_ _</code> for unconditional events (NPC movement, timers). Verb/noun matching here is unusual.
                  </span>
                )}
                {(selectedRuleData.process === "PRO1" || selectedRuleData.process === "PRO2" || selectedRuleData.process === "PRO3" || selectedRuleData.process === "PRO4") && (
                  <span>
                    <strong style={{ color: "var(--blue-bright)" }}>{selectedRuleData.process}:</strong> Runs automatically. Verb/noun typically <code>_ _</code> here.
                  </span>
                )}
              </div>
            </div>

            {/* Conditions */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, color: "var(--cyan-bright)", margin: 0 }}>
                  Conditions ({selectedRuleData.conditions.length})
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: "normal", marginLeft: 8 }}>
                    — all must pass to fire actions
                  </span>
                </h3>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 10, padding: "4px 8px" }}
                  onClick={() => setShowConditions(v => !v)}
                >{showConditions ? "▼ Hide" : "▶ Show"}</button>
              </div>

              {showConditions && (
                <>
                  <select
                    className="form-input form-select"
                    style={{ marginBottom: 12, fontSize: 11 }}
                    defaultValue=""
                    onChange={e => { if (e.target.value) { addCondition(selectedRuleData.id, e.target.value); e.target.value = ""; } }}
                  >
                    <option value="">+ Add Condition…</option>
                    {Object.entries(getConditionsByCategory()).map(([category, conds]) => (
                      <optgroup key={category} label={category}>
                        {conds.map(c => (
                          <option key={c.type} value={c.type} title={c.description}>{c.type}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedRuleData.conditions.map((cond, i) => (
                      <ConditionEditor
                        key={i}
                        condition={cond} index={i} total={selectedRuleData.conditions.length}
                        game={game}
                        onUpdate={params => updateCondition(selectedRuleData.id, i, params)}
                        onDelete={() => deleteCondition(selectedRuleData.id, i)}
                        onMoveUp={() => i > 0 && moveCondition(selectedRuleData.id, i, i - 1)}
                        onMoveDown={() => i < selectedRuleData.conditions.length - 1 && moveCondition(selectedRuleData.id, i, i + 1)}
                      />
                    ))}
                    {selectedRuleData.conditions.length === 0 && (
                      <div style={{ fontSize: 11, color: "var(--text-dim)", fontStyle: "italic", padding: "4px 8px" }}>
                        No conditions — rule fires unconditionally when verb/noun matches.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, color: "var(--green-bright)", margin: 0 }}>
                  Actions ({selectedRuleData.actions.length})
                  <span style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: "normal", marginLeft: 8 }}>
                    — run in order when conditions pass
                  </span>
                </h3>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 10, padding: "4px 8px" }}
                  onClick={() => setShowActions(v => !v)}
                >{showActions ? "▼ Hide" : "▶ Show"}</button>
              </div>

              {showActions && (
                <>
                  <select
                    className="form-input form-select"
                    style={{ marginBottom: 12, fontSize: 11 }}
                    defaultValue=""
                    onChange={e => { if (e.target.value) { addAction(selectedRuleData.id, e.target.value); e.target.value = ""; } }}
                  >
                    <option value="">+ Add Action…</option>
                    {Object.entries(getActionsByCategory()).map(([category, acts]) => (
                      <optgroup key={category} label={category}>
                        {acts.map(a => (
                          <option key={a.type} value={a.type} title={a.description}>{a.type}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedRuleData.actions.map((action, i) => (
                      <ActionEditor
                        key={i}
                        action={action} index={i} total={selectedRuleData.actions.length}
                        game={game}
                        onUpdate={params => updateAction(selectedRuleData.id, i, params)}
                        onDelete={() => deleteAction(selectedRuleData.id, i)}
                        onMoveUp={() => i > 0 && moveAction(selectedRuleData.id, i, i - 1)}
                        onMoveDown={() => i < selectedRuleData.actions.length - 1 && moveAction(selectedRuleData.id, i, i + 1)}
                      />
                    ))}
                    {selectedRuleData.actions.length === 0 && (
                      <div style={{ fontSize: 11, color: "var(--text-dim)", fontStyle: "italic", padding: "4px 8px" }}>
                        No actions defined — add at least one action (usually MESSAGE + DONE).
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--text-dim)", fontSize: 16 }}>Select a rule to edit</p>
            <p style={{ color: "var(--text-dim)", fontSize: 12, marginTop: 8 }}>
              or click <strong>+ New Rule</strong> to create one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Condition Editor ─────────────────────────────────────────────────────────

function ConditionEditor({ condition, index, total, game, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  condition: Condition; index: number; total: number; game: DaadGame;
  onUpdate: (p: Record<string, unknown>) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const def = CONDITIONS[condition.type];

  return (
    <div style={{
      padding: 8, borderRadius: 4, border: "1px solid rgba(0,255,255,0.3)",
      background: "rgba(0,255,255,0.06)", display: "flex", gap: 8, alignItems: "flex-start",
    }}>
      <MoveButtons index={index} total={total} onUp={onMoveUp} onDown={onMoveDown} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--cyan-bright)", fontWeight: 600, marginBottom: 6 }}
          title={def?.description}>
          {condition.type}
          {def?.description && (
            <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: "normal", marginLeft: 6 }}>
              — {def.description.split(".")[0]}
            </span>
          )}
        </div>
        {def ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {def.params.map(param => (
              <ParamInput key={param.name} param={param} value={condition.params[param.name]} game={game}
                onChange={v => onUpdate({ ...condition.params, [param.name]: v })} />
            ))}
            {def.params.length === 0 && (
              <span style={{ fontSize: 10, color: "var(--text-dim)", fontStyle: "italic" }}>No parameters</span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Unknown condition: {condition.type}</span>
        )}
      </div>
      <button className="btn btn-danger" style={{ fontSize: 10, padding: "3px 8px" }} onClick={onDelete}>✕</button>
    </div>
  );
}

// ── Action Editor ─────────────────────────────────────────────────────────────

function ActionEditor({ action, index, total, game, onUpdate, onDelete, onMoveUp, onMoveDown }: {
  action: Action; index: number; total: number; game: DaadGame;
  onUpdate: (p: Record<string, unknown>) => void;
  onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const def = ACTIONS[action.type];

  return (
    <div style={{
      padding: 8, borderRadius: 4, border: "1px solid rgba(0,255,0,0.3)",
      background: "rgba(0,255,0,0.06)", display: "flex", gap: 8, alignItems: "flex-start",
    }}>
      <MoveButtons index={index} total={total} onUp={onMoveUp} onDown={onMoveDown} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--green-bright)", fontWeight: 600, marginBottom: 6 }}
          title={def?.description}>
          {action.type}
          {def?.description && (
            <span style={{ fontSize: 10, color: "var(--text-dim)", fontWeight: "normal", marginLeft: 6 }}>
              — {def.description.split(".")[0]}
            </span>
          )}
        </div>
        {def ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {def.params.map(param => (
              <ParamInput key={param.name} param={param} value={action.params[param.name]} game={game}
                onChange={v => onUpdate({ ...action.params, [param.name]: v })} />
            ))}
            {def.params.length === 0 && (
              <span style={{ fontSize: 10, color: "var(--text-dim)", fontStyle: "italic" }}>No parameters</span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 10, color: "var(--text-dim)" }}>Unknown action: {action.type}</span>
        )}
      </div>
      <button className="btn btn-danger" style={{ fontSize: 10, padding: "3px 8px" }} onClick={onDelete}>✕</button>
    </div>
  );
}

// ── Move buttons ─────────────────────────────────────────────────────────────

function MoveButtons({ index, total, onUp, onDown }: {
  index: number; total: number; onUp: () => void; onDown: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <button className="btn btn-secondary" style={{ fontSize: 10, padding: "2px 5px" }}
        onClick={onUp} disabled={index === 0} title="Move up">▲</button>
      <button className="btn btn-secondary" style={{ fontSize: 10, padding: "2px 5px" }}
        onClick={onDown} disabled={index === total - 1} title="Move down">▼</button>
    </div>
  );
}

// ── Param Input ───────────────────────────────────────────────────────────────

function ParamInput({ param, value, game, onChange }: {
  param: { name: string; type: string; description: string; optional?: boolean };
  value: unknown;
  game: DaadGame;
  onChange: (v: unknown) => void;
}) {
  const v = value === undefined || value === null ? "" : String(value);

  const inputStyle: React.CSSProperties = {
    background: "var(--bg-darker)", border: "1px solid var(--border)",
    color: "var(--text)", borderRadius: 3, padding: "3px 6px",
    fontSize: 11, width: "100%", boxSizing: "border-box" as const,
  };

  const wrap = (children: React.ReactNode) => (
    <div style={{ minWidth: 100, flex: 1 }}>
      <div style={{ fontSize: 9, color: "var(--text-dim)", marginBottom: 2 }}>{param.description}</div>
      {children}
    </div>
  );

  switch (param.type) {
    case "location":
      return wrap(
        <select style={inputStyle} value={v} onChange={e => onChange(Number(e.target.value))}>
          {param.optional && <option value="255">— Any/ignore —</option>}
          {(game.locations || []).map(l => (
            <option key={l.id} value={l.id}>{l.id}: {l.name}</option>
          ))}
          <option value="252">252 — Not created (limbo)</option>
          <option value="253">253 — Worn</option>
          <option value="254">254 — Carried</option>
          <option value="255">255 — Here (current location)</option>
        </select>
      );

    case "object":
      return wrap(
        <select style={inputStyle} value={v} onChange={e => onChange(Number(e.target.value))}>
          {(game.objects || []).map(o => (
            <option key={o.id} value={o.id}>{o.id}: {o.adjective ? `${o.adjective} ` : ""}{o.noun}</option>
          ))}
        </select>
      );

    case "flag":
      return wrap(
        <select style={inputStyle} value={v} onChange={e => onChange(Number(e.target.value))}>
          <optgroup label="System flags">
            <option value="0">0 — DarkF (darkness check)</option>
            <option value="1">1 — Objects carried count</option>
            <option value="28">28 — Dark flag</option>
            <option value="31">31 — Turns (LSB)</option>
            <option value="32">32 — Turns (MSB)</option>
            <option value="33">33 — Current verb</option>
            <option value="34">34 — Current noun</option>
            <option value="37">37 — MaxCarr (max objects)</option>
            <option value="38">38 — Player location</option>
            <option value="51">51 — Current object ref</option>
            <option value="52">52 — Strength (max weight)</option>
          </optgroup>
          <optgroup label="Game flags">
            {(game.flags || []).filter(f => f.id >= 64).map(f => (
              <option key={f.id} value={f.id}>{f.id}: {f.name}</option>
            ))}
          </optgroup>
        </select>
      );

    case "message":
      return wrap(
        <select style={inputStyle} value={v} onChange={e => onChange(Number(e.target.value))}>
          {(game.messages || []).length === 0
            ? <option value="0">No messages defined</option>
            : (game.messages || []).map((msg, i) => (
              <option key={i} value={i}>{i}: {msg.length > 45 ? msg.slice(0, 45) + "…" : msg}</option>
            ))}
        </select>
      );

    case "word":
    case "string":
      return wrap(
        <input type="text" style={inputStyle} value={v}
          onChange={e => onChange(e.target.value)}
          placeholder={param.name === "verb" || param.name === "noun" ? "_ or word" : "word"} />
      );

    case "percent":
      return wrap(
        <input type="number" min={1} max={99} style={inputStyle} value={v}
          onChange={e => onChange(Math.max(1, Math.min(99, Number(e.target.value))))} />
      );

    case "color":
      return wrap(
        <select style={inputStyle} value={v} onChange={e => onChange(Number(e.target.value))}>
          {["Black","White","Red","Cyan","Purple","Green","Blue","Yellow","Orange","Brown","Light red","Dark grey","Grey","Light green","Light blue","Light grey"].map((c, i) => (
            <option key={i} value={i}>{i} — {c}</option>
          ))}
        </select>
      );

    case "window":
      return wrap(
        <select style={inputStyle} value={v} onChange={e => onChange(Number(e.target.value))}>
          {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>Window {n}</option>)}
        </select>
      );

    case "option":
    case "value":
    default:
      return wrap(
        <input type="number" min={0} max={255} style={inputStyle} value={v}
          onChange={e => onChange(Math.max(0, Math.min(255, Number(e.target.value))))} />
      );
  }
}
