import type { Metadata } from "next";
import Link from "next/link";
import { Flow } from "@/components/demo/flow";
import { LogoMark } from "@/components/demo/icons";
import { Phone } from "@/components/demo/phone";
import { Route } from "@/components/demo/route";
import { StatusTag } from "@/components/demo/status-tag";
import { BRAND } from "@/lib/brand";
import { formatDuration, formatMinutes, formatWhen, maskCustomer } from "@/lib/demo/format";
import { OUTCOME_LABEL } from "@/lib/demo/rules";
import { SAMPLE_DATE } from "@/lib/demo/sample";
import { outcomeCounts, overview, teamRows } from "@/lib/demo/selectors";
import { initialState } from "@/lib/demo/state";
import type { LoggedCall, Outcome } from "@/lib/demo/types";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Everything on this page is drawn from the demo's own sample day, so the numbers match /demo.
const day = initialState();
const o = overview(day);
const counts = outcomeCounts(day);
const people = new Map(day.people.map((p) => [p.id, p]));
const rows = teamRows(day);
const credited = rows.reduce((best, r) => (r.creditedMinutes > best.creditedMinutes ? r : best), rows[0]);
const flagged = rows.find((r) => r.needsReview) ?? rows[rows.length - 1];

// A slice of the Surveys log: the latest call of each outcome, newest first.
const ORDER: Outcome[] = ["sent", "skipped_short", "skipped_daily_cap", "no_match"];
const newestFirst = [...day.calls].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
const logSlice: LoggedCall[] = ORDER.map((k) => newestFirst.find((c) => c.outcome === k)).filter((c): c is LoggedCall => !!c);
logSlice.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
const sentCall = logSlice.find((c) => c.outcome === "sent");

const mapped = o.processed - counts.no_match;

