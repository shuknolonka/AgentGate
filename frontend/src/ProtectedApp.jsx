import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  CircleDollarSign,
  Database,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";

const AGENTS = {
  research: {
    id: "research-agent-001",
    name: "Verified Research Agent",
    type: "research",
    wallet: "ALGO7K...9F2A",
    price: "$0.001",
    description:
      "Verified autonomous research agent",
  },

  unknown: {
    id: "unknown-agent-847",
    name: "Unknown Agent",
    type: "unknown",
    wallet: "ALGO3M...71BC",
    price: "$0.01",
    description:
      "Unverified machine consumer",
  },

  training: {
    id: "training-bot-001",
    name: "Training Crawler",
    type: "training",
    wallet: "ALGO9X...42DD",
    price: "$0.00",
    description:
      "Data harvesting / training crawler",
  },
};

function ProtectedApp({ onOpenGateway }) {
  const [selectedAgent, setSelectedAgent] =
    useState("research");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showAgentPanel, setShowAgentPanel] =
    useState(false);

  const agent = AGENTS[selectedAgent];

  async function requestProtectedData() {
    if (loading) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/research?agent_id=${encodeURIComponent(
          agent.id
        )}&agent_type=${encodeURIComponent(
          agent.type
        )}`
      );

      const data = await response.json();

      setResult({
        httpStatus: response.status,
        ...data,
      });
    } catch (error) {
      setResult({
        httpStatus: 0,
        status: "connection_error",
        message:
          "Could not connect to AgentGate.",
      });
    } finally {
      setLoading(false);
    }
  }

  const isBlocked =
    result?.decision === "BLOCK" ||
    result?.status === "blocked";

  const isPaymentRequired =
    result?.decision === "CHARGE" ||
    result?.status === "payment_required";

  const isAllowed =
    result?.decision === "ALLOW" ||
    result?.status === "allowed";

  return (
    <div className="protected-app">
      {/* ---------------------------------------------------------------- */}
      {/* NAVBAR                                                           */}
      {/* ---------------------------------------------------------------- */}

      <header className="market-navbar">
        <div className="market-brand">
          <div className="market-logo">
            <Activity size={20} />
          </div>

          <div>
            <div className="market-brand-name">
              MarketPulse
            </div>

            <div className="market-brand-subtitle">
              AI MARKET INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="market-nav-links">
          <span>Markets</span>
          <span>Analytics</span>
          <span>API</span>

          <button
            className="gateway-link"
            onClick={onOpenGateway}
          >
            <ShieldCheck size={15} />
            AgentGate
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* MAIN CONTENT                                                     */}
      {/* ---------------------------------------------------------------- */}

      <main className="market-main">
        <section className="market-hero">
          <div className="market-hero-copy">
            <div className="market-eyebrow">
              <span className="market-live-dot" />
              LIVE MARKET DATA
            </div>

            <h1>
              Intelligence for
              <br />
              <span>autonomous agents.</span>
            </h1>

            <p>
              MarketPulse provides premium market
              intelligence through a protected API
              built for autonomous software consumers.
            </p>

            <div className="hero-actions">
              <button
                className="protected-request-button"
                onClick={() =>
                  setShowAgentPanel(true)
                }
              >
                <Bot size={17} />
                Request Protected Data
                <ArrowRight size={16} />
              </button>

              <div className="protected-status">
                <ShieldCheck size={15} />
                Protected by AgentGate
              </div>
            </div>
          </div>

          <div className="hero-terminal">
            <div className="terminal-heading">
              <div className="terminal-dots">
                <span />
                <span />
                <span />
              </div>

              <span>
                marketpulse-api
              </span>
            </div>

            <div className="terminal-content">
              <div className="terminal-line">
                <span className="terminal-muted">
                  $
                </span>{" "}
                GET /api/market-data
              </div>

              <div className="terminal-line muted">
                <span>
                  Authorization: Agent
                </span>
              </div>

              <div className="terminal-line muted">
                <span>
                  Resource: premium-market-data
                </span>
              </div>

              <div className="terminal-gap" />

              <div className="terminal-line warning">
                <span>!</span>{" "}
                AgentGate inspection required
              </div>

              <div className="terminal-line">
                <span className="terminal-muted">
                  →
                </span>{" "}
                identity verification
              </div>

              <div className="terminal-line">
                <span className="terminal-muted">
                  →
                </span>{" "}
                policy evaluation
              </div>

              <div className="terminal-line">
                <span className="terminal-muted">
                  →
                </span>{" "}
                x402 payment
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* MARKET DATA                                                      */}
        {/* ---------------------------------------------------------------- */}

        <section className="market-section">
          <div className="market-section-heading">
            <div>
              <span>
                PREMIUM DATA FEED
              </span>

              <h2>
                Market intelligence
              </h2>
            </div>

            <div className="data-protected-label">
              <Lock size={14} />
              AGENT PROTECTED
            </div>
          </div>

          <div className="market-grid">
            <MarketCard
              symbol="BTC"
              name="Bitcoin"
              price="$112,450"
              change="+2.41%"
            />

            <MarketCard
              symbol="ETH"
              name="Ethereum"
              price="$4,820"
              change="+1.83%"
            />

            <MarketCard
              symbol="SOL"
              name="Solana"
              price="$210.40"
              change="+4.21%"
            />

            <MarketCard
              symbol="ALGO"
              name="Algorand"
              price="$0.31"
              change="+3.72%"
            />
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* AGENT REQUEST PANEL                                              */}
        {/* ---------------------------------------------------------------- */}

        {showAgentPanel && (
          <section className="agent-request-section">
            <div className="request-card">
              <div className="request-card-header">
                <div>
                  <span className="request-kicker">
                    AGENT REQUEST
                  </span>

                  <h2>
                    Autonomous access request
                  </h2>

                  <p>
                    Select the consumer attempting
                    to access the protected resource.
                  </p>
                </div>

                <button
                  className="close-request"
                  onClick={() =>
                    setShowAgentPanel(false)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="agent-selector">
                {Object.entries(AGENTS).map(
                  ([key, item]) => (
                    <button
                      key={key}
                      className={`agent-option ${
                        selectedAgent === key
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedAgent(key);
                        setResult(null);
                      }}
                    >
                      <div className="agent-option-icon">
                        <Bot size={18} />
                      </div>

                      <div className="agent-option-copy">
                        <strong>
                          {item.name}
                        </strong>

                        <span>
                          {item.description}
                        </span>
                      </div>

                      <ChevronRight
                        size={16}
                      />
                    </button>
                  )
                )}
              </div>

              <div className="request-details">
                <div className="request-detail">
                  <span>AGENT ID</span>
                  <strong>
                    {agent.id}
                  </strong>
                </div>

                <div className="request-detail">
                  <span>CLASSIFICATION</span>
                  <strong>
                    {agent.type}
                  </strong>
                </div>

                <div className="request-detail">
                  <span>WALLET</span>
                  <strong>
                    {agent.wallet}
                  </strong>
                </div>

                <div className="request-detail">
                  <span>RESOURCE</span>
                  <strong>
                    premium-market-data
                  </strong>
                </div>
              </div>

              <button
                className="agent-send-button"
                onClick={requestProtectedData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="request-spinner" />
                    AgentGate inspecting request...
                  </>
                ) : (
                  <>
                    <Zap size={17} />
                    Send Request Through AgentGate
                  </>
                )}
              </button>

              {/* -------------------------------------------------------- */}
              {/* AGENTGATE RESPONSE                                      */}
              {/* -------------------------------------------------------- */}

              {result && (
                <div className="gateway-result">
                  <div className="gateway-result-header">
                    <div>
                      <span>
                        AGENTGATE RESPONSE
                      </span>

                      <h3>
                        {isBlocked
                          ? "Request blocked"
                          : isPaymentRequired
                          ? "Payment required"
                          : isAllowed
                          ? "Access granted"
                          : "Gateway response"}
                      </h3>
                    </div>

                    <div
                      className={`result-status ${
                        isBlocked
                          ? "blocked"
                          : isPaymentRequired
                          ? "payment"
                          : "allowed"
                      }`}
                    >
                      HTTP{" "}
                      {result.httpStatus ||
                        "—"}
                    </div>
                  </div>

                  <div className="gateway-flow">
                    <GatewayStep
                      icon={ShieldCheck}
                      title="Identity"
                      value={
                        agent.type
                      }
                      complete={!isBlocked}
                    />

                    <ArrowRight size={15} />

                    <GatewayStep
                      icon={Shield}
                      title="Policy"
                      value={
                        isBlocked
                          ? "BLOCK"
                          : "CHARGE"
                      }
                      complete={!isBlocked}
                      blocked={isBlocked}
                    />

                    <ArrowRight size={15} />

                    <GatewayStep
                      icon={CircleDollarSign}
                      title="Pricing"
                      value={
                        result.price_usd
                          ? `$${result.price_usd}`
                          : agent.price
                      }
                      complete={!isBlocked}
                    />

                    <ArrowRight size={15} />

                    <GatewayStep
                      icon={Wallet}
                      title="x402"
                      value={
                        isBlocked
                          ? "SKIPPED"
                          : isPaymentRequired
                          ? "402"
                          : "PAID"
                      }
                      complete={!isBlocked}
                    />

                    <ArrowRight size={15} />

                    <GatewayStep
                      icon={Database}
                      title="Resource"
                      value={
                        isBlocked
                          ? "DENIED"
                          : isPaymentRequired
                          ? "WAITING"
                          : "GRANTED"
                      }
                      complete={isAllowed}
                      blocked={isBlocked}
                    />
                  </div>

                  {/* x402 explanation */}
                  {isPaymentRequired && (
                    <div className="x402-box">
                      <div className="x402-icon">
                        <Wallet size={21} />
                      </div>

                      <div className="x402-copy">
                        <div className="x402-label">
                          HTTP 402 · PAYMENT REQUIRED
                        </div>

                        <h4>
                          Agent payment required
                        </h4>

                        <p>
                          AgentGate has approved this
                          agent but the protected
                          resource requires machine
                          payment before access.
                        </p>

                        <div className="payment-flow">
                          <span>
                            Agent
                          </span>

                          <ArrowRight size={14} />

                          <strong>
                            ${result.price_usd || "0.001"}
                          </strong>

                          <ArrowRight size={14} />

                          <span>
                            AgentGate
                          </span>

                          <ArrowRight size={14} />

                          <span>
                            Resource
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {isBlocked && (
                    <div className="blocked-box">
                      <div className="blocked-icon">
                        <X size={20} />
                      </div>

                      <div>
                        <strong>
                          Access denied by policy
                        </strong>

                        <p>
                          Training crawlers are not
                          permitted to access this
                          protected resource. No
                          payment was requested.
                        </p>
                      </div>
                    </div>
                  )}

                  {isAllowed && (
                    <div className="allowed-box">
                      <div className="allowed-icon">
                        <Check size={20} />
                      </div>

                      <div>
                        <strong>
                          Protected resource unlocked
                        </strong>

                        <p>
                          AgentGate approved the
                          request and the protected
                          API returned the requested
                          data.
                        </p>
                      </div>
                    </div>
                  )}

                  <details className="raw-response">
                    <summary>
                      View raw gateway response
                    </summary>

                    <pre>
                      {JSON.stringify(
                        result,
                        null,
                        2
                      )}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* EXPLANATION                                                      */}
        {/* ---------------------------------------------------------------- */}

        <section className="market-explanation">
          <div className="explanation-card">
            <div className="explanation-icon">
              <ShieldCheck size={20} />
            </div>

            <div>
              <span>
                PROTECTED BY AGENTGATE
              </span>

              <h3>
                Built for autonomous commerce
              </h3>

              <p>
                MarketPulse does not need to
                understand every type of AI agent.
                AgentGate sits between the agent
                and the protected resource and
                handles identity, policy, pricing
                and machine payment.
              </p>
            </div>
          </div>

          <div className="explanation-points">
            <div>
              <ShieldCheck size={16} />
              Cryptographic identity
            </div>

            <div>
              <Lock size={16} />
              Programmable policies
            </div>

            <div>
              <CircleDollarSign size={16} />
              Agent-specific pricing
            </div>

            <div>
              <Wallet size={16} />
              x402 machine payments
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MARKET CARD                                                                */
/* -------------------------------------------------------------------------- */

function MarketCard({
  symbol,
  name,
  price,
  change,
}) {
  return (
    <div className="market-card">
      <div className="market-card-top">
        <div className="asset-icon">
          {symbol.slice(0, 1)}
        </div>

        <span className="asset-symbol">
          {symbol}
        </span>

        <span className="asset-change">
          {change}
        </span>
      </div>

      <div className="asset-name">
        {name}
      </div>

      <div className="asset-price">
        {price}
      </div>

      <div className="asset-protection">
        <Lock size={12} />
        Premium API data
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* GATEWAY STEP                                                               */
/* -------------------------------------------------------------------------- */

function GatewayStep({
  icon: Icon,
  title,
  value,
  complete,
  blocked,
}) {
  return (
    <div
      className={`gateway-step ${
        complete ? "complete" : ""
      } ${blocked ? "blocked" : ""}`}
    >
      <div className="gateway-step-icon">
        {blocked ? (
          <X size={15} />
        ) : complete ? (
          <Check size={15} />
        ) : (
          <Icon size={15} />
        )}
      </div>

      <span>{title}</span>

      <strong>{value}</strong>
    </div>
  );
}

export default ProtectedApp;