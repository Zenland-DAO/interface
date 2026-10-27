import { createZenlandClient } from "@zenland/sdk";

import { isSupportedChainId } from "@/lib/rpc";
import { zenlandServerConfig } from "@/lib/zenland";

/**
 * Confirmed protocol state per chain, built by the SDK's RPC sync.
 *
 * Browsers without a local cache start from this instead of scanning the
 * whole event history themselves (one slow eth_getLogs per visitor). The sync
 * lives in server memory, so after the first request only new blocks are read.
 */
export const dynamic = "force-dynamic";

const client = createZenlandClient(zenlandServerConfig);

export async function GET(request: Request) {
  const chainId = Number(new URL(request.url).searchParams.get("chainId"));
  if (!isSupportedChainId(chainId)) {
    return Response.json({ error: "Unsupported chainId" }, { status: 400 });
  }

  try {
    const snapshot = await client.rpc?.snapshot(chainId);
    if (!snapshot) return Response.json({ error: "Snapshot not available" }, { status: 503 });

    return new Response(snapshot, {
      headers: {
        "Content-Type": "application/json",
        // Snapshots only hold confirmed blocks; clients sync the rest themselves.
        "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
      },
    });
  } catch {
    return Response.json({ error: "RPC sync failed" }, { status: 502 });
  }
}
