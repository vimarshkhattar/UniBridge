"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { guides } from "@/lib/sample-data";

export default function GuidesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = Array.from(new Set(guides.map((guide) => guide.category)));
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return guides.filter((guide) =>
      (category === "All" || guide.category === category) &&
      [guide.title, guide.summary, guide.category, ...guide.examples].join(" ").toLowerCase().includes(normalized)
    );
  }, [category, query]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Survival Guides</h1>
        <p className="mt-2 text-muted-foreground">Search practical guides for academics, communication, campus life, employment, safety, and Stony Brook launch resources.</p>
      </div>
      <div className="grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-[1fr_260px]">
        <label className="grid gap-2 text-sm font-medium text-navy">
          Search guides
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="office hours, syllabus, jobs..." />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-medium text-navy">
          Category
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </label>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {filtered.map((guide) => (
          <Card key={guide.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{guide.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{guide.category} · {guide.readingTime} · Updated {guide.lastUpdated}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p className="text-sm leading-6 text-muted-foreground">{guide.summary}</p>
              {guide.sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="font-semibold text-navy">{section.heading}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.body}</p>
                </div>
              ))}
              <div>
                <h2 className="font-semibold text-navy">Practical example</h2>
                <p className="mt-1 rounded-md bg-muted p-3 text-sm text-muted-foreground">{guide.examples[0]}</p>
              </div>
              <div>
                <h2 className="font-semibold text-navy">What should I do next?</h2>
                <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
                  {guide.checklist.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
              {guide.disclaimer && <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{guide.disclaimer}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
