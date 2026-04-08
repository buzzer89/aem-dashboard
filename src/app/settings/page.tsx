"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Server,
} from "lucide-react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { saveConfig, loadConfig, clearConfig } from "@/services/config-store";
import { testConnection } from "@/services/aem-client";
import type { AEMConfig } from "@/types/config";

type ConnectionResult = {
  ok: boolean;
  message: string;
  aemVersion?: string;
};

export default function SettingsPage() {
  const [instanceUrl, setInstanceUrl] = useState("");
  const [sitePath, setSitePath] = useState("");
  const [damPath, setDamPath] = useState("");
  const [authType, setAuthType] = useState<"basic" | "token">("basic");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [publishUrl, setPublishUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] =
    useState<ConnectionResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    const existing = loadConfig();
    if (existing) {
      setInstanceUrl(existing.instanceUrl ?? "");
      setSitePath(existing.sitePath ?? "");
      setDamPath(existing.damPath ?? "");
      setAuthType(existing.authType ?? "basic");
      setUsername(existing.username ?? "");
      setPassword(existing.password ?? "");
      setToken(existing.token ?? "");
      setPublishUrl(existing.publishUrl ?? "");
      setHasExisting(true);
    }
  }, []);

  function buildConfig(): AEMConfig {
    return {
      instanceUrl: instanceUrl.replace(/\/+$/, ""),
      sitePath: sitePath.replace(/\/+$/, "") || "/content",
      damPath: damPath.replace(/\/+$/, "") || undefined,
      authType,
      username: authType === "basic" ? username : undefined,
      password: authType === "basic" ? password : undefined,
      token: authType === "token" ? token : undefined,
      publishUrl: publishUrl || undefined,
    };
  }

  async function handleTestConnection() {
    setTesting(true);
    setConnectionResult(null);
    try {
      const result = await testConnection(buildConfig());
      setConnectionResult(result);
    } catch {
      setConnectionResult({ ok: false, message: "Unexpected error" });
    } finally {
      setTesting(false);
    }
  }

  function handleSave() {
    saveConfig(buildConfig());
    setSaved(true);
    setHasExisting(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDisconnect() {
    clearConfig();
    setInstanceUrl("");
    setSitePath("");
    setDamPath("");
    setUsername("");
    setPassword("");
    setToken("");
    setPublishUrl("");
    setConnectionResult(null);
    setHasExisting(false);
  }

  const canSave = instanceUrl.trim().length > 0 && sitePath.trim().length > 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-100">
              AEM Configuration
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Connect your AEM instance to fetch real data
            </p>
          </div>
        </div>

        {/* Connection status banner */}
        {hasExisting && (
          <div className="rounded-lg border border-green-800/50 bg-green-950/30 p-4 flex items-center gap-3">
            <Server className="h-5 w-5 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-300">
                Connected to AEM
              </p>
              <p className="text-xs text-green-400/70 truncate">
                {instanceUrl}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md border border-red-800/50 hover:bg-red-950/30 transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          {/* Instance URL */}
          <div>
            <label
              htmlFor="instanceUrl"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              AEM Instance URL <span className="text-red-400">*</span>
            </label>
            <input
              id="instanceUrl"
              type="url"
              placeholder="https://author.example.com"
              value={instanceUrl}
              onChange={(e) => setInstanceUrl(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              The author instance URL (e.g. https://author-pXXXX-eYYYY.adobeaemcloud.com)
            </p>
          </div>

          {/* Site Path */}
          <div>
            <label
              htmlFor="sitePath"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Site Content Path <span className="text-red-400">*</span>
            </label>
            <input
              id="sitePath"
              type="text"
              placeholder="/content/my-brand"
              value={sitePath}
              onChange={(e) => setSitePath(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only pages under this path will be scanned (e.g. /content/wknd, /content/my-brand/us/en)
            </p>
          </div>

          {/* DAM Path */}
          <div>
            <label
              htmlFor="damPath"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              DAM Path{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="damPath"
              type="text"
              placeholder="/content/dam/my-brand"
              value={damPath}
              onChange={(e) => setDamPath(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Defaults to /content/dam/&#123;site-name&#125; based on your site path above
            </p>
          </div>

          {/* Publish URL (optional) */}
          <div>
            <label
              htmlFor="publishUrl"
              className="block text-sm font-medium text-gray-300 mb-1.5"
            >
              Publish URL{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="publishUrl"
              type="url"
              placeholder="https://publish.example.com"
              value={publishUrl}
              onChange={(e) => setPublishUrl(e.target.value)}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          {/* Auth Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Authentication
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setAuthType("basic")}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  authType === "basic"
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                }`}
              >
                Basic Auth
              </button>
              <button
                onClick={() => setAuthType("token")}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  authType === "token"
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                }`}
              >
                Bearer Token
              </button>
            </div>
          </div>

          {/* Credentials */}
          {authType === "basic" ? (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Bearer Token
              </label>
              <div className="relative">
                <input
                  id="token"
                  type={showToken ? "text" : "password"}
                  placeholder="eyJhbGci..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Service account or developer token for AEM as a Cloud Service
              </p>
            </div>
          )}
        </div>

        {/* Test connection result */}
        {connectionResult && (
          <div
            className={`rounded-lg border p-4 flex items-start gap-3 ${
              connectionResult.ok
                ? "border-green-800/50 bg-green-950/30"
                : "border-red-800/50 bg-red-950/30"
            }`}
          >
            {connectionResult.ok ? (
              <CheckCircle className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  connectionResult.ok ? "text-green-300" : "text-red-300"
                }`}
              >
                {connectionResult.message}
              </p>
              {connectionResult.aemVersion && (
                <p className="text-xs text-gray-400 mt-0.5">
                  AEM Version: {connectionResult.aemVersion}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={!canSave || testing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Server className="h-4 w-4" />
            )}
            Test Connection
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Configuration"
            )}
          </button>
        </div>

        {/* Info note */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Note:</strong> Configuration is
            stored in your browser&apos;s local storage. The AEM proxy routes
            requests through this app&apos;s server to avoid CORS issues.
            Credentials are only sent to your configured AEM instance.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
