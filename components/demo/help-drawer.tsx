"use client";

import { Drawer } from "@/components/demo/drawer";
import { HELP } from "@/lib/demo/help";

export function HelpDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="How it works" sub="For everyone on the team">
      <h3>How you get credit</h3>
      <ul className="help-list">
        {HELP.credit.map((i) => (
          <li key={i.title}>
            <b>{i.title}</b>
            <span>{i.body}</span>
          </li>
        ))}
      </ul>
      <h3>When a customer gets a survey</h3>
      <ul className="help-list">
        {HELP.surveys.map((i) => (
          <li key={i.title}>
            <b>{i.title}</b>
            <span>{i.body}</span>
          </li>
        ))}
      </ul>
      <h3>Questions</h3>
      <ul className="help-list">
        {HELP.faq.map((f) => (
          <li key={f.q}>
            <b>{f.q}</b>
            <span>{f.a}</span>
          </li>
        ))}
      </ul>
    </Drawer>
  );
}
