const fs = require("fs");
const path = require("path");
const { BEAL_EVENTS } = require("./calendar-data.js");

const outputFile = path.join(__dirname, "calendar.ics");

const pad = (n) => String(n).padStart(2, "0");
const toBasicDate = (iso) => iso.replaceAll("-", "");

function nowUtcStamp() {
  const d = new Date();
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeIcs(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function parseStartTime(text) {
  if (!text || /all day/i.test(text)) return null;
  const match = String(text).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return { hour, minute };
}

function localDateTime(dateIso, hour, minute) {
  return `${toBasicDate(dateIso)}T${pad(hour)}${pad(minute)}00`;
}

function nextDate(dateIso) {
  const d = new Date(`${dateIso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildEvent(event, index) {
  const uid = `beal-${index}-${Math.random().toString(36).slice(2, 10)}@calendar`;
  const summary = `${event.kid}${event.team ? ` (${event.team})` : ""} - ${event.title}`;
  const description = `${event.time || "All Day"} | ${event.location || "TBD"}`;

  const lines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${nowUtcStamp()}`,
    `SUMMARY:${escapeIcs(summary)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `LOCATION:${escapeIcs(event.location || "")}`
  ];

  if (event.startDate && event.endDate) {
    lines.push(`DTSTART;VALUE=DATE:${toBasicDate(event.startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${toBasicDate(nextDate(event.endDate))}`);
  } else {
    const startTime = parseStartTime(event.time);

    if (!startTime) {
      lines.push(`DTSTART;VALUE=DATE:${toBasicDate(event.date)}`);
      lines.push(`DTEND;VALUE=DATE:${toBasicDate(nextDate(event.date))}`);
    } else {
      lines.push(`DTSTART:${localDateTime(event.date, startTime.hour, startTime.minute)}`);
      lines.push(`DTEND:${localDateTime(event.date, Math.min(startTime.hour + 2, 23), startTime.minute)}`);
    }
  }

  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

const ics = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Beal Family Baseball System//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  ...BEAL_EVENTS.map(buildEvent),
  "END:VCALENDAR",
  ""
].join("\r\n");

fs.writeFileSync(outputFile, ics, "utf8");
console.log(`Generated ${outputFile}`);