/* eslint-disable */
/**
 * MongoDB connection diagnostic for GlobeTrotter (layered).
 *
 *   node scripts/test-connection.js
 *
 * Runs four independent probes so a single run pinpoints WHICH layer is
 * failing, instead of guessing:
 *   A. SRV DNS lookup        — can we even resolve the cluster hosts?
 *   B. Control TLS (:443)    — does outbound TLS work AT ALL from here?
 *   C. Mongo TLS (:27017)    — does TLS to the Atlas port work? whose cert?
 *   D. Full mongoose connect — the real thing the seed does.
 *
 * Uses only Node built-ins + the already-installed mongoose. No new installs.
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config(); // fallback to .env
const tls = require("tls");
const dns = require("dns").promises;
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;

function redact(u) {
  if (!u) return "(not set)";
  return u.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
}

function parseUri(u) {
  const isSrv = u.startsWith("mongodb+srv://");
  const withoutScheme = u.replace(/^mongodb(\+srv)?:\/\//, "");
  const at = withoutScheme.lastIndexOf("@");
  const afterAuth = at >= 0 ? withoutScheme.slice(at + 1) : withoutScheme;
  const hostPart = afterAuth.split(/[/?]/)[0];
  const hosts = hostPart.split(",").map((h) => {
    const [name, port] = h.split(":");
    return { name, port: port ? parseInt(port, 10) : isSrv ? null : 27017 };
  });
  return { isSrv, hosts };
}

// Connect with rejectUnauthorized:false so we can still INSPECT the cert we
// were handed, even if a middlebox replaced it.
function tlsProbe(host, port, servername = host, timeout = 8000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (!done) { done = true; resolve(v); } };
    const socket = tls.connect({ host, port, servername, rejectUnauthorized: false }, () => {
      const c = socket.getPeerCertificate() || {};
      finish({
        ok: true,
        protocol: socket.getProtocol(),
        authorized: socket.authorized,
        authError: socket.authorizationError ? String(socket.authorizationError) : null,
        issuer: c.issuer ? c.issuer.O || c.issuer.CN || JSON.stringify(c.issuer) : "(none)",
        subject: c.subject ? c.subject.CN || JSON.stringify(c.subject) : "(none)",
      });
      socket.end();
    });
    socket.setTimeout(timeout, () => { socket.destroy(); finish({ ok: false, error: `timed out after ${timeout}ms` }); });
    socket.on("error", (e) => finish({ ok: false, error: e.message }));
  });
}

const KNOWN_CAS = ["digicert", "amazon", "let's encrypt", "isrg", "globalsign", "sectigo", "google trust"];

console.log("──────────────────────────────────────────────");
console.log(" GlobeTrotter · MongoDB connection diagnostic");
console.log("──────────────────────────────────────────────");
console.log(" Node version :", process.version);
console.log(" OpenSSL      :", process.versions.openssl);
console.log(" MONGODB_URI  :", redact(uri));
console.log(" Scheme       :", uri ? (uri.startsWith("mongodb+srv") ? "SRV" : "standard") : "—");
console.log("──────────────────────────────────────────────\n");

if (!uri) {
  console.error("✖ MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  process.exit(1);
}

(async () => {
  const parsed = parseUri(uri);
  let target = null;
  const results = { srv: null, ctrl: null, mongoTls: null, driver: null };

  // ── A. SRV DNS ────────────────────────────────────────────────
  console.log("A. SRV DNS lookup");
  if (parsed.isSrv) {
    try {
      const recs = await dns.resolveSrv("_mongodb._tcp." + parsed.hosts[0].name);
      console.log("   ✓ resolved:", recs.map((r) => `${r.name}:${r.port}`).join(", "));
      target = { name: recs[0].name, port: recs[0].port };
      results.srv = true;
    } catch (e) {
      console.log("   ✖ failed:", e.message);
      console.log("     → Network may block SRV DNS. Use the standard (non-SRV) string from Atlas.");
      results.srv = false;
    }
  } else {
    target = parsed.hosts[0];
    console.log("   • standard URI, using host:", `${target.name}:${target.port}`);
  }

  // ── B. Control TLS to a normal HTTPS site ─────────────────────
  console.log("\nB. Control TLS  →  www.mongodb.com:443");
  results.ctrl = await tlsProbe("www.mongodb.com", 443);
  if (results.ctrl.ok) {
    console.log(`   ✓ handshake ok (${results.ctrl.protocol}), cert issuer: ${results.ctrl.issuer}`);
  } else {
    console.log("   ✖ failed:", results.ctrl.error);
  }

  // ── C. Raw TLS to the Atlas Mongo port ────────────────────────
  console.log("\nC. Mongo TLS   →  " + (target ? `${target.name}:${target.port}` : "(skipped — no host)"));
  if (target) {
    results.mongoTls = await tlsProbe(target.name, target.port);
    if (results.mongoTls.ok) {
      console.log(`   ✓ handshake ok (${results.mongoTls.protocol})`);
      console.log(`     cert subject: ${results.mongoTls.subject}`);
      console.log(`     cert issuer : ${results.mongoTls.issuer}`);
      if (results.mongoTls.authError) console.log(`     ⚠ cert not trusted: ${results.mongoTls.authError}`);
    } else {
      console.log("   ✖ failed:", results.mongoTls.error);
    }
  }

  // ── D. Full mongoose connect (what the seed does) ─────────────
  console.log("\nD. Full mongoose connect + ping");
  const t0 = Date.now();
  try {
    await mongoose.connect(uri, { dbName: "globetrotter", serverSelectionTimeoutMS: 8000 });
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(`   ✓ connected + pinged in ${Date.now() - t0}ms`);
    results.driver = true;
    await mongoose.disconnect();
  } catch (err) {
    console.log("   ✖ failed:", err && err.message ? err.message : err);
    results.driver = false;
    try { await mongoose.disconnect(); } catch {}
  }

  // ── Verdict ───────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════");
  console.log(" VERDICT");
  console.log("══════════════════════════════════════════════");

  if (results.driver) {
    console.log(" ✓ Everything works. Run:  npm run seed");
    process.exit(0);
  }

  const ctrlOk = results.ctrl && results.ctrl.ok;
  const mongoOk = results.mongoTls && results.mongoTls.ok;
  const issuer = (results.mongoTls && results.mongoTls.issuer || "").toLowerCase();
  const issuerLooksReplaced =
    mongoOk && issuer !== "(none)" && !KNOWN_CAS.some((ca) => issuer.includes(ca));

  if (!ctrlOk && !mongoOk) {
    console.log(" ✖ Outbound TLS is broken for EVERYTHING, not just Mongo.");
    console.log("   → This is local (antivirus/firewall doing TLS inspection) or a Node/OpenSSL");
    console.log("     issue on this machine. Most likely fix, in order:");
    console.log("     1. Disable your antivirus's 'encrypted/HTTPS/SSL connection scanning'.");
    console.log("        (Kaspersky, ESET, Avast, Bitdefender all do this and cause alert 80.)");
    console.log("     2. Try a mobile hotspot (rules out the network).");
    console.log("     3. Update Node to the current 20 or 22 LTS.");
  } else if (ctrlOk && !mongoOk) {
    console.log(" ✖ Normal HTTPS works, but TLS to the Atlas Mongo port is rejected.");
    console.log("   → Something specifically blocks/mangles port 27017, OR your IP isn't allowed.");
    console.log("     1. Atlas → Security → Network Access → add 0.0.0.0/0, wait 1 min, retry.");
    console.log("     2. Your firewall/network likely blocks outbound 27017 — try a mobile hotspot.");
    console.log("     3. If it works on hotspot, the original network is the cause.");
  } else if (issuerLooksReplaced) {
    console.log(" ✖ TLS interception detected — the certificate was REPLACED.");
    console.log(`   The Atlas cert should be issued by DigiCert/Amazon/Let's Encrypt, but you got:`);
    console.log(`     issuer = ${results.mongoTls.issuer}`);
    console.log("   → An antivirus or corporate proxy is man-in-the-middling TLS. Disable its");
    console.log("     'encrypted connection scanning', or use a mobile hotspot.");
  } else if (mongoOk && !results.driver) {
    console.log(" ✖ TLS to Atlas is fine, but the driver still can't complete the connection.");
    console.log("   → Likely IP Access List or credentials:");
    console.log("     1. Atlas → Network Access → add 0.0.0.0/0.");
    console.log("     2. Check DB user/password; URL-encode @ # / : ? in the password.");
    console.log("     3. Make sure the M0 cluster isn't paused (Atlas → Resume).");
  } else {
    console.log(" ✖ Connection failed — see the raw errors in steps A–D above.");
  }
  console.log("");
  process.exit(1);
})();
