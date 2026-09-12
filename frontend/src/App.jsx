import ProtectedApp from "./ProtectedApp";
import "./protected-app.css";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Cpu,
  Database,
  Fingerprint,
  Gauge,
  Globe,
  Lock,
  Network,
  Play,
  RefreshCw,
  Shield,
  ShieldCheck,
  Terminal,
  UserRound,
  Wallet,
  X,
  Zap,
} from "lucide-react";

const API_BASE = "";

const SCENARIOS = {
  research: {
    id: "research-agent-001",
    name: "Verified Research Agent",
    type: "research",
    wallet: "ALGO7K...9F2A",
    description: "Verified machine consumer",
    decision: "CHARGE",
    price: "$0.001",
    color: "blue",
  },

  unknown: {
    id: "unknown-agent-847",
    name: "Unknown Agent",
    type: "unknown",
    wallet: "ALGO3M...71BC",
    description: "Unverified machine consumer",
    decision: "CHARGE",
    price: "$0.01",
    color: "amber",
  },

  training: {
    id: "training-bot-001",
    name: "Training Crawler",
    type: "training",
    wallet: "ALGO9X...42DD",
    description: "Data harvesting / training crawler",
    decision: "BLOCK",
    price: "$0.00",
    color: "red",
  },

  human: {
    id: "human-user-001",
    name: "Human User",
    type: "human",
    wallet: "Browser Session",
    description: "Human consumer",
    decision: "ALLOW",
    price: "FREE",
    color: "green",
  },
};

const PIPELINE = [
  {
    key: "request",
    title: "REQUEST",
    subtitle: "Incoming API call",
    icon: Globe,
  },
  {
    key: "identity",
    title: "IDENTITY",
    subtitle: "Identify agent",
    icon: Fingerprint,
  },
  {
    key: "verify",
    title: "VERIFY",
    subtitle: "Cryptographic proof",
    icon: ShieldCheck,
  },
  {
    key: "policy",
    title: "POLICY",
    subtitle: "Evaluate rules",
    icon: Lock,
  },
  {
    key: "rate",
    title: "RATE LIMIT",
    subtitle: "Check limits",
    icon: Gauge,
  },
  {
    key: "pricing",
    title: "PRICING",
    subtitle: "Calculate price",
    icon: CircleDollarSign,
  },
  {
    key: "payment",
    title: "x402",
    subtitle: "Machine payment",
    icon: Wallet,
  },
  {
    key: "resource",
    title: "RESOURCE",
    subtitle: "Protected API",
    icon: Database,
  },
];

