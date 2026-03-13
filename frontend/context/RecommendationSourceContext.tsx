"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { PipelineResult, RecommendationSourceSelector } from "@/lib/types";

type RecommendationMode = "dataset" | "iteration";

interface RecommendationSourceContextValue {
  mode: RecommendationMode;
  setMode: (mode: RecommendationMode) => void;
  pipelineResult: PipelineResult | null;
  selectedIteration: number | null;
  setSelectedIteration: (iteration: number) => void;
  sourceSelector?: RecommendationSourceSelector;
  sourceLabel: string;
  refreshPipelineSource: () => Promise<void>;
  hasIterationSource: boolean;
}

const RecommendationSourceContext = createContext<RecommendationSourceContextValue | undefined>(undefined);

function getDefaultIteration(result: PipelineResult | null): number | null {
  if (!result?.iterations?.length) {
    return null;
  }
  return result.iterations[result.iterations.length - 1]?.iteration ?? null;
}

export function RecommendationSourceProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setModeState] = useState<RecommendationMode>("dataset");
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [selectedIteration, setSelectedIterationState] = useState<number | null>(null);

  const refreshPipelineSource = useCallback(async () => {
    try {
      const latest = await api.pipeline.iterations();
      setPipelineResult(latest);
      setSelectedIterationState((prev) => prev ?? getDefaultIteration(latest));
    } catch {
      setPipelineResult(null);
      setSelectedIterationState(null);
      setModeState("dataset");
    }
  }, []);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => {
      void refreshPipelineSource();
    }, 0);
    return () => globalThis.clearTimeout(timer);
  }, [refreshPipelineSource]);

  const setMode = useCallback((nextMode: RecommendationMode) => {
    if (nextMode === "iteration" && (!pipelineResult?.run_id || selectedIteration === null)) {
      return;
    }
    setModeState(nextMode);
  }, [pipelineResult?.run_id, selectedIteration]);

  const setSelectedIteration = useCallback((iteration: number) => {
    setSelectedIterationState(iteration);
  }, []);

  const hasIterationSource = Boolean(pipelineResult?.run_id && selectedIteration !== null);
  const runId = pipelineResult?.run_id;

  const sourceSelector = useMemo<RecommendationSourceSelector | undefined>(() => {
    if (mode !== "iteration" || !runId || selectedIteration === null) {
      return undefined;
    }
    return {
      run_id: runId,
      iteration: selectedIteration,
    };
  }, [mode, runId, selectedIteration]);

  const sourceLabel = useMemo(() => {
    if (mode !== "iteration" || selectedIteration === null) {
      return "Dataset A";
    }
    const selected = pipelineResult?.iterations?.find((it) => it.iteration === selectedIteration);
    if (!selected) {
      return `Iteration v${selectedIteration}`;
    }
    return `Iteration v${selectedIteration} (${selected.dataset_label})`;
  }, [mode, pipelineResult?.iterations, selectedIteration]);

  const value = useMemo(() => ({
    mode,
    setMode,
    pipelineResult,
    selectedIteration,
    setSelectedIteration,
    sourceSelector,
    sourceLabel,
    refreshPipelineSource,
    hasIterationSource,
  }), [
    mode,
    setMode,
    pipelineResult,
    selectedIteration,
    setSelectedIteration,
    sourceSelector,
    sourceLabel,
    refreshPipelineSource,
    hasIterationSource,
  ]);

  return <RecommendationSourceContext.Provider value={value}>{children}</RecommendationSourceContext.Provider>;
}

export function useRecommendationSource() {
  const ctx = useContext(RecommendationSourceContext);
  if (!ctx) {
    throw new Error("useRecommendationSource must be used within RecommendationSourceProvider");
  }
  return ctx;
}
