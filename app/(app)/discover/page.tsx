"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StudentCard } from "@/components/student-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { calculateMatchScore } from "@/lib/matching";
import { useDemoProfile } from "@/lib/profile-store";
import { students } from "@/lib/sample-data";

export default function DiscoverPage() {
  const { profile } = useDemoProfile();
  const [query, setQuery] = useState("");
  const [connectionType, setConnectionType] = useState("All");
  const [studyStyle, setStudyStyle] = useState("All");

  const connectionTypes = Array.from(new Set(students.flatMap((student) => student.connectionTypes)));
  const studyStyles = Array.from(new Set(students.map((student) => student.studyStyle)));

  const matches = useMemo(() => {
    const normalized = query.toLowerCase();
    return students
      .filter((student) => student.id !== profile.id)
      .filter((student) => connectionType === "All" || student.connectionTypes.includes(connectionType as never))
      .filter((student) => studyStyle === "All" || student.studyStyle === studyStyle)
      .filter((student) =>
        [student.fullName, student.university, student.major, student.country, ...student.languages, ...student.courses, ...student.interests]
          .join(" ")
          .toLowerCase()
          .includes(normalized)
      )
      .map((student) => ({ student, match: calculateMatchScore(profile, student) }))
      .sort((a, b) => b.match.total - a.match.total);
  }, [connectionType, profile, query, studyStyle]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold text-navy">Discover Students</h1>
        <p className="mt-2 text-muted-foreground">Filter by university, major, course, country, language, interest, connection type, student status, and study style.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium text-navy md:col-span-1">
            Search
            <span className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
              <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="CSE 532, India, Korean..." />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-medium text-navy">
            Connection type
            <Select value={connectionType} onChange={(event) => setConnectionType(event.target.value)}>
              <option>All</option>
              {connectionTypes.map((type) => <option key={type}>{type}</option>)}
            </Select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-navy">
            Study style
            <Select value={studyStyle} onChange={(event) => setStudyStyle(event.target.value)}>
              <option>All</option>
              {studyStyles.map((style) => <option key={style}>{style}</option>)}
            </Select>
          </label>
        </CardContent>
      </Card>
      <div className="grid gap-5 xl:grid-cols-2">
        {matches.map(({ student, match }) => <StudentCard key={student.id} student={student} match={match} />)}
      </div>
    </div>
  );
}