export default function Home() {
  return (
    <div className="land">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="l-head">
        <Link href="/" className="l-brand" aria-label={`${BRAND.product}, home`}>
          <LogoMark size={32} />
          <span>{BRAND.product}</span>
        </Link>
        <Link className="btn pri" href="/demo">
          Try the demo
        </Link>
      </header>

      <main id="main">
        <section className="l-hero" aria-labelledby="hero-h">
          <h1 id="hero-h">Phone logs that credit the right person, and surveys that know when to stop.</h1>
          <div className="l-lede">
            <p>
              For small call centers and service teams under 50 people that take calls all day. Every desk-phone call is credited to the person who took it, offline work counts too, and a customer gets a rating text only when asking is worth it.
            </p>
            <div className="l-cta">
              <Link className="btn pri big" href="/demo">
                Try the demo
              </Link>
              <span>No sign-up. Opens a sample day at {BRAND.business}, a made-up call center.</span>
            </div>
          </div>
        </section>

        <section className="l-band" aria-labelledby="band-h">
          <h2 id="band-h" className="sr-only">
            A sample day in the demo
          </h2>
          <Flow processed={o.processed} mapped={mapped} long={mapped - counts.skipped_short} sent={o.sent} c={counts} />
          <p className="l-cap">
            {BRAND.business}&rsquo;s sample day in the demo: {o.processed} calls, each one followed from the desk phone to the text. The line is as thick as the calls still on it.
          </p>
        </section>

        <section className="l-sec l-split" aria-labelledby="credit-h">
          <div>
            <h2 id="credit-h">Credit goes to the person who did the work</h2>
            <p>
              Each desk-phone extension is mapped once to a person and their CRM user. From then on every call on that extension is logged under them, with nobody typing anything. Case reviews, paperwork and file cleanup count too, along with the updates they logged in the CRM.
            </p>
            <p>An extension nobody mapped is shown as &ldquo;No match&rdquo;, so a missing mapping is easy to spot and fix.</p>
          </div>
          <ol className="l-stops" aria-label="How one call is credited">
            <li>
              <b>
                A call rings extension <span className="num">{credited.person.extension}</span>
              </b>
              <span>The phone system reports the extension, the length and the customer&rsquo;s number.</span>
            </li>
            <li>
              <b>
                Extension <span className="num">{credited.person.extension}</span> is {credited.person.name}
              </b>
              <span className="num">CRM user {credited.person.crmUserId}</span>
            </li>
            <li className="end">
              <b>{credited.person.name.split(" ")[0]} gets the credit</b>
              <span className="l-credit">
                <span className="bar" aria-hidden="true">
                  <i className="c" style={{ width: `${(credited.callMinutes / credited.creditedMinutes) * 100}%` }} />
                  <i className="o" style={{ width: `${(credited.offlineMinutes / credited.creditedMinutes) * 100}%` }} />
                </span>
                <span className="num">
                  {formatMinutes(credited.creditedMinutes)} today: calls {formatMinutes(credited.callMinutes)} + offline {formatMinutes(credited.offlineMinutes)}
                </span>
              </span>
            </li>
          </ol>
        </section>

        <section className="l-sec" aria-labelledby="rules-h">
          <h2 id="rules-h">Two survey rules, stated plainly</h2>
          <p className="l-intro">A rating text goes out only when a call passes both. Every skipped text says which rule stopped it.</p>
          <div className="l-rules">
            <div>
              <p className="l-big num">2 minutes</p>
              <p>No text for a call under 2 minutes. A quick transfer or a wrong number is not worth a survey. A call of exactly 2 minutes is asked.</p>
              <p className="l-out">
                <Route outcome="skipped_short" />
                {OUTCOME_LABEL.skipped_short}
              </p>
            </div>
            <div>
              <p className="l-big num">24 hours</p>
              <p>No second text to the same customer within 24 hours, however many times they call. Calls that were skipped do not count toward it.</p>
              <p className="l-out">
                <Route outcome="skipped_daily_cap" />
                {OUTCOME_LABEL.skipped_daily_cap}
              </p>
            </div>
          </div>
        </section>

        <section className="l-sec l-screen" aria-labelledby="screen-h">
          <div className="l-screen-text">
            <h2 id="screen-h">A real screen from the demo</h2>
            <p>
              The Surveys log for {BRAND.business}. Each call is drawn as a trip: plum to the end when a text went out, cut off at the stop that held it when not. Press &ldquo;Run sample batch&rdquo; in the demo and 20 new calls arrive.
            </p>
          </div>
          <figure className="l-frame">
            <table className="log l-log">
              <caption className="sr-only">Four calls from the sample day, newest first</caption>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Person</th>
                  <th className="hide-s">Length</th>
                  <th className="hide-s">Customer</th>
                  <th className="hide-s">Trip</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {logSlice.map((c) => {
                  const p = c.personId ? people.get(c.personId) : undefined;
                  return (
                    <tr key={c.id}>
                      <td className="num">{formatWhen(c.at, SAMPLE_DATE)}</td>
                      <td>
                        <div className="who">
                          <b>{p?.name ?? "Unknown"}</b>
                          <small className="num">Ext {c.extension}</small>
                        </div>
                      </td>
                      <td className="num hide-s">{formatDuration(c.durationSec)}</td>
                      <td className="num hide-s">{maskCustomer(c.customer)}</td>
                      <td className="hide-s">
                        <Route outcome={c.outcome} />
                      </td>
                      <td>
                        <span className={c.outcome === "sent" ? "out sent" : "out"}>{OUTCOME_LABEL[c.outcome]}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <figcaption className="l-cap">Sample data. Customer numbers are made up and masked.</figcaption>
          </figure>
          {sentCall?.text && (
            <div className="phone-wrap l-phone">
              <span className="notsent">Not sent: demo</span>
              <Phone text={sentCall.text} at={sentCall.at} />
            </div>
          )}
        </section>

        <section className="l-sec l-split" aria-labelledby="review-h">
          <div>
            <h2 id="review-h">A low number is a question, not a verdict</h2>
            <p>
              Offline time gets a focus rating: the updates logged for each 100 minutes away from the phone, up to 100. Under 40, the person gets a Review tag. It is a prompt for a conversation, never a mark against them.
            </p>
            <p>The supervisor opens the person, sees their calls and offline blocks, and clears the flag. The tag then names who cleared it.</p>
          </div>
          <dl className="l-tags">
            <div>
              <dt>
                <StatusTag row={{ ...flagged, needsReview: true, cleared: false }} />
              </dt>
              <dd>
                {flagged.person.name.split(" ")[0]} has a focus rating of <span className="num">{flagged.focus ?? "–"}</span> today.
              </dd>
            </div>
            <div>
              <dt>
                <StatusTag row={{ ...flagged, needsReview: false, cleared: true }} />
              </dt>
              <dd>{BRAND.supervisor} looked, talked to them, and cleared it.</dd>
            </div>
            <div>
              <dt>
                <StatusTag row={{ ...credited, needsReview: false, cleared: false }} />
              </dt>
              <dd>Everyone else, with nothing to review.</dd>
            </div>
          </dl>
        </section>

        <section className="l-sec l-end" aria-labelledby="end-h">
          <h2 id="end-h">See it with a full sample day</h2>
          <p>
            In the demo, the texts and the CRM are simulated. No text goes out, no phone system or CRM is reached, and what you change stays in your browser. Reset it any time.
          </p>
          <Link className="btn pri big" href="/demo">
            Try the demo
          </Link>
        </section>
      </main>

      <footer className="l-foot">
        <span>
          {BRAND.product}. {BRAND.business} is a made-up call center.
        </span>
        <a href="https://tekguyz.com">Built by TEKGUYZ</a>
      </footer>
    </div>
  );
}
