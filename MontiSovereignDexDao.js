// MONTIDROID: SovereignCode of HUMAN.JOHNCHARLESMONTI.COM.
/**
 * ============================================================================
 * MODULE      : MontiSovereignDexDao.js
 * LOCATION    : $HOME/engine_cluster/MontiSovereignDexDao.js
 * HARDWARE ID : MONTI_ANSI_F841005
 * CONTAINER   : F841005WV22ZL01
 * AUTHORITY   : MONTI^JOHN^CHARLES^MONTI
 * OPERATOR    : JOHN CHARLES MONTI (DOB: 02-11-1989)
 * POLICY      : PRECLUDE_TAW :: ZERO-TRUST NON-ROTATION
 * ============================================================================
 */

import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const CONFIG = Object.freeze({
  hardwareId: "MONTI_ANSI_F841005",
  container: "F841005WV22ZL01",
  authority: "MONTI^JOHN^CHARLES^MONTI",
  operator: "JOHN CHARLES MONTI",
  treasury: "0xb04110847A563E59F3D52d1aFB3304068173830b",
  quorumThreshold: 1, // Sovereign single-operator trust
  port: parseInt(process.env.DEX_PORT || "8480", 10)
});

class SovereignDexDaoCore {
  constructor() {
    this.liquidityPools = new Map();
    this.daoProposals = new Map();
    this.ledgerPath = path.join(process.env.HOME || "/data/data/io.montinode/files/home", "engine_cluster", "dispatch_ledger.jsonl");
    
    // Initialize default Sovereign liquidity pool (MONT/USDC equivalent)
    this.liquidityPools.set("MONT-USDC", {
      tokenA: "MONT",
      tokenB: "USDC",
      reserveA: 1000000.0,
      reserveB: 1618033.98, // Golden ratio anchored pricing
      feeRate: 0.003
    });
  }

  // --- DEX AMM SWAP ENGINE ---
  swap(pair, tokenIn, amountIn) {
    const pool = this.liquidityPools.get(pair);
    if (!pool) throw new Error("LiquidityPairNotFound");

    const amountInNum = parseFloat(amountIn);
    if (amountInNum <= 0) throw new Error("InvalidSwapAmount");

    const isTokenA = tokenIn === pool.tokenA;
    const reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
    const reserveOut = isTokenA ? pool.reserveB : pool.reserveA;

    const amountInWithFee = amountInNum * (1 - pool.feeRate);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    const amountOut = numerator / denominator;

    // Update pool reserves
    if (isTokenA) {
      pool.reserveA += amountInNum;
      pool.reserveB -= amountOut;
    } else {
      pool.reserveB += amountInNum;
      pool.reserveA -= amountOut;
    }

    const txSeal = "0x" + crypto.createHash("sha3-256").update(pair + tokenIn + amountInNum + Date.now()).digest("hex");
    
    this.commitToLedger({
      event: "DEX_SWAP_EXECUTED",
      pair,
      tokenIn,
      amountIn: amountInNum,
      amountOut,
      txSeal
    });

    return { status: "SUCCESS", pair, tokenIn, amountIn: amountInNum, amountOut, txSeal };
  }

  // --- DAO GOVERNANCE ENGINE ---
  createProposal(title, description, payloadData) {
    const proposalId = "PROP-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const proposal = {
      proposalId,
      title,
      description,
      payloadData,
      status: "ACTIVE",
      votesFor: 0,
      votesAgainst: 0,
      creator: CONFIG.authority,
      createdAt: new Date().toISOString()
    };

    this.daoProposals.set(proposalId, proposal);
    this.commitToLedger({ event: "DAO_PROPOSAL_CREATED", proposalId, title });
    return proposal;
  }

  voteOnProposal(proposalId, support, operatorProof) {
    const proposal = this.daoProposals.get(proposalId);
    if (!proposal) throw new Error("ProposalNotFound");
    if (proposal.status !== "ACTIVE") throw new Error("ProposalNotActive");
    if (operatorProof !== CONFIG.hardwareId) throw new Error("UnauthorizedOperatorProof");

    if (support) {
      proposal.votesFor += 1;
    } else {
      proposal.votesAgainst += 1;
    }

    if (proposal.votesFor >= CONFIG.quorumThreshold) {
      proposal.status = "EXECUTED";
    }

    this.commitToLedger({ event: "DAO_VOTE_CAST", proposalId, support, status: proposal.status });
    return proposal;
  }

  commitToLedger(recordData) {
    const entry = {
      ...recordData,
      hardwareId: CONFIG.hardwareId,
      container: CONFIG.container,
      authority: CONFIG.authority,
      policy: "PRECLUDE_TAW",
      timestamp: new Date().toISOString()
    };
    try {
      fs.appendFileSync(this.ledgerPath, JSON.stringify(entry) + "\n", "utf8");
    } catch (_) {}
  }
}

// --- HTTP SERVER DAEMON ---
const engine = new SovereignDexDaoCore();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Monti-Hardware-ID", CONFIG.hardwareId);
  res.setHeader("X-Monti-Authority", CONFIG.authority);

  if (url.pathname === "/v1/dex/pools" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ pools: Object.fromEntries(engine.liquidityPools) }));
  } else if (url.pathname === "/v1/dex/swap" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { pair, tokenIn, amountIn } = JSON.parse(body);
        const result = engine.swap(pair, tokenIn, amountIn);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else if (url.pathname === "/v1/dao/proposals" && req.method === "GET") {
    res.writeHead(200);
    res.end(JSON.stringify({ proposals: Object.fromEntries(engine.daoProposals) }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "EndpointNotFound", authority: CONFIG.authority }));
  }
});

server.listen(CONFIG.port, "127.0.0.1", () => {
  console.log(`[✓] Sovereign DEX/DAO Engine online on 127.0.0.1:${CONFIG.port}`);
});
