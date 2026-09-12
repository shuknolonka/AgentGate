import { useEffect, useState } from "react";

import {
  ShieldCheck,
  Activity,
  CreditCard,
  Ban,
  RefreshCw,
  Send,
  LayoutDashboard,
  Settings,
  Wallet,
  CircleCheck,
  CircleX,
  AlertTriangle
} from "lucide-react";


const AGENTS = {
  human: {
    id: "human-user-001",
    type: "human",
    label: "Human User"
  },

  research: {
    id: "research-agent-001",
    type: "research",
    label: "Research Agent"
  },

  unknown: {
    id: "unknown-agent-001",
    type: "unknown",
    label: "Unknown Agent"
  },

  training: {
    id: "training-bot-001",
    type: "training",
    label: "Training Crawler"
  }
};


function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const [backendStatus, setBackendStatus] = useState("checking");

  const [selectedAgent, setSelectedAgent] = useState("research");

  const [requestState, setRequestState] = useState("idle");

  const [requestResult, setRequestResult] = useState(null);

  const [transactions, setTransactions] = useState([]);

  const [policies, setPolicies] = useState([]);

  const [requestCount, setRequestCount] = useState(0);

  const [blockedCount, setBlockedCount] = useState(0);

  const [revenue, setRevenue] = useState(0);


  /*
   * Check whether FastAPI is running.
   */
  async function checkBackend() {
    try {
      const response = await fetch("/health");

      if (response.ok) {
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch {
      setBackendStatus("offline");
    }
  }


  /*
   * Load policies from AgentGate.
   */
  async function loadPolicies() {
    try {
      const response = await fetch("/api/policies");

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setPolicies(data);
      } else if (Array.isArray(data.policies)) {
        setPolicies(data.policies);
      }
    } catch {
      console.log("Could not load policies.");
    }
  }


  /*
   * Load transactions from AgentGate.
   */
  async function loadTransactions() {
    try {
      const response = await fetch("/api/transactions");

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch {
      console.log("Could not load transactions.");
    }
  }


  /*
   * Initial application setup.
   */
  useEffect(() => {
    checkBackend();
    loadPolicies();
    loadTransactions();

    const interval = setInterval(() => {
      checkBackend();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  /*
   * Main demonstration:
   *
   * The selected agent sends a request to
   * AgentGate's protected research resource.
   */
  async function sendAgentRequest() {
    const agent = AGENTS[selectedAgent];

    setRequestState("loading");
    setRequestResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "GET",

        headers: {
          "X-Agent-ID": agent.id,
          "X-Agent-Type": agent.type
        }
      });

      const data = await response.json();

      setRequestResult({
        statusCode: response.status,
        ...data
      });

      setRequestState("complete");

      setRequestCount((current) => current + 1);

      if (
        data.decision === "BLOCK" ||
        data.status === "blocked"
      ) {
        setBlockedCount((current) => current + 1);
      }

      if (
        data.price_usd !== undefined &&
        data.price_usd !== null
      ) {
        setRevenue(
          (current) =>
            current + Number(data.price_usd || 0)
        );
      }

      loadTransactions();

    } catch (error) {
      setRequestState("error");

      setRequestResult({
        status: "error",
        message:
          "Could not connect to AgentGate backend."
      });
    }
  }


  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <div className="brand-name">
              AgentGate
            </div>

            <div className="brand-subtitle">
              Agentic Web Gateway
            </div>
          </div>
        </div>


        <nav className="navigation">

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>


          <button
            className={
              activePage === "simulator"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("simulator")}
          >
            <Activity size={19} />
            Request Simulator
          </button>


          <button
            className={
              activePage === "policies"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("policies")}
          >
            <Settings size={19} />
            Policies
          </button>


          <button
            className={
              activePage === "transactions"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("transactions")}
          >
            <CreditCard size={19} />
            Transactions
          </button>

        </nav>


        <div className="sidebar-bottom">

          <div className="backend-card">

            <div className="status-row">

              <span
                className={
                  backendStatus === "online"
                    ? "status-dot online"
                    : "status-dot offline"
                }
              />

              <span>
                Backend
              </span>

            </div>

            <strong>
              {backendStatus === "online"
                ? "Connected"
                : backendStatus === "checking"
                ? "Checking..."
                : "Offline"}
            </strong>

          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="main">

        <header className="topbar">

          <div>
            <h1>
              {activePage === "dashboard" &&
                "Gateway Dashboard"}

              {activePage === "simulator" &&
                "Agent Request Simulator"}

              {activePage === "policies" &&
                "Access Policies"}

              {activePage === "transactions" &&
                "Transactions"}
            </h1>

            <p>
              Programmable paid access for the Agentic Web
            </p>
          </div>


          <div className="topbar-status">

            <span
              className={
                backendStatus === "online"
                  ? "connection online"
                  : "connection offline"
              }
            >
              <span className="status-dot" />

              {backendStatus === "online"
                ? "System Online"
                : "System Offline"}
            </span>

            <button
              className="icon-button"
              onClick={() => {
                checkBackend();
                loadPolicies();
                loadTransactions();
              }}
            >
              <RefreshCw size={18} />
            </button>

          </div>

        </header>


        {/* DASHBOARD */}

        {activePage === "dashboard" && (

          <section className="page">

            <div className="hero">

              <div>

                <div className="eyebrow">
                  ACCESS CONTROL + MONETIZATION
                </div>

                <h2>
                  Control what AI agents
                  <span> can access.</span>
                </h2>

                <p>
                  AgentGate identifies machine consumers,
                  applies programmable policies and
                  determines whether a request is free,
                  paid or blocked.
                </p>

              </div>


              <div className="hero-shield">
                <ShieldCheck size={70} />
              </div>

            </div>


            <div className="stats-grid">

              <StatCard
                title="Requests"
                value={requestCount}
                icon={<Activity size={20} />}
              />

              <StatCard
                title="Revenue"
                value={`$${revenue.toFixed(3)}`}
                icon={<Wallet size={20} />}
              />

              <StatCard
                title="Blocked"
                value={blockedCount}
                icon={<Ban size={20} />}
              />

              <StatCard
                title="Policies"
                value={
                  policies.length || 4
                }
                icon={<Settings size={20} />}
              />

            </div>


            <div className="dashboard-grid">

              <div className="panel">

                <div className="panel-header">

                  <div>
                    <h3>
                      Quick Agent Test
                    </h3>

                    <p>
                      Simulate a machine request
                    </p>
                  </div>

                  <Activity size={21} />

                </div>


                <div className="agent-buttons">

                  {Object.entries(AGENTS).map(
                    ([key, agent]) => (

                      <button
                        key={key}
                        className={
                          selectedAgent === key
                            ? "agent-button selected"
                            : "agent-button"
                        }
                        onClick={() =>
                          setSelectedAgent(key)
                        }
                      >

                        <div className="agent-avatar">
                          {key === "training"
                            ? "T"
                            : key === "research"
                            ? "R"
                            : key === "unknown"
                            ? "?"
                            : "H"}
                        </div>

                        <div>
                          <strong>
                            {agent.label}
                          </strong>

                          <small>
                            {agent.type}
                          </small>
                        </div>

                      </button>

                    )
                  )}

                </div>


                <button
                  className="primary-button"
                  onClick={sendAgentRequest}
                  disabled={
                    requestState === "loading"
                  }
                >

                  <Send size={18} />

                  {requestState === "loading"
                    ? "Sending..."
                    : "Request Protected Data"}

                </button>

              </div>


              <div className="panel">

                <div className="panel-header">

                  <div>
                    <h3>
                      Latest Decision
                    </h3>

                    <p>
                      AgentGate policy engine
                    </p>
                  </div>

                  <ShieldCheck size={21} />

                </div>


                {!requestResult && (

                  <div className="empty-state">

                    <Activity size={35} />

                    <p>
                      No request yet.
                    </p>

                    <span>
                      Select an agent and send a request.
                    </span>

                  </div>

                )}


                {requestResult && (

                  <DecisionResult
                    result={requestResult}
                  />

                )}

              </div>

            </div>

          </section>

        )}


        {/* SIMULATOR */}

        {activePage === "simulator" && (

          <section className="page">

            <div className="section-heading">

              <h2>
                Test AgentGate Policies
              </h2>

              <p>
                Send requests as different types of
                machine consumers.
              </p>

            </div>


            <div className="simulator-card">

              <label>
                Simulated Agent
              </label>

              <select
                value={selectedAgent}
                onChange={(event) =>
                  setSelectedAgent(event.target.value)
                }
              >

                {Object.entries(AGENTS).map(
                  ([key, agent]) => (

                    <option
                      key={key}
                      value={key}
                    >
                      {agent.label} — {agent.type}
                    </option>

                  )
                )}

              </select>


              <div className="request-preview">

                <div>
                  <span>Agent ID</span>
                  <strong>
                    {AGENTS[selectedAgent].id}
                  </strong>
                </div>

                <div>
                  <span>Agent Type</span>
                  <strong>
                    {AGENTS[selectedAgent].type}
                  </strong>
                </div>

                <div>
                  <span>Resource</span>
                  <strong>
                    /api/research
                  </strong>
                </div>

              </div>


              <button
                className="primary-button"
                onClick={sendAgentRequest}
                disabled={
                  requestState === "loading"
                }
              >

                <Send size={18} />

                {requestState === "loading"
                  ? "Sending Request..."
                  : "Send Request"}

              </button>

            </div>


            {requestResult && (

              <div className="panel result-panel">

                <div className="panel-header">

                  <div>
                    <h3>
                      AgentGate Response
                    </h3>

                    <p>
                      Real response from FastAPI
                    </p>
                  </div>

                </div>

                <DecisionResult
                  result={requestResult}
                />

                <pre className="json-result">
                  {JSON.stringify(
                    requestResult,
                    null,
                    2
                  )}
                </pre>

              </div>

            )}

          </section>

        )}


        {/* POLICIES */}

        {activePage === "policies" && (

          <section className="page">

            <div className="section-heading">

              <h2>
                Programmable Access Policies
              </h2>

              <p>
                AgentGate decides what every consumer
                is allowed to do.
              </p>

            </div>


            <div className="policy-grid">

              <PolicyCard
                type="HUMAN"
                title="Human"
                decision="FREE"
                price="$0.00"
                description="Human visitors access resources without machine micropayments."
                icon={<CircleCheck />}
              />

              <PolicyCard
                type="RESEARCH"
                title="Verified Research Agent"
                decision="CHARGE"
                price="$0.001"
                description="Trusted research agents pay a small machine-to-machine fee."
                icon={<CreditCard />}
              />

              <PolicyCard
                type="UNKNOWN"
                title="Unknown Agent"
                decision="CHARGE"
                price="$0.01"
                description="Unverified machine consumers pay the higher access price."
                icon={<AlertTriangle />}
              />

              <PolicyCard
                type="TRAINING"
                title="Training Crawler"
                decision="BLOCK"
                price="DENIED"
                description="Training crawlers are blocked according to the access policy."
                icon={<CircleX />}
              />

            </div>

          </section>

        )}


        {/* TRANSACTIONS */}

        {activePage === "transactions" && (

          <section className="page">

            <div className="section-heading">

              <h2>
                Transaction Log
              </h2>

              <p>
                Machine access and payment activity.
              </p>

            </div>


            <div className="panel">

              <div className="panel-header">

                <h3>
                  Recent Transactions
                </h3>

                <button
                  className="small-button"
                  onClick={loadTransactions}
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>

              </div>


              {transactions.length === 0 ? (

                <div className="empty-state">

                  <CreditCard size={35} />

                  <p>
                    No transactions available.
                  </p>

                  <span>
                    Transactions will appear here when
                    the backend records them.
                  </span>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>
                        <th>Agent</th>
                        <th>Type</th>
                        <th>Decision</th>
                        <th>Amount</th>
                      </tr>

                    </thead>

                    <tbody>

                      {transactions.map(
                        (transaction, index) => (

                          <tr key={index}>

                            <td>
                              {transaction.agent_id ||
                                "—"}
                            </td>

                            <td>
                              {transaction.agent_type ||
                                "—"}
                            </td>

                            <td>
                              <span className="table-badge">
                                {transaction.decision ||
                                  transaction.status ||
                                  "—"}
                              </span>
                            </td>

                            <td>
                              {transaction.amount ||
                                transaction.price_usd ||
                                "$0.00"}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}


/* -----------------------------
   COMPONENTS
----------------------------- */


function StatCard({
  title,
  value,
  icon
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}


function DecisionResult({ result }) {

  const decision =
    result.decision ||
    (
      result.status === "blocked"
        ? "BLOCK"
        : result.status === "payment_required"
        ? "CHARGE"
        : "ALLOW"
    );


  const isBlocked =
    decision === "BLOCK";


  const isCharge =
    decision === "CHARGE";


  return (
    <div
      className={
        isBlocked
          ? "decision blocked"
          : isCharge
          ? "decision charge"
          : "decision free"
      }
    >

      <div className="decision-icon">

        {isBlocked ? (
          <Ban size={30} />
        ) : isCharge ? (
          <CreditCard size={30} />
        ) : (
          <CircleCheck size={30} />
        )}

      </div>


      <div className="decision-content">

        <span>
          DECISION
        </span>

        <strong>
          {decision}
        </strong>

        {result.price_usd !== undefined && (

          <p>
            Price:{" "}
            <b>
              ${Number(
                result.price_usd
              ).toFixed(3)}
            </b>
            {" "} / request
          </p>

        )}

        {result.reason && (

          <p>
            {result.reason}
          </p>

        )}

        {result.message && (

          <p>
            {result.message}
          </p>

        )}

      </div>

    </div>
  );
}


function PolicyCard({
  type,
  title,
  decision,
  price,
  description,
  icon
}) {

  return (
    <div className="policy-card">

      <div className="policy-top">

        <div className="policy-icon">
          {icon}
        </div>

        <span className="policy-type">
          {type}
        </span>

      </div>


      <h3>
        {title}
      </h3>

      <p>
        {description}
      </p>


      <div className="policy-bottom">

        <strong>
          {decision}
        </strong>

        <span>
          {price}
        </span>

      </div>

    </div>
  );
}


export default App;