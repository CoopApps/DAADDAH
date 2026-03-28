import { DaadGame, Location } from "../types/daad";

export interface ReachabilityAnalysis {
  reachableLocations: Set<number>;
  unreachableLocations: number[];
  locationDistance: Map<number, number>;
  locationPaths: Map<number, number[]>;
}

/**
 * Performs a breadth-first search to find all reachable locations from the starting location
 */
export function analyzeReachability(game: DaadGame, startLocationId: number = 0): ReachabilityAnalysis {
  const reachableLocations = new Set<number>();
  const locationDistance = new Map<number, number>();
  const locationPaths = new Map<number, number[]>();
  const queue: Array<{ id: number; distance: number; path: number[] }> = [];

  // Start from the initial location
  queue.push({ id: startLocationId, distance: 0, path: [startLocationId] });
  reachableLocations.add(startLocationId);
  locationDistance.set(startLocationId, 0);
  locationPaths.set(startLocationId, [startLocationId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const location = game.locations.find((l) => l.id === current.id);

    if (!location) continue;

    // Explore all exits
    Object.values(location.exits).forEach((targetId) => {
      if (targetId !== null && !reachableLocations.has(targetId)) {
        reachableLocations.add(targetId);
        const newDistance = current.distance + 1;
        const newPath = [...current.path, targetId];

        locationDistance.set(targetId, newDistance);
        locationPaths.set(targetId, newPath);
        queue.push({ id: targetId, distance: newDistance, path: newPath });
      }
    });
  }

  // Find unreachable locations
  const unreachableLocations = game.locations
    .map((l) => l.id)
    .filter((id) => !reachableLocations.has(id));

  return {
    reachableLocations,
    unreachableLocations,
    locationDistance,
    locationPaths,
  };
}

/**
 * Gets the shortest path between two locations
 */
export function getShortestPath(game: DaadGame, fromId: number, toId: number): number[] | null {
  const analysis = analyzeReachability(game, fromId);
  return analysis.locationPaths.get(toId) || null;
}

/**
 * Checks if there are any isolated location clusters (disconnected subgraphs)
 */
export function findIsolatedClusters(game: DaadGame): number[][] {
  const visited = new Set<number>();
  const clusters: number[][] = [];

  // Build location map for O(1) lookup
  const locationMap = new Map(game.locations.map((loc) => [loc.id, loc]));

  // Build bidirectional graph for O(1) lookups instead of O(n) searches
  const incomingConnections = new Map<number, Set<number>>();
  game.locations.forEach((loc) => {
    Object.values(loc.exits).forEach((targetId) => {
      if (targetId !== null) {
        if (!incomingConnections.has(targetId)) {
          incomingConnections.set(targetId, new Set());
        }
        incomingConnections.get(targetId)!.add(loc.id);
      }
    });
  });

  game.locations.forEach((loc) => {
    if (visited.has(loc.id)) return;

    // Find all locations reachable from this one
    const cluster: number[] = [];
    const queue = [loc.id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      cluster.push(currentId);

      const current = locationMap.get(currentId);
      if (!current) continue;

      // Add all connected locations (both outgoing and incoming connections)
      Object.values(current.exits).forEach((targetId) => {
        if (targetId !== null && !visited.has(targetId)) {
          queue.push(targetId);
        }
      });

      // Add incoming connections using pre-built map
      const incoming = incomingConnections.get(currentId);
      if (incoming) {
        incoming.forEach((incomingId) => {
          if (!visited.has(incomingId)) {
            queue.push(incomingId);
          }
        });
      }
    }

    if (cluster.length > 0) {
      clusters.push(cluster);
    }
  });

  return clusters;
}

/**
 * Finds dead ends (locations with no exits)
 */
export function findDeadEnds(game: DaadGame): number[] {
  return game.locations
    .filter((loc) => {
      const hasAnyExit = Object.values(loc.exits).some((exit) => exit !== null);
      return !hasAnyExit;
    })
    .map((loc) => loc.id);
}

/**
 * Finds one-way connections (A->B exists but B->A doesn't)
 */
export function findOneWayConnections(game: DaadGame): Array<{ from: number; to: number }> {
  const oneWayConnections: Array<{ from: number; to: number }> = [];

  game.locations.forEach((loc) => {
    Object.entries(loc.exits).forEach(([direction, targetId]) => {
      if (targetId === null) return;

      const targetLoc = game.locations.find((l) => l.id === targetId);
      if (!targetLoc) return;

      // Get the opposite direction
      const oppositeDirection = getOppositeDirection(direction);
      if (!oppositeDirection) return;

      const hasReverseConnection = targetLoc.exits[oppositeDirection] === loc.id;

      if (!hasReverseConnection) {
        oneWayConnections.push({ from: loc.id, to: targetId });
      }
    });
  });

  return oneWayConnections;
}

function getOppositeDirection(direction: string): string | null {
  const opposites: Record<string, string> = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
    northeast: "southwest",
    northwest: "southeast",
    southeast: "northwest",
    southwest: "northeast",
    up: "down",
    down: "up",
    in: "out",
    out: "in",
  };
  return opposites[direction] || null;
}

/**
 * Get a summary of reachability statistics
 */
export function getReachabilitySummary(game: DaadGame, startLocationId: number = 0) {
  const analysis = analyzeReachability(game, startLocationId);
  const deadEnds = findDeadEnds(game);
  const oneWayConnections = findOneWayConnections(game);
  const clusters = findIsolatedClusters(game);

  const maxDistance = Array.from(analysis.locationDistance.values()).reduce(
    (max, dist) => Math.max(max, dist),
    0
  );

  return {
    totalLocations: game.locations.length,
    reachableCount: analysis.reachableLocations.size,
    unreachableCount: analysis.unreachableLocations.length,
    unreachableLocations: analysis.unreachableLocations,
    deadEnds,
    oneWayConnections,
    maxDistance,
    averageDistance:
      analysis.locationDistance.size > 0
        ? Array.from(analysis.locationDistance.values()).reduce((a, b) => a + b, 0) /
          analysis.locationDistance.size
        : 0,
    clusterCount: clusters.length,
    largestClusterSize: clusters.reduce((max, cluster) => Math.max(max, cluster.length), 0),
  };
}
