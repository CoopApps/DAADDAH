import { useMemo } from "react";
import { DaadGame } from "../../types/daad";
import { getReachabilitySummary } from "../../utils/reachability";

interface StatisticsPanelProps {
  game: DaadGame;
}

export default function StatisticsPanel({ game }: StatisticsPanelProps) {
  const stats = useMemo(() => {
    // Count vocabulary by type
    const verbCount = (game.vocabulary || []).filter(v => v.wordType === "verb").length;
    const nounCount = (game.vocabulary || []).filter(v => v.wordType === "noun").length;
    const adjectiveCount = (game.vocabulary || []).filter(v => v.wordType === "adjective").length;

    // Count objects by type
    const takeableObjects = (game.objects || []).filter(o => o.isTakeable).length;
    const containers = (game.objects || []).filter(o => o.isContainer).length;
    const wearables = (game.objects || []).filter(o => o.isWearable).length;
    const lightSources = (game.objects || []).filter(o => o.isLightSource).length;
    const characters = (game.objects || []).filter(o => o.isPSI).length;

    // Count rules by process
    const pro0Rules = (game.rules || []).filter(r => r.process === "PRO0").length;
    const pro1Rules = (game.rules || []).filter(r => r.process === "PRO1").length;
    const pro2Rules = (game.rules || []).filter(r => r.process === "PRO2").length;
    const enabledRules = (game.rules || []).filter(r => r.enabled).length;

    // Location stats
    const darkLocations = (game.locations || []).filter(l => l.isDark).length;
    const totalExits = (game.locations || []).reduce((sum, loc) =>
      sum + Object.values(loc.exits).filter(e => e !== null).length, 0
    );

    // Calculate complexity score
    const locations = game.locations || [];
    const objects = game.objects || [];
    const rules = game.rules || [];
    const flags = game.flags || [];
    const vocabulary = game.vocabulary || [];
    const complexityScore =
      locations.length +
      objects.length +
      rules.length * 2 +
      flags.length +
      vocabulary.length / 2;

    // Estimate playtime (very rough)
    const estimatedMinutes = Math.ceil(locations.length * 2 + rules.length / 5);

    // Reachability analysis
    const reachability = locations.length > 0
      ? getReachabilitySummary(game, 0)
      : null;

    return {
      verbCount,
      nounCount,
      adjectiveCount,
      takeableObjects,
      containers,
      wearables,
      lightSources,
      characters,
      pro0Rules,
      pro1Rules,
      pro2Rules,
      enabledRules,
      darkLocations,
      totalExits,
      complexityScore,
      estimatedMinutes,
      reachability,
    };
  }, [game]);

  return (
    <div className="panel-content">
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px 0", color: "var(--green-bright)" }}>
          📊 Game Statistics
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
          Overview of your game's content and complexity
        </p>
      </div>

      {/* Overview */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>Overview</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "var(--green-bright)" }}>
              {Math.round(stats.complexityScore)}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Complexity Score</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "var(--blue-bright)" }}>
              {stats.estimatedMinutes} min
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Est. Play Time</div>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 600, color: "var(--amber-bright)" }}>
              {stats.enabledRules}/{(game.rules || []).length}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Active Rules</div>
          </div>
        </div>
      </div>

      {/* World Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>World Content</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total Locations</span>
            <span style={{ fontWeight: 600 }}>{(game.locations || []).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Dark Locations</span>
            <span style={{ fontWeight: 600 }}>{stats.darkLocations}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total Exits</span>
            <span style={{ fontWeight: 600 }}>{stats.totalExits}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Avg Exits/Room</span>
            <span style={{ fontWeight: 600 }}>
              {(game.locations || []).length > 0 ? (stats.totalExits / (game.locations || []).length).toFixed(1) : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Object Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>Objects & Characters</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total Objects</span>
            <span style={{ fontWeight: 600 }}>{(game.objects || []).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Characters (PSI)</span>
            <span style={{ fontWeight: 600 }}>{stats.characters}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Takeable Items</span>
            <span style={{ fontWeight: 600 }}>{stats.takeableObjects}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Containers</span>
            <span style={{ fontWeight: 600 }}>{stats.containers}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Wearable Items</span>
            <span style={{ fontWeight: 600 }}>{stats.wearables}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Light Sources</span>
            <span style={{ fontWeight: 600 }}>{stats.lightSources}</span>
          </div>
        </div>
      </div>

      {/* Rule Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>Game Logic</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total Rules</span>
            <span style={{ fontWeight: 600 }}>{(game.rules || []).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Enabled Rules</span>
            <span style={{ fontWeight: 600 }}>{stats.enabledRules}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>PRO0 (Commands)</span>
            <span style={{ fontWeight: 600 }}>{stats.pro0Rules}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>PRO1 (Intercept)</span>
            <span style={{ fontWeight: 600 }}>{stats.pro1Rules}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>PRO2 (Automatic)</span>
            <span style={{ fontWeight: 600 }}>{stats.pro2Rules}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Variables (Flags)</span>
            <span style={{ fontWeight: 600 }}>{(game.flags || []).length}</span>
          </div>
        </div>
      </div>

      {/* Vocabulary Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>Vocabulary</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Total Words</span>
            <span style={{ fontWeight: 600 }}>{(game.vocabulary || []).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Verbs</span>
            <span style={{ fontWeight: 600 }}>{stats.verbCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Nouns</span>
            <span style={{ fontWeight: 600 }}>{stats.nounCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Adjectives</span>
            <span style={{ fontWeight: 600 }}>{stats.adjectiveCount}</span>
          </div>
        </div>
      </div>

      {/* Content Stats */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>Additional Content</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Messages</span>
            <span style={{ fontWeight: 600 }}>{(game.messages || []).length}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Music Tracks</span>
            <span style={{ fontWeight: 600 }}>{(game.music || []).length}</span>
          </div>
        </div>
      </div>

      {/* Reachability Analysis */}
      {stats.reachability && (
        <div className="card">
          <h4 style={{ margin: "0 0 12px 0", color: "var(--amber-bright)" }}>Location Reachability</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Reachable Locations</span>
              <span style={{ fontWeight: 600, color: "var(--green-bright)" }}>
                {stats.reachability.reachableCount}/{stats.reachability.totalLocations}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Unreachable Locations</span>
              <span style={{
                fontWeight: 600,
                color: stats.reachability.unreachableCount > 0 ? "var(--red-bright)" : "var(--green-bright)"
              }}>
                {stats.reachability.unreachableCount}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Dead Ends</span>
              <span style={{ fontWeight: 600 }}>{stats.reachability.deadEnds.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>One-Way Connections</span>
              <span style={{ fontWeight: 600 }}>{stats.reachability.oneWayConnections.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Max Distance</span>
              <span style={{ fontWeight: 600 }}>{stats.reachability.maxDistance} steps</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Avg Distance</span>
              <span style={{ fontWeight: 600 }}>{stats.reachability.averageDistance.toFixed(1)} steps</span>
            </div>
          </div>

          {stats.reachability.unreachableCount > 0 && (
            <div style={{
              padding: 12,
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              border: "1px solid var(--red-bright)",
              borderRadius: 4,
              fontSize: 11
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--red-bright)" }}>
                ⚠️ Warning: {stats.reachability.unreachableCount} unreachable location(s)
              </div>
              <div style={{ color: "var(--text-dim)" }}>
                These locations cannot be reached from the starting location (ID: 0).
                Check the Validation panel for details.
              </div>
            </div>
          )}

          {stats.reachability.deadEnds.length > 0 && (
            <div style={{
              marginTop: 8,
              padding: 12,
              backgroundColor: "var(--bg-medium)",
              borderRadius: 4,
              fontSize: 11
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--amber-bright)" }}>
                ℹ️ Info: {stats.reachability.deadEnds.length} dead end(s) found
              </div>
              <div style={{ color: "var(--text-dim)" }}>
                These locations have no exits. Players won't be able to leave without special commands.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
