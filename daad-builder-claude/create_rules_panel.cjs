const fs = require('fs');

// This creates a complete RulesPanel component with visual builders
const rulesPanelContent = `import { useState } from "react";
import { DaadGame, Rule, Condition, Action, ProcessTable } from "../../types/daad";

interface RulesPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
}

export default function RulesPanel({ game, setGame }: RulesPanelProps) {
  const [selectedRule, setSelectedRule] = useState<number | null>(null);
  const [processFilter, setProcessFilter] = useState<ProcessTable | "all">("all");

  const getNextRuleId = (): number => {
    if (game.rules.length === 0) return 1;
    return Math.max(...game.rules.map(r => r.id)) + 1;
  };

  const addNewRule = () => {
    const newRule: Rule = {
      id: getNextRuleId(),
      name: \`Rule \${getNextRuleId()}\`,
      process: "PRO0",
      enabled: true,
      conditions: [],
      actions: [],
    };

    setGame(prev => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));

    setSelectedRule(newRule.id);
  };

  const deleteRule = (ruleId: number) => {
    setGame(prev => ({
      ...prev,
      rules: prev.rules.filter(r => r.id !== ruleId),
    }));

    if (selectedRule === ruleId) {
      setSelectedRule(null);
    }
  };

  const updateRule = (ruleId: number, updates: Partial<Rule>) => {
    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r),
    }));
  };

  const addCondition = (ruleId: number, conditionType: string) => {
    const newCondition: Condition = {
      type: conditionType,
      params: getDefaultParams(conditionType),
    };

    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId ? { ...r, conditions: [...r.conditions, newCondition] } : r
      ),
    }));
  };

  const updateCondition = (ruleId: number, index: number, params: Record<string, unknown>) => {
    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId
          ? {
              ...r,
              conditions: r.conditions.map((c, i) =>
                i === index ? { ...c, params } : c
              ),
            }
          : r
      ),
    }));
  };

  const deleteCondition = (ruleId: number, index: number) => {
    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId
          ? { ...r, conditions: r.conditions.filter((_, i) => i !== index) }
          : r
      ),
    }));
  };

  const addAction = (ruleId: number, actionType: string) => {
    const newAction: Action = {
      type: actionType,
      params: getDefaultParams(actionType),
    };

    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId ? { ...r, actions: [...r.actions, newAction] } : r
      ),
    }));
  };

  const updateAction = (ruleId: number, index: number, params: Record<string, unknown>) => {
    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId
          ? {
              ...r,
              actions: r.actions.map((a, i) => (i === index ? { ...a, params } : a)),
            }
          : r
      ),
    }));
  };

  const deleteAction = (ruleId: number, index: number) => {
    setGame(prev => ({
      ...prev,
      rules: prev.rules.map(r =>
        r.id === ruleId ? { ...r, actions: r.actions.filter((_, i) => i !== index) } : r
      ),
    }));
  };

  const getDefaultParams = (type: string): Record<string, unknown> => {
    // Default parameters for each condition/action type
    const defaults: Record<string, Record<string, unknown>> = {
      player_at: { locationId: 0 },
      player_not_at: { locationId: 0 },
      object_present: { objectId: 0 },
      object_carried: { objectId: 0 },
      object_worn: { objectId: 0 },
      object_at: { objectId: 0, locationId: 0 },
      flag_equals: { flagId: 0, value: 0 },
      flag_greater_than: { flagId: 0, value: 0 },
      flag_less_than: { flagId: 0, value: 0 },
      flag_zero: { flagId: 0 },
      verb_is: { verb: "" },
      noun_is: { noun: "" },
      is_first_turn: {},
      turn_count_greater_than: { turns: 0 },
      score_greater_than: { score: 0 },
      show_message: { text: "Message" },
      show_location_description: {},
      clear_screen: {},
      get_object: { objectId: 0 },
      drop_object: { objectId: 0 },
      wear_object: { objectId: 0 },
      remove_object: { objectId: 0 },
      move_object: { objectId: 0, toLocation: "limbo" },
      set_flag: { flagId: 0, value: 0 },
      increment_flag: { flagId: 0 },
      decrement_flag: { flagId: 0 },
      goto_location: { locationId: 0 },
      end_turn: {},
      continue_processing: {},
      skip_rules: { count: 1 },
      add_score: { points: 10 },
    };
    return defaults[type] || {};
  };

  const filteredRules = processFilter === "all"
    ? game.rules
    : game.rules.filter(r => r.process === processFilter);

  const selectedRuleData = game.rules.find(r => r.id === selectedRule);

  return (
    <div className="panel-content" style={{ display: "flex", gap: 20 }}>
      {/* Rules List */}
      <div style={{ width: 280 }}>
        <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={addNewRule} style={{ flex: 1 }}>
            + New Rule
          </button>
        </div>

        {/* Process Filter */}
        <div className="form-group" style={{ marginBottom: 12 }}>
          <select
            className="form-input form-select"
            value={processFilter}
            onChange={(e) => setProcessFilter(e.target.value as ProcessTable | "all")}
            style={{ fontSize: 11 }}
          >
            <option value="all">All Processes</option>
            <option value="PRO0">PRO 0 (Parser)</option>
            <option value="PRO1">PRO 1 (Response)</option>
            <option value="PRO2">PRO 2 (Before Desc)</option>
            <option value="PRO3">PRO 3 (After Desc)</option>
          </select>
        </div>

        <pre className="ascii-border" style={{ marginBottom: 12 }}>
{\`+--- RULES (\${filteredRules.length}) ---+\`}
        </pre>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
          {filteredRules.map(rule => (
            <div
              key={rule.id}
              className="card"
              onClick={() => setSelectedRule(rule.id)}
              style={{
                cursor: "pointer",
                borderColor: selectedRule === rule.id ? "var(--green-bright)" : undefined,
                opacity: rule.enabled ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: 14, marginBottom: 4 }}>
                {rule.enabled ? "✓" : "✗"} {rule.name}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {rule.process} • {rule.conditions.length}C • {rule.actions.length}A
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rule Editor */}
      <div style={{ flex: 1 }}>
        {selectedRuleData ? (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Rule Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedRuleData.name}
                  onChange={(e) => updateRule(selectedRuleData.id, { name: e.target.value })}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Process Table</label>
                  <select
                    className="form-input form-select"
                    value={selectedRuleData.process}
                    onChange={(e) => updateRule(selectedRuleData.id, { process: e.target.value as ProcessTable })}
                  >
                    <option value="PRO0">PRO 0 (Parser)</option>
                    <option value="PRO1">PRO 1 (Response)</option>
                    <option value="PRO2">PRO 2 (Before Description)</option>
                    <option value="PRO3">PRO 3 (After Description)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                    <input
                      type="checkbox"
                      checked={selectedRuleData.enabled}
                      onChange={(e) => updateRule(selectedRuleData.id, { enabled: e.target.checked })}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 12 }}>Enabled</span>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-danger"
                style={{ marginTop: 8 }}
                onClick={() => deleteRule(selectedRuleData.id)}
              >
                Delete Rule
              </button>
            </div>

            {/* Conditions Section */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, color: "var(--cyan-bright)" }}>
                Conditions ({selectedRuleData.conditions.length})
              </h3>

              <select
                className="form-input form-select"
                style={{ marginBottom: 12, fontSize: 12 }}
                onChange={(e) => {
                  if (e.target.value) {
                    addCondition(selectedRuleData.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
              >
                <option value="">+ Add Condition...</option>
                <optgroup label="Location">
                  <option value="player_at">Player at location</option>
                  <option value="player_not_at">Player NOT at location</option>
                </optgroup>
                <optgroup label="Objects">
                  <option value="object_present">Object present</option>
                  <option value="object_carried">Object carried</option>
                  <option value="object_worn">Object worn</option>
                  <option value="object_at">Object at location</option>
                </optgroup>
                <optgroup label="Flags">
                  <option value="flag_equals">Flag equals</option>
                  <option value="flag_greater_than">Flag greater than</option>
                  <option value="flag_less_than">Flag less than</option>
                  <option value="flag_zero">Flag is zero</option>
                </optgroup>
                <optgroup label="Input">
                  <option value="verb_is">Verb is...</option>
                  <option value="noun_is">Noun is...</option>
                </optgroup>
                <optgroup label="Game State">
                  <option value="is_first_turn">Is first turn</option>
                  <option value="turn_count_greater_than">Turn count &gt;</option>
                  <option value="score_greater_than">Score &gt;</option>
                </optgroup>
              </select>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedRuleData.conditions.map((cond, index) => (
                  <ConditionEditor
                    key={index}
                    condition={cond}
                    index={index}
                    game={game}
                    onUpdate={(params) => updateCondition(selectedRuleData.id, index, params)}
                    onDelete={() => deleteCondition(selectedRuleData.id, index)}
                  />
                ))}
              </div>
            </div>

            {/* Actions Section */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12, color: "var(--green-bright)" }}>
                Actions ({selectedRuleData.actions.length})
              </h3>

              <select
                className="form-input form-select"
                style={{ marginBottom: 12, fontSize: 12 }}
                onChange={(e) => {
                  if (e.target.value) {
                    addAction(selectedRuleData.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
              >
                <option value="">+ Add Action...</option>
                <optgroup label="Display">
                  <option value="show_message">Show message</option>
                  <option value="show_location_description">Show location description</option>
                  <option value="clear_screen">Clear screen</option>
                </optgroup>
                <optgroup label="Objects">
                  <option value="get_object">Get object</option>
                  <option value="drop_object">Drop object</option>
                  <option value="wear_object">Wear object</option>
                  <option value="remove_object">Remove object</option>
                  <option value="move_object">Move object to location</option>
                </optgroup>
                <optgroup label="Flags">
                  <option value="set_flag">Set flag</option>
                  <option value="increment_flag">Increment flag</option>
                  <option value="decrement_flag">Decrement flag</option>
                </optgroup>
                <optgroup label="Movement">
                  <option value="goto_location">Go to location</option>
                </optgroup>
                <optgroup label="Flow Control">
                  <option value="end_turn">End turn (DONE)</option>
                  <option value="continue_processing">Continue (NOTDONE)</option>
                  <option value="skip_rules">Skip rules</option>
                </optgroup>
                <optgroup label="Score">
                  <option value="add_score">Add score</option>
                </optgroup>
              </select>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedRuleData.actions.map((action, index) => (
                  <ActionEditor
                    key={index}
                    action={action}
                    index={index}
                    game={game}
                    onUpdate={(params) => updateAction(selectedRuleData.id, index, params)}
                    onDelete={() => deleteAction(selectedRuleData.id, index)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "var(--text-dim)" }}>Select a rule to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Condition Editor Component
function ConditionEditor({
  condition,
  index,
  game,
  onUpdate,
  onDelete,
}: {
  condition: Condition;
  index: number;
  game: DaadGame;
  onUpdate: (params: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const getLabel = () => {
    switch (condition.type) {
      case "player_at":
        return "Player at location";
      case "player_not_at":
        return "Player NOT at location";
      case "object_present":
        return "Object present";
      case "object_carried":
        return "Object carried";
      case "object_worn":
        return "Object worn";
      case "object_at":
        return "Object at location";
      case "flag_equals":
        return "Flag equals";
      case "flag_greater_than":
        return "Flag >";
      case "flag_less_than":
        return "Flag <";
      case "flag_zero":
        return "Flag is zero";
      case "verb_is":
        return "Verb is";
      case "noun_is":
        return "Noun is";
      case "is_first_turn":
        return "Is first turn";
      case "turn_count_greater_than":
        return "Turn count >";
      case "score_greater_than":
        return "Score >";
      default:
        return condition.type;
    }
  };

  return (
    <div
      style={{
        padding: 8,
        backgroundColor: "rgba(0, 255, 255, 0.1)",
        borderRadius: 4,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--cyan-bright)", marginBottom: 4 }}>{getLabel()}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {condition.type.includes("location") && "locationId" in condition.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(condition.params.locationId)}
              onChange={(e) => onUpdate({ ...condition.params, locationId: Number(e.target.value) })}
            >
              {game.locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {condition.type.includes("object") && "objectId" in condition.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(condition.params.objectId)}
              onChange={(e) => onUpdate({ ...condition.params, objectId: Number(e.target.value) })}
            >
              {game.objects.map(obj => (
                <option key={obj.id} value={obj.id}>
                  {obj.adjective} {obj.noun}
                </option>
              ))}
            </select>
          )}

          {condition.type === "object_at" && "locationId" in condition.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(condition.params.locationId)}
              onChange={(e) => onUpdate({ ...condition.params, locationId: Number(e.target.value) })}
            >
              {game.locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {condition.type.includes("flag") && "flagId" in condition.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(condition.params.flagId)}
              onChange={(e) => onUpdate({ ...condition.params, flagId: Number(e.target.value) })}
            >
              {game.flags.map(flag => (
                <option key={flag.id} value={flag.id}>
                  {flag.name}
                </option>
              ))}
            </select>
          )}

          {("value" in condition.params) && (
            <input
              type="number"
              className="form-input"
              style={{ fontSize: 11, width: 80 }}
              value={String(condition.params.value)}
              onChange={(e) => onUpdate({ ...condition.params, value: Number(e.target.value) })}
            />
          )}

          {("verb" in condition.params) && (
            <input
              type="text"
              className="form-input"
              style={{ fontSize: 11, flex: 1 }}
              value={String(condition.params.verb)}
              onChange={(e) => onUpdate({ ...condition.params, verb: e.target.value })}
              placeholder="verb"
            />
          )}

          {("noun" in condition.params) && (
            <input
              type="text"
              className="form-input"
              style={{ fontSize: 11, flex: 1 }}
              value={String(condition.params.noun)}
              onChange={(e) => onUpdate({ ...condition.params, noun: e.target.value })}
              placeholder="noun"
            />
          )}

          {("turns" in condition.params) && (
            <input
              type="number"
              className="form-input"
              style={{ fontSize: 11, width: 80 }}
              value={String(condition.params.turns)}
              onChange={(e) => onUpdate({ ...condition.params, turns: Number(e.target.value) })}
            />
          )}

          {("score" in condition.params) && (
            <input
              type="number"
              className="form-input"
              style={{ fontSize: 11, width: 80 }}
              value={String(condition.params.score)}
              onChange={(e) => onUpdate({ ...condition.params, score: Number(e.target.value) })}
            />
          )}
        </div>
      </div>
      <button
        className="btn btn-danger"
        style={{ fontSize: 10, padding: "2px 6px" }}
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
}

// Action Editor Component
function ActionEditor({
  action,
  index,
  game,
  onUpdate,
  onDelete,
}: {
  action: Action;
  index: number;
  game: DaadGame;
  onUpdate: (params: Record<string, unknown>) => void;
  onDelete: () => void;
}) {
  const getLabel = () => {
    switch (action.type) {
      case "show_message":
        return "Show message";
      case "show_location_description":
        return "Show location description";
      case "clear_screen":
        return "Clear screen";
      case "get_object":
        return "Get object";
      case "drop_object":
        return "Drop object";
      case "wear_object":
        return "Wear object";
      case "remove_object":
        return "Remove object";
      case "move_object":
        return "Move object";
      case "set_flag":
        return "Set flag";
      case "increment_flag":
        return "Increment flag";
      case "decrement_flag":
        return "Decrement flag";
      case "goto_location":
        return "Go to location";
      case "end_turn":
        return "End turn (DONE)";
      case "continue_processing":
        return "Continue (NOTDONE)";
      case "skip_rules":
        return "Skip rules";
      case "add_score":
        return "Add score";
      default:
        return action.type;
    }
  };

  return (
    <div
      style={{
        padding: 8,
        backgroundColor: "rgba(0, 255, 0, 0.1)",
        borderRadius: 4,
        display: "flex",
        gap: 8,
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "var(--green-bright)", marginBottom: 4 }}>{getLabel()}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {("text" in action.params) && (
            <input
              type="text"
              className="form-input"
              style={{ fontSize: 11, flex: 1 }}
              value={String(action.params.text)}
              onChange={(e) => onUpdate({ ...action.params, text: e.target.value })}
            />
          )}

          {action.type.includes("object") && "objectId" in action.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(action.params.objectId)}
              onChange={(e) => onUpdate({ ...action.params, objectId: Number(e.target.value) })}
            >
              {game.objects.map(obj => (
                <option key={obj.id} value={obj.id}>
                  {obj.adjective} {obj.noun}
                </option>
              ))}
            </select>
          )}

          {action.type === "move_object" && "toLocation" in action.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(action.params.toLocation)}
              onChange={(e) => onUpdate({ ...action.params, toLocation: e.target.value })}
            >
              <option value="limbo">Limbo</option>
              <option value="carried">Carried</option>
              <option value="worn">Worn</option>
              {game.locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {action.type.includes("flag") && "flagId" in action.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(action.params.flagId)}
              onChange={(e) => onUpdate({ ...action.params, flagId: Number(e.target.value) })}
            >
              {game.flags.map(flag => (
                <option key={flag.id} value={flag.id}>
                  {flag.name}
                </option>
              ))}
            </select>
          )}

          {("value" in action.params) && (
            <input
              type="number"
              className="form-input"
              style={{ fontSize: 11, width: 80 }}
              value={String(action.params.value)}
              onChange={(e) => onUpdate({ ...action.params, value: Number(e.target.value) })}
            />
          )}

          {action.type === "goto_location" && "locationId" in action.params && (
            <select
              className="form-input form-select"
              style={{ fontSize: 11, flex: 1 }}
              value={String(action.params.locationId)}
              onChange={(e) => onUpdate({ ...action.params, locationId: Number(e.target.value) })}
            >
              {game.locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          )}

          {("count" in action.params) && (
            <input
              type="number"
              className="form-input"
              style={{ fontSize: 11, width: 80 }}
              value={String(action.params.count)}
              onChange={(e) => onUpdate({ ...action.params, count: Number(e.target.value) })}
            />
          )}

          {("points" in action.params) && (
            <input
              type="number"
              className="form-input"
              style={{ fontSize: 11, width: 80 }}
              value={String(action.params.points)}
              onChange={(e) => onUpdate({ ...action.params, points: Number(e.target.value) })}
            />
          )}
        </div>
      </div>
      <button
        className="btn btn-danger"
        style={{ fontSize: 10, padding: "2px 6px" }}
        onClick={onDelete}
      >
        ✕
      </button>
    </div>
  );
}
`;

fs.writeFileSync('D:/projects/daadah/daad-builder-ui/src/components/panels/RulesPanel.tsx', rulesPanelContent);
console.log('Created RulesPanel.tsx');
