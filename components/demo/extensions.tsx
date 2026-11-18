"use client";

import { useId, useMemo, useState } from "react";
import { PlusIcon } from "@/components/demo/icons";
import type { Person } from "@/lib/demo/types";
import { useDemo } from "@/lib/demo/use-demo";

type Field = "extension" | "name" | "crm";
const EMPTY: Record<Field, string> = { extension: "", name: "", crm: "" };

export function Extensions() {
  const { state, dispatch } = useDemo();
  const [form, setForm] = useState(EMPTY);
  const [tried, setTried] = useState(false);
  const [added, setAdded] = useState<Person | null>(null);
  const id = useId();

  // Counted once per change to the log, not on every keystroke in the form.
  const { callsBy, rows, unmapped } = useMemo(() => {
    const callsBy = new Map<string, number>();
    const unmatched = new Map<string, number>();
    for (const c of state.calls) {
      if (c.personId) callsBy.set(c.personId, (callsBy.get(c.personId) ?? 0) + 1);
      else unmatched.set(c.extension, (unmatched.get(c.extension) ?? 0) + 1);
    }
    const mappedExt = new Set(state.people.map((p) => p.extension));
    return {
      callsBy,
      rows: state.people.toSorted((a, b) => a.extension.localeCompare(b.extension, undefined, { numeric: true })),
      unmapped: [...unmatched].filter(([ext]) => !mappedExt.has(ext)),
    };
  }, [state.calls, state.people]);

  const ext = form.extension.trim();
  const taken = state.people.find((p) => p.extension === ext);
  const errors: Partial<Record<Field, string>> = {};
  if (taken) errors.extension = `Extension ${ext} is already mapped to ${taken.name}.`;
  else if (tried && !/^\d{2,6}$/.test(ext)) errors.extension = "Use 2 to 6 digits, like 120.";
  if (tried && !form.name.trim()) errors.name = "Add the person's name.";
  if (tried && !form.crm.trim()) errors.crm = "Add their CRM user, like CRM-1056.";

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = form.name.trim();
    const crmUserId = form.crm.trim();
    if (taken || !/^\d{2,6}$/.test(ext) || !name || !crmUserId) {
      setTried(true);
      const first = e.currentTarget.querySelector<HTMLInputElement>(
        taken || !/^\d{2,6}$/.test(ext) ? "[name=extension]" : !name ? "[name=name]" : "[name=crm]",
      );
      first?.focus();
      return;
    }
    const person: Person = { id: `ext-${ext}`, name, extension: ext, crmUserId };
    dispatch({ type: "addExtension", person });
    setAdded(person);
    setForm(EMPTY);
    setTried(false);
  };

  const input = (f: Field, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className={errors[f] ? "fld bad" : "fld"}>
      <label htmlFor={`${id}-${f}`}>{label}</label>
      <input
        id={`${id}-${f}`}
        name={f}
        value={form[f]}
        onChange={set(f)}
        aria-invalid={errors[f] ? true : undefined}
        aria-describedby={errors[f] ? `${id}-${f}-err` : undefined}
        autoComplete="off"
        spellCheck={false}
        {...props}
      />
      {errors[f] && (
        <p className="err" id={`${id}-${f}-err`}>
          {errors[f]}
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="top">
        <div>
          <h1 className="title">Extensions</h1>
          <p className="sub">Each desk-phone extension credits one person and their CRM user. Saved in this browser only.</p>
        </div>
      </div>

      {unmapped.length > 0 && (
        <section className="section nomatch" aria-labelledby={`${id}-nm`}>
          <h2 id={`${id}-nm`}>Not mapped yet</h2>
          <ul>
            {unmapped.map(([x, n]) => (
              <li key={x}>
                <span>
                  Extension <b className="num">{x}</b> took <span className="num">{n}</span> {n === 1 ? "call" : "calls"} with no match. Nobody got credit and no text went out.
                </span>
                <button type="button" className="lnk" onClick={() => (setForm((v) => ({ ...v, extension: x })), document.getElementById(`${id}-name`)?.focus())}>
                  Map extension {x}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="section addx" aria-labelledby={`${id}-add`}>
        <h2 id={`${id}-add`}>Add extension</h2>
        <p className="sub">New calls on it are credited from now on. Calls already logged as No match stay as they were.</p>
        <form onSubmit={submit} noValidate>
          {input("extension", "Extension", { inputMode: "numeric", placeholder: "120…", maxLength: 6, className: "num" })}
          {input("name", "Person", { placeholder: "Full name…", maxLength: 40 })}
          {input("crm", "CRM user", { placeholder: "CRM-1056…", maxLength: 24 })}
          <button type="submit" className="btn pri">
            <PlusIcon />
            Add extension
          </button>
        </form>
        <p className="done" aria-live="polite">
          {added && `Extension ${added.extension} now credits ${added.name}. Run a sample batch on Surveys to see it.`}
        </p>
      </section>
      <section className="section mapped" aria-labelledby={`${id}-map`}>
        <h2 id={`${id}-map`}>Mapped extensions</h2>
        <table className="log stack ext">
          <thead>
            <tr>
              <th>Ext</th>
              <th>Person</th>
              <th>CRM user</th>
              <th className="r">Calls credited</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className={added?.id === p.id ? "sel" : undefined}>
                <td className="num">
                  <b>{p.extension}</b>
                </td>
                <td className="nm">{p.name}</td>
                <td className="num crm">{p.crmUserId}</td>
                <td className="num r end">
                  {callsBy.get(p.id) ?? 0}
                  <small className="m-only"> calls</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
