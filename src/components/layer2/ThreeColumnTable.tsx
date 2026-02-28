import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AUXILIARIES } from "../../data/auxiliaries.ts";
import type { AuxiliaryGroup, AuxiliaryVerbData } from "../../types/auxiliary.ts";

const GROUPS: { key: AuxiliaryGroup; label: string }[] = [
  { key: "A", label: "A 基本" },
  { key: "B", label: "B 完了" },
  { key: "C", label: "C 推量" },
  { key: "D", label: "D 受身等" },
];

interface RecallInputs {
  connection: string;
  conjugationType: string;
  meanings: string;
}

type CellStatus = "neutral" | "correct" | "incorrect";

interface RecallResult {
  connection: CellStatus;
  conjugationType: CellStatus;
  meanings: CellStatus;
}

function normalize(s: string): string {
  return s.replace(/\s+/g, "").replace(/[（）()・、,]/g, "").toLowerCase();
}

function checkField(input: string, expected: string): CellStatus {
  if (!input.trim()) return "incorrect";
  return normalize(input) === normalize(expected) ? "correct" : "incorrect";
}

function checkMeanings(input: string, expected: string[]): CellStatus {
  if (!input.trim()) return "incorrect";
  const inputNorm = normalize(input);
  const expectedNorm = normalize(expected.join(""));
  if (inputNorm === expectedNorm) return "correct";
  // Also accept if all expected meanings appear in input
  const allPresent = expected.every((m) => inputNorm.includes(normalize(m)));
  return allPresent ? "correct" : "incorrect";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function statusBorder(status: CellStatus): string {
  if (status === "correct") return "border-correct bg-correct/10";
  if (status === "incorrect") return "border-incorrect bg-incorrect/10";
  return "border-border";
}

export function ThreeColumnTable() {
  const [group, setGroup] = useState<AuxiliaryGroup>("A");
  const [recallMode, setRecallMode] = useState(false);
  const [inputs, setInputs] = useState<Record<string, RecallInputs>>({});
  const [results, setResults] = useState<Record<string, RecallResult>>({});
  const [checked, setChecked] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = useMemo(
    () => AUXILIARIES.filter((a) => a.group === group),
    [group],
  );

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const enterRecallMode = useCallback(() => {
    setRecallMode(true);
    setChecked(false);
    setResults({});
    setTimerSeconds(0);
    setTimerRunning(true);
    const init: Record<string, RecallInputs> = {};
    for (const a of AUXILIARIES.filter((x) => x.group === group)) {
      init[a.id] = { connection: "", conjugationType: "", meanings: "" };
    }
    setInputs(init);
  }, [group]);

  const exitRecallMode = useCallback(() => {
    setRecallMode(false);
    setChecked(false);
    setResults({});
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleInput = useCallback(
    (id: string, field: keyof RecallInputs, value: string) => {
      setInputs((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value },
      }));
    },
    [],
  );

  const handleCheck = useCallback(() => {
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const res: Record<string, RecallResult> = {};
    for (const a of items) {
      const inp = inputs[a.id];
      if (!inp) continue;
      res[a.id] = {
        connection: checkField(inp.connection, String(a.connection)),
        conjugationType: checkField(inp.conjugationType, a.conjugationType),
        meanings: checkMeanings(inp.meanings, a.meanings),
      };
    }
    setResults(res);
    setChecked(true);
  }, [items, inputs]);

  const score = useMemo(() => {
    if (!checked) return null;
    let total = 0;
    let correct = 0;
    for (const r of Object.values(results)) {
      total += 3;
      if (r.connection === "correct") correct++;
      if (r.conjugationType === "correct") correct++;
      if (r.meanings === "correct") correct++;
    }
    return { correct, total };
  }, [checked, results]);

  const switchGroup = useCallback(
    (g: AuxiliaryGroup) => {
      setGroup(g);
      if (recallMode) {
        setRecallMode(false);
        setChecked(false);
        setResults({});
        setTimerRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    },
    [recallMode],
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Group tabs */}
      <div className="flex gap-1">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => switchGroup(g.key)}
            className={`flex-1 px-2 py-1.5 border rounded text-xs transition-all ${
              group === g.key
                ? "bg-sumi-dark text-washi border-sumi-dark"
                : "bg-card text-text-secondary border-border"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={recallMode ? exitRecallMode : enterRecallMode}
          className={`px-3 py-1.5 rounded-md text-xs border transition-all ${
            recallMode
              ? "bg-sumi-dark text-washi border-sumi-dark"
              : "text-text-secondary border-border"
          }`}
        >
          {recallMode ? "参照に戻す" : "白紙再現"}
        </button>

        <div className="flex items-center gap-3">
          {recallMode && (
            <span
              className={`text-xs font-mono ${
                timerSeconds >= 300 ? "text-incorrect" : "text-text-secondary"
              }`}
            >
              {formatTime(timerSeconds)}
              <span className="text-muted ml-1">/ 5:00</span>
            </span>
          )}
          {score && (
            <span className="text-xs font-bold text-sumi-dark">
              {score.correct}/{score.total}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[60px_1fr_1fr_1fr] bg-sumi-dark text-washi text-[10px] tracking-wider">
          <div className="px-2 py-2 text-center">助動詞</div>
          <div className="px-2 py-2 text-center">接続</div>
          <div className="px-2 py-2 text-center">活用型</div>
          <div className="px-2 py-2 text-center">意味</div>
        </div>

        {/* Rows */}
        {items.map((a: AuxiliaryVerbData, i: number) => {
          const rowResult = results[a.id];
          return (
            <div
              key={a.id}
              className={`grid grid-cols-[60px_1fr_1fr_1fr] text-xs ${
                i % 2 === 0 ? "bg-card" : "bg-washi/50"
              }`}
            >
              {/* Name - always shown */}
              <div className="px-2 py-2 font-bold text-sumi-dark text-center border-r border-border">
                {a.word}
              </div>

              {recallMode ? (
                <>
                  <div className="px-1 py-1 border-r border-border">
                    <input
                      type="text"
                      value={inputs[a.id]?.connection ?? ""}
                      onChange={(e) =>
                        handleInput(a.id, "connection", e.target.value)
                      }
                      disabled={checked}
                      className={`w-full border rounded px-1.5 py-1 text-[11px] bg-white outline-none ${
                        checked && rowResult
                          ? statusBorder(rowResult.connection)
                          : "border-border focus:border-sumi-dark"
                      }`}
                      placeholder="接続"
                    />
                    {checked &&
                      rowResult?.connection === "incorrect" && (
                        <div className="text-[10px] text-incorrect mt-0.5 px-0.5">
                          {String(a.connection)}
                        </div>
                      )}
                  </div>
                  <div className="px-1 py-1 border-r border-border">
                    <input
                      type="text"
                      value={inputs[a.id]?.conjugationType ?? ""}
                      onChange={(e) =>
                        handleInput(a.id, "conjugationType", e.target.value)
                      }
                      disabled={checked}
                      className={`w-full border rounded px-1.5 py-1 text-[11px] bg-white outline-none ${
                        checked && rowResult
                          ? statusBorder(rowResult.conjugationType)
                          : "border-border focus:border-sumi-dark"
                      }`}
                      placeholder="活用型"
                    />
                    {checked &&
                      rowResult?.conjugationType === "incorrect" && (
                        <div className="text-[10px] text-incorrect mt-0.5 px-0.5">
                          {a.conjugationType}
                        </div>
                      )}
                  </div>
                  <div className="px-1 py-1">
                    <input
                      type="text"
                      value={inputs[a.id]?.meanings ?? ""}
                      onChange={(e) =>
                        handleInput(a.id, "meanings", e.target.value)
                      }
                      disabled={checked}
                      className={`w-full border rounded px-1.5 py-1 text-[11px] bg-white outline-none ${
                        checked && rowResult
                          ? statusBorder(rowResult.meanings)
                          : "border-border focus:border-sumi-dark"
                      }`}
                      placeholder="意味"
                    />
                    {checked &&
                      rowResult?.meanings === "incorrect" && (
                        <div className="text-[10px] text-incorrect mt-0.5 px-0.5">
                          {a.meanings.join("・")}
                        </div>
                      )}
                  </div>
                </>
              ) : (
                <>
                  <div className="px-2 py-2 text-text-secondary border-r border-border text-[11px]">
                    {String(a.connection)}
                  </div>
                  <div className="px-2 py-2 text-text-secondary border-r border-border text-[11px]">
                    {a.conjugationType}
                  </div>
                  <div className="px-2 py-2 text-text-secondary text-[11px]">
                    {a.meanings.join("・")}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Check button */}
      {recallMode && !checked && (
        <button
          type="button"
          onClick={handleCheck}
          className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm w-full"
        >
          判定
        </button>
      )}

      {checked && (
        <button
          type="button"
          onClick={enterRecallMode}
          className="bg-sumi-dark text-washi px-4 py-2 rounded-md text-sm w-full"
        >
          もう一度
        </button>
      )}
    </div>
  );
}