function App() {
  const [activePage, setActivePage] = useState("demo");
  const [selectedScenario, setSelectedScenario] = useState("research");
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [apiResult, setApiResult] = useState(null);

  // Controls whether we show the protected demo application
  // or the AgentGate control plane.
  const [showProtectedApp, setShowProtectedApp] = useState(false);

  const scenario = SCENARIOS[selectedScenario];

  useEffect(() => {
    checkBackend();
    loadData();
  }, []);

  async function checkBackend() {
    try {
      const response = await fetch(`${API_BASE}/health`);
      setBackendOnline(response.ok);
    } catch {
      setBackendOnline(false);
    }
  }

  async function loadData() {
    try {
      const [policyResponse, transactionResponse] = await Promise.all([
        fetch(`${API_BASE}/api/policies`),
        fetch(`${API_BASE}/api/transactions`),
      ]);

      if (policyResponse.ok) {
        const data = await policyResponse.json();

        setPolicies(
          Array.isArray(data)
            ? data
            : data.policies || []
        );
      }

      if (transactionResponse.ok) {
        const data = await transactionResponse.json();

        setTransactions(
          Array.isArray(data)
            ? data
            : data.transactions || []
        );
      }
    } catch {
      // Demo UI continues even if backend is temporarily unavailable.
    }
  }

  async function runDemo() {
    if (running) return;

    setRunning(true);
    setCompleted(false);
    setApiResult(null);
    setCurrentStep(-1);

    for (let i = 0; i < PIPELINE.length; i++) {
      setCurrentStep(i);

      // Slow the animation so judges can follow the pipeline.
      await new Promise((resolve) => setTimeout(resolve, 650));

      if (i === PIPELINE.length - 1) {
        await executeRealRequest();
      }
    }

    setCompleted(true);
    setRunning(false);

    loadData();
  }

  async function executeRealRequest() {
    if (selectedScenario === "research") {
      try {
        const response = await fetch(
          `${API_BASE}/api/research?agent_id=${encodeURIComponent(
            scenario.id
          )}&agent_type=${encodeURIComponent(
            scenario.type
          )}`
        );

        const data = await response.json();

        setApiResult(data);
      } catch {
        setApiResult({
          status: "demo_mode",
          message:
            "Backend unavailable — displaying simulated gateway result.",
        });
      }
    } else {
      setApiResult({
        status:
          scenario.decision === "BLOCK"
            ? "blocked"
            : "payment_required",

        decision: scenario.decision,

        price_usd:
          scenario.decision === "BLOCK"
            ? 0
            : selectedScenario === "unknown"
            ? 0.01
            : 0,
      });
    }
  }

  function resetDemo() {
    setRunning(false);
    setCurrentStep(-1);
    setCompleted(false);
    setApiResult(null);
  }

  /*
   * IMPORTANT:
   * If the judge opens the Protected App, show that application
   * instead of the AgentGate control plane.
   */
  if (showProtectedApp) {
    return (
      <ProtectedApp
        onOpenGateway={() => setShowProtectedApp(false)}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenProtectedApp={() => setShowProtectedApp(true)}
      />

      <main className="main-content">
        <Topbar
          backendOnline={backendOnline}
          onRefresh={() => {
            checkBackend();
            loadData();
          }}
        />

        {activePage === "demo" && (
          <DemoPage
            scenario={scenario}
            selectedScenario={selectedScenario}
            setSelectedScenario={(value) => {
              resetDemo();
              setSelectedScenario(value);
            }}
            running={running}
            currentStep={currentStep}
            completed={completed}
            runDemo={runDemo}
            resetDemo={resetDemo}
            apiResult={apiResult}
          />
        )}

        {activePage === "architecture" && (
          <ArchitecturePage />
        )}

        {activePage === "policies" && (
          <PoliciesPage policies={policies} />
        )}

        {activePage === "transactions" && (
          <TransactionsPage transactions={transactions} />
        )}

        {activePage === "verification" && (
          <VerificationPage />
        )}
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SIDEBAR                                                                    */
/* -------------------------------------------------------------------------- */

function Sidebar({
  activePage,
  setActivePage,
  onOpenProtectedApp,
}) {
  const items = [
    {
      id: "demo",
      label: "Live Gateway",
      icon: Activity,
    },
    {
      id: "architecture",
      label: "Architecture",
      icon: Network,
    },
    {
      id: "verification",
      label: "Agent Verification",
      icon: ShieldCheck,
    },
    {
      id: "policies",
      label: "Policy Engine",
      icon: Lock,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: CircleDollarSign,
    },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Shield size={21} />
        </div>

        <div>
          <div className="brand-name">
            AgentGate
          </div>

          <div className="brand-subtitle">
            AGENTIC WEB GATEWAY
          </div>
        </div>
      </div>

      <div className="sidebar-section-label">
        CONTROL PLANE
      </div>

      {/* Protected application entry point */}
      <button
        className="nav-item protected-app-nav"
        onClick={onOpenProtectedApp}
      >
        <Globe size={17} />
        <span>Protected App</span>
      </button>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${
                active ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={17} />

              <span>{item.label}</span>

              {active && (
                <ChevronRight
                  size={15}
                  className="nav-arrow"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="protocol-card">
          <div className="protocol-icon">
            <Zap size={16} />
          </div>

          <div>
            <div className="protocol-title">
              x402 enabled
            </div>

            <div className="protocol-text">
              Machine payments ready
            </div>
          </div>
        </div>

        <div className="version">
          AGENTGATE · HACKATHON BUILD
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* TOPBAR                                                                     */
/* -------------------------------------------------------------------------- */

function Topbar({
  backendOnline,
  onRefresh,
}) {
  return (
    <header className="topbar">
      <div>
        <div className="breadcrumb">
          AGENTGATE <span>/</span> CONTROL PLANE
        </div>

        <h1>Live Gateway</h1>
      </div>

      <div className="topbar-actions">
        <div className="network-status">
          <span
            className={`status-dot ${
              backendOnline
                ? "online"
                : "offline"
            }`}
          />

          <span>
            {backendOnline
              ? "Gateway Online"
              : "Backend Offline"}
          </span>
        </div>

        <button
          className="icon-button"
          onClick={onRefresh}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* DEMO PAGE                                                                  */
/* -------------------------------------------------------------------------- */

function DemoPage({
  scenario,
  selectedScenario,
  setSelectedScenario,
  running,
  currentStep,
  completed,
  runDemo,
  resetDemo,
  apiResult,
}) {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <div className="eyebrow">
            <span className="live-pulse" />
            LIVE REQUEST INSPECTION
          </div>

          <h2>
            Watch an AI agent pass through
            <span> AgentGate.</span>
          </h2>

          <p>
            AgentGate identifies machine consumers,
            verifies their cryptographic identity,
            evaluates programmable policies,
            applies pricing and enables
            machine-to-machine payment.
          </p>
        </div>

        <div className="hero-badge">
          <Terminal size={15} />
          <span>PROTECTED API</span>
        </div>
      </section>

      <section className="demo-layout">
        <div className="demo-main">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                01 / REQUEST SIMULATOR
              </span>

              <h3>
                Choose an agent scenario
              </h3>
            </div>

            <div className="request-endpoint">
              <span className="method">
                GET
              </span>

              <code>
                /api/research
              </code>
            </div>
          </div>

          <div className="scenario-grid">
            <ScenarioCard
              scenario={SCENARIOS.research}
              selected={
                selectedScenario === "research"
              }
              onClick={() =>
                setSelectedScenario("research")
              }
            />

            <ScenarioCard
              scenario={SCENARIOS.unknown}
              selected={
                selectedScenario === "unknown"
              }
              onClick={() =>
                setSelectedScenario("unknown")
              }
            />

            <ScenarioCard
              scenario={SCENARIOS.training}
              selected={
                selectedScenario === "training"
              }
              onClick={() =>
                setSelectedScenario("training")
              }
            />

            <ScenarioCard
              scenario={SCENARIOS.human}
              selected={
                selectedScenario === "human"
              }
              onClick={() =>
                setSelectedScenario("human")
              }
            />
          </div>

          <div className="pipeline-card">
            <div className="pipeline-header">
              <div>
                <span className="section-kicker">
                  02 / GATEWAY PIPELINE
                </span>

                <h3>
                  Request processing
                </h3>
              </div>

              {running && (
                <div className="processing-label">
                  <span className="spinner" />
                  PROCESSING REQUEST
                </div>
              )}

              {completed && (
                <div className="complete-label">
                  <Check size={14} />
                  REQUEST PROCESSED
                </div>
              )}
            </div>

            <div className="pipeline">
              {PIPELINE.map((step, index) => {
                const Icon = step.icon;

                const isActive =
                  currentStep === index;

                const isDone =
                  currentStep > index ||
                  completed;

                const isBlocked =
                  completed &&
                  scenario.decision === "BLOCK" &&
                  index >= 3;

                return (
                  <div
                    className="pipeline-wrapper"
                    key={step.key}
                  >
                    <div
                      className={`pipeline-step ${
                        isActive
                          ? "active"
                          : ""
                      } ${
                        isDone
                          ? "done"
                          : ""
                      } ${
                        isBlocked
                          ? "blocked"
                          : ""
                      }`}
                    >
                      <div className="pipeline-icon">
                        {isDone && !isBlocked ? (
                          <Check size={17} />
                        ) : isBlocked ? (
                          <X size={17} />
                        ) : (
                          <Icon size={17} />
                        )}
                      </div>

                      <div className="pipeline-title">
                        {step.title}
                      </div>

                      <div className="pipeline-subtitle">
                        {step.subtitle}
                      </div>
                    </div>

                    {index <
                      PIPELINE.length - 1 && (
                      <ArrowRight
                        size={16}
                        className={`pipeline-arrow ${
                          currentStep > index
                            ? "passed"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pipeline-footer">
              <button
                className="run-button"
                onClick={runDemo}
                disabled={running}
              >
                <Play
                  size={16}
                  fill="currentColor"
                />

                {running
                  ? "Running Gateway..."
                  : "Run Agent Request"}
              </button>

              <button
                className="reset-button"
                onClick={resetDemo}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <aside className="request-panel">
          <div className="panel-label">
            CURRENT REQUEST
          </div>

          <div className="agent-identity">
            <div
              className={`agent-avatar ${scenario.color}`}
            >
              {selectedScenario === "human" ? (
                <UserRound size={23} />
              ) : (
                <Cpu size={23} />
              )}
            </div>

            <div>
              <h3>{scenario.name}</h3>

              <span>
                {scenario.description}
              </span>
            </div>
          </div>

          <div className="data-list">
            <DataRow
              label="Agent ID"
              value={scenario.id}
              mono
            />

            <DataRow
              label="Classification"
              value={scenario.type}
            />

            <DataRow
              label="Wallet"
              value={scenario.wallet}
              mono
            />

            <DataRow
              label="Endpoint"
              value="/api/research"
              mono
            />
          </div>

          <div
            className={`decision-box ${scenario.color}`}
          >
            <div className="decision-icon">
              {scenario.decision === "BLOCK" ? (
                <X size={18} />
              ) : (
                <Check size={18} />
              )}
            </div>

            <div>
              <span>
                POLICY DECISION
              </span>

              <strong>
                {scenario.decision}
              </strong>
            </div>

            <div className="decision-price">
              {scenario.price}
            </div>
          </div>

          {apiResult && (
            <div className="api-result">
              <div className="result-heading">
                <Terminal size={14} />
                GATEWAY RESPONSE
              </div>

              <pre>
                {JSON.stringify(
                  apiResult,
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SCENARIO CARD                                                              */
/* -------------------------------------------------------------------------- */

function ScenarioCard({
  scenario,
  selected,
  onClick,
}) {
  return (
    <button
      className={`scenario-card ${
        selected ? "selected" : ""
      } ${scenario.color}`}
      onClick={onClick}
    >
      <div className="scenario-top">
        <div
          className={`scenario-icon ${scenario.color}`}
        >
          <Cpu size={18} />
        </div>

        {selected && (
          <div className="selected-check">
            <Check size={13} />
          </div>
        )}
      </div>

      <strong>{scenario.name}</strong>

      <span>
        {scenario.description}
      </span>

      <div className="scenario-result">
        <span
          className={`decision-pill ${scenario.color}`}
        >
          {scenario.decision}
        </span>

        <b>{scenario.price}</b>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* DATA ROW                                                                   */
/* -------------------------------------------------------------------------- */

function DataRow({
  label,
  value,
  mono,
}) {
  return (
    <div className="data-row">
      <span>{label}</span>

      <strong
        className={mono ? "mono" : ""}
      >
        {value}
      </strong>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ARCHITECTURE                                                               */
/* -------------------------------------------------------------------------- */

function ArchitecturePage() {
  const layers = [
    {
      icon: Cpu,
      title: "AI Agent",
      text: "Autonomous software consumer sends an API request.",
    },
    {
      icon: ShieldCheck,
      title: "AgentGate",
      text: "Gateway becomes the trust and control boundary.",
    },
    {
      icon: Fingerprint,
      title: "Identity",
      text: "Agent identity and wallet ownership are verified.",
    },
    {
      icon: Lock,
      title: "Policy Engine",
      text: "Programmable rules determine access.",
    },
    {
      icon: CircleDollarSign,
      title: "Pricing",
      text: "Price is calculated from agent classification.",
    },
    {
      icon: Wallet,
      title: "x402",
      text: "Machine pays for the resource without human checkout.",
    },
    {
      icon: Database,
      title: "Protected Resource",
      text: "Approved agent receives API/data access.",
    },
  ];

  return (
    <div className="page">
      <section className="page-title">
        <span className="section-kicker">
          SYSTEM DESIGN
        </span>

        <h2>
          How AgentGate works
        </h2>

        <p>
          A programmable trust and commerce
          layer between autonomous agents
          and protected digital resources.
        </p>
      </section>

      <div className="architecture">
        {layers.map((layer, index) => {
          const Icon = layer.icon;

          return (
            <div
              className="architecture-row"
              key={layer.title}
            >
              <div className="architecture-number">
                0{index + 1}
              </div>

              <div className="architecture-icon">
                <Icon size={21} />
              </div>

              <div className="architecture-content">
                <h3>{layer.title}</h3>

                <p>{layer.text}</p>
              </div>

              {index <
                layers.length - 1 && (
                <ArrowRight
                  className="architecture-arrow"
                  size={17}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="architecture-bottom">
        <div>
          <span className="section-kicker">
            WHY IT MATTERS
          </span>

          <h3>
            Agents need infrastructure built
            for agents.
          </h3>
        </div>

        <div className="architecture-points">
          <span>Identity</span>
          <span>Policy</span>
          <span>Pricing</span>
          <span>Payments</span>
          <span>Access Control</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VERIFICATION                                                               */
/* -------------------------------------------------------------------------- */

function VerificationPage() {
  return (
    <div className="page">
      <section className="page-title">
        <span className="section-kicker">
          TRUST LAYER
        </span>

        <h2>
          Agent verification
        </h2>

        <p>
          AgentGate does not blindly trust
          an agent's self-declared identity.
          The agent proves control of its
          cryptographic wallet.
        </p>
      </section>

      <div className="verification-layout">
        <div className="verification-flow">
          <VerificationStep
            number="01"
            icon={Terminal}
            title="Gateway issues challenge"
            code="AgentGate → challenge"
            status="READY"
          />

          <VerificationStep
            number="02"
            icon={Fingerprint}
            title="Agent signs challenge"
            code="wallet.sign(challenge)"
            status="CRYPTOGRAPHIC"
          />

          <VerificationStep
            number="03"
            icon={ShieldCheck}
            title="Gateway verifies signature"
            code="verify(publicKey, signature)"
            status="VERIFIED"
          />

          <VerificationStep
            number="04"
            icon={Check}
            title="Agent identity accepted"
            code="identity = trusted"
            status="PASS"
          />
        </div>

        <div className="crypto-card">
          <div className="crypto-card-header">
            <ShieldCheck size={18} />
            <span>
              CRYPTOGRAPHIC PROOF
            </span>
          </div>

          <div className="terminal">
            <div className="terminal-top">
              <span />
              <span />
              <span />

              <small>
                agent-verification
              </small>
            </div>

            <div className="terminal-body">
              <div>
                <span className="terminal-muted">
                  $
                </span>{" "}
                request challenge
              </div>

              <div className="terminal-success">
                ✓ challenge issued
              </div>

              <br />

              <div>
                <span className="terminal-muted">
                  $
                </span>{" "}
                sign challenge
              </div>

              <div className="terminal-success">
                ✓ Ed25519 signature generated
              </div>

              <br />

              <div>
                <span className="terminal-muted">
                  $
                </span>{" "}
                verify signature
              </div>

              <div className="terminal-success">
                ✓ wallet ownership verified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VERIFICATION STEP                                                          */
/* -------------------------------------------------------------------------- */

function VerificationStep({
  number,
  icon: Icon,
  title,
  code,
  status,
}) {
  return (
    <div className="verification-step">
      <div className="verification-number">
        {number}
      </div>

      <div className="verification-icon">
        <Icon size={18} />
      </div>

      <div className="verification-copy">
        <strong>{title}</strong>

        <code>{code}</code>
      </div>

      <span className="verification-status">
        {status}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* POLICIES                                                                   */
/* -------------------------------------------------------------------------- */

function PoliciesPage({
  policies,
}) {
  const fallbackPolicies = [
    {
      agent_type: "human",
      decision: "ALLOW",
      price: "FREE",
      description:
        "Human users access the resource for free.",
    },

    {
      agent_type: "research",
      decision: "CHARGE",
      price: "$0.001",
      description:
        "Verified research agents pay per request.",
    },

    {
      agent_type: "unknown",
      decision: "CHARGE",
      price: "$0.01",
      description:
        "Unknown agents pay a higher risk-adjusted price.",
    },

    {
      agent_type: "training",
      decision: "BLOCK",
      price: "—",
      description:
        "Training crawlers are denied access.",
    },
  ];

  const sourcePolicies =
    policies.length > 0
      ? policies
      : fallbackPolicies;

  return (
    <div className="page">
      <section className="page-title">
        <span className="section-kicker">
          DECISION ENGINE
        </span>

        <h2>
          Programmable policies
        </h2>

        <p>
          Resource owners define how different
          classes of consumers are treated.
        </p>
      </section>

      <div className="policy-grid">
        {sourcePolicies.map(
          (policy, index) => {
            const type =
              policy.agent_type ||
              policy.agentType ||
              policy.type ||
              "unknown";

            const decision =
              policy.decision ||
              policy.action ||
              policy.effect ||
              "ALLOW";

            const price =
              policy.price ||
              policy.price_usd ||
              (decision === "BLOCK"
                ? "—"
                : "FREE");

            const color =
              decision === "BLOCK"
                ? "red"
                : decision === "CHARGE"
                ? "amber"
                : "green";

            return (
              <div
                className="policy-card"
                key={index}
              >
                <div className="policy-card-top">
                  <div
                    className={`policy-type ${color}`}
                  >
                    <Lock size={16} />
                  </div>

                  <span
                    className={`decision-pill ${color}`}
                  >
                    {decision}
                  </span>
                </div>

                <h3>
                  {String(type).toUpperCase()}
                </h3>

                <div className="policy-price">
                  {typeof price === "number"
                    ? `$${price}`
                    : price}
                </div>

                <p>
                  {policy.description ||
                    `Policy applied to ${type} consumers.`}
                </p>

                <div className="policy-rule">
                  <Code2 size={14} />

                  <span>
                    agent.type == "{type}"
                  </span>
                </div>
              </div>
            );
          }
        )}
      </div>

      <div className="policy-explanation">
        <Lock size={18} />

        <div>
          <strong>
            Policy is programmable.
          </strong>

          <p>
            The same protected resource can
            charge different prices, allow
            free access, or completely block
            a request based on the identity
            and classification of the
            consumer.
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TRANSACTIONS                                                               */
/* -------------------------------------------------------------------------- */

function TransactionsPage({
  transactions,
}) {
  const fallback = [
    {
      agent: "research-agent-001",
      type: "research",
      action: "CHARGE",
      amount: "$0.001",
      status: "payment_required",
    },

    {
      agent: "training-bot-001",
      type: "training",
      action: "BLOCK",
      amount: "$0.00",
      status: "blocked",
    },
  ];

  const rows =
    transactions.length > 0
      ? transactions
      : fallback;

  return (
    <div className="page">
      <section className="page-title">
        <span className="section-kicker">
          OBSERVABILITY
        </span>

        <h2>
          Gateway activity
        </h2>

        <p>
          Every request becomes an auditable
          access and commerce event.
        </p>
      </section>

      <div className="transaction-summary">
        <SummaryCard
          icon={Activity}
          label="REQUESTS"
          value={rows.length}
        />

        <SummaryCard
          icon={CircleDollarSign}
          label="REVENUE"
          value="$0.001"
        />

        <SummaryCard
          icon={Shield}
          label="POLICY DECISIONS"
          value={rows.length}
        />
      </div>

      <div className="table-card">
        <div className="table-header">
          <span>AGENT</span>
          <span>TYPE</span>
          <span>DECISION</span>
          <span>AMOUNT</span>
          <span>STATUS</span>
        </div>

        {rows.map((row, index) => {
          const decision =
            row.action ||
            row.decision ||
            "ALLOW";

          const status =
            row.status ||
            "processed";

          const color =
            decision === "BLOCK"
              ? "red"
              : "amber";

          return (
            <div
              className="table-row"
              key={index}
            >
              <div className="agent-table-name">
                <div className="mini-agent">
                  <Cpu size={14} />
                </div>

                <span>
                  {row.agent ||
                    row.agent_id ||
                    row.agentId ||
                    "agent"}
                </span>
              </div>

              <span>
                {row.type ||
                  row.agent_type ||
                  "unknown"}
              </span>

              <span>
                <span
                  className={`decision-pill ${color}`}
                >
                  {decision}
                </span>
              </span>

              <strong>
                {row.amount ||
                  row.price ||
                  row.price_usd ||
                  "$0.00"}
              </strong>

              <span className="table-status">
                <span className="status-dot online" />

                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUMMARY CARD                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="summary-card">
      <div className="summary-icon">
        <Icon size={17} />
      </div>

      <div>
        <span>{label}</span>

        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default App;