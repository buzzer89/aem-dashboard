export interface AEMConfig {
  instanceUrl: string; // e.g. "https://author.example.com"
  sitePath: string; // e.g. "/content/my-brand" — scopes all queries to this site
  damPath?: string; // e.g. "/content/dam/my-brand" — defaults to sitePath with /dam/ prefix
  authType: "basic" | "token";
  username?: string;
  password?: string;
  token?: string;
  anthropicApiKey?: string;
  publishUrl?: string; // optional: separate publish instance
}

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  aemVersion?: string;
  instanceType?: "author" | "publish" | "unknown";
}
