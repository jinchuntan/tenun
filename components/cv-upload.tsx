"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractTextFromFile, getFileType } from "@/lib/file-extractors";
import { ParseResult } from "@/lib/resume-parser";
import { UserProfile } from "@/lib/types";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type UploadState = "idle" | "dragging" | "parsing" | "success" | "error";

interface CVUploadProps {
  onProfileExtracted: (profile: Partial<UserProfile>) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function CVUpload({ onProfileExtracted }: CVUploadProps) {
  const { dict } = useLanguage();
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      const fileType = getFileType(file);
      if (!fileType) {
        setState("error");
        setError(dict.cvUpload.errUnsupported);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setState("error");
        setError(dict.cvUpload.errTooLarge);
        return;
      }

      setState("parsing");
      setFileName(file.name);
      setError("");

      try {
        const rawText = await extractTextFromFile(file);

        if (!rawText.trim()) {
          setState("error");
          setError(dict.cvUpload.errNoText);
          return;
        }

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: rawText }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || dict.cvUpload.errParseFailed);
        }

        const result: ParseResult = await response.json();

        // Attach raw text to the profile so the dashboard can use it
        result.profile.resumeText = rawText;

        setParseResult(result);
        onProfileExtracted(result.profile);
        setState("success");
      } catch (err) {
        setState("error");
        setError(
          err instanceof Error ? err.message : dict.cvUpload.errProcess
        );
      }
    },
    [onProfileExtracted, dict]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((prev) => (prev === "dragging" ? "idle" : prev));
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const reset = () => {
    setState("idle");
    setFileName("");
    setError("");
    setParseResult(null);
  };

  const filledCount = parseResult
    ? Object.values(parseResult.confidence).filter(Boolean).length
    : 0;
  const totalFields = parseResult
    ? Object.values(parseResult.confidence).length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="w-5 h-5 text-navy-600" />
          {dict.cvUpload.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Idle / Dragging State */}
          {(state === "idle" || state === "dragging") && (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                  state === "dragging"
                    ? "border-gold-400 bg-gold-50/50"
                    : "border-navy-200 hover:border-navy-400 hover:bg-navy-50/30"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp
                  className={`w-10 h-10 mx-auto mb-3 ${
                    state === "dragging" ? "text-gold-500" : "text-navy-400"
                  }`}
                />
                <p className="text-sm font-medium text-navy-700 mb-1">
                  {dict.cvUpload.dragDrop}
                </p>
                <p className="text-xs text-navy-400 mb-3">{dict.cvUpload.or}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {dict.cvUpload.browseFiles}
                </Button>
                <p className="text-xs text-navy-400 mt-3">
                  {dict.cvUpload.fileTypes}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileInput}
                className="hidden"
              />
            </motion.div>
          )}

          {/* Parsing State */}
          {state === "parsing" && (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-3 py-10"
            >
              <Loader2 className="w-5 h-5 text-navy-600 animate-spin" />
              <span className="text-sm text-navy-600">
                {dict.cvUpload.parsing.replace("{name}", fileName)}
              </span>
            </motion.div>
          )}

          {/* Success State */}
          {state === "success" && parseResult && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-navy-800">
                    {fileName}
                  </p>
                  <p className="text-xs text-navy-500">
                    {dict.cvUpload.autoFilled.replace("{filled}", String(filledCount)).replace("{total}", String(totalFields))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {Object.entries(parseResult.confidence).map(
                  ([field, detected]) => (
                    <div
                      key={field}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md ${
                        detected
                          ? "bg-green-50 text-green-700"
                          : "bg-navy-50 text-navy-400"
                      }`}
                    >
                      {detected ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <span className="w-3 h-3 text-center leading-3">
                          &times;
                        </span>
                      )}
                      {dict.cvUpload.fieldLabels[field as keyof typeof dict.cvUpload.fieldLabels] || field}
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={reset}
                className="text-xs text-navy-500 hover:text-navy-700 underline transition-colors"
              >
                {dict.cvUpload.uploadDifferent}
              </button>
            </motion.div>
          )}

          {/* Error State */}
          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-6"
            >
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-3">{error}</p>
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                {dict.cvUpload.tryAgain}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-navy-400 mt-3">
          {dict.cvUpload.localNote}
        </p>
      </CardContent>
    </Card>
  );
}
