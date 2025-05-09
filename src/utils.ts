const MINUTES_IN_HOUR = 60;

export enum TimeFormat {
  DECIMAL_HOURS = "DECIMAL_HOURS",
  HOURS_AND_MINUTES = "HOURS_AND_MINUTES ",
}

const timeRangeToDuration = (range: string) => {
  const [from, to] = range.split(/-|–/).map((el) => el.trim());
  const [startH, startM] = from.split(":").map(Number);
  const [endH, endM] = to.split(":").map(Number);

  const startMinutes = startH * MINUTES_IN_HOUR + startM;
  const endMinutes = endH * MINUTES_IN_HOUR + endM;

  const durationMinutes = endMinutes - startMinutes;
  return durationMinutes;
};

const formatTime = ({
  hours,
  minutes,
}: {
  hours: number;
  minutes: number;
}): string => `${hours}h ${minutes}m`;

function getWords(str: string): string[] {
  return str.toLowerCase().split(/\s+/);
}

function wordOverlap(a: string, b: string): boolean {
  const wordsA = new Set(getWords(a));
  const wordsB = new Set(getWords(b));
  const common = [...wordsA].filter((word) => wordsB.has(word));
  return common.length >= 3;
}

function similarity(a: string, b: string): number {
  let matches = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) matches++;
  }
  return matches / Math.max(a.length, b.length);
}

const convertMinutes = (minutes: number) => {
  return {
    hours: Math.floor(minutes / MINUTES_IN_HOUR),
    minutes: minutes % MINUTES_IN_HOUR,
  };
};

function mergeSimilarTasks(tasks: { taskName: string; duration: number }[]) {
  const merged: { taskName: string; duration: number }[] = [];

  for (const task of tasks) {
    const match = merged.find(
      (existing) =>
        wordOverlap(task.taskName, existing.taskName) ||
        similarity(task.taskName, existing.taskName) >= 0.75
    );

    if (match) {
      match.duration += task.duration;
    } else {
      merged.push({ ...task });
    }
  }

  return merged;
}

export const convertStatusToWorklog = (
  input: string,
  timeFormat = TimeFormat.DECIMAL_HOURS
) => {
  const regex = /^Dnia.*(?:\n(?!.*Pozdrawiam).*)*/gm;
  const match = input.match(regex);

  if (match) {
    let result = "";
    const lines = match[0].split("\n");
    const data = lines.reduce(
      (
        acc: { timeRange: string; duration: number; taskName: string }[],
        line: string
      ) => {
        if (isNaN(Number(line[0]))) {
          return acc;
        }
        const [timeRange, taskName] = line.split(/[ ]{2,}|\t+/);
        const duration = timeRangeToDuration(timeRange);
        return [...acc, { timeRange, duration, taskName }];
      },
      []
    );
    const merged = mergeSimilarTasks(data);

    const totalTime = merged.reduce(
      (acc: number, task: { duration: number }) => acc + task.duration,
      0
    );
    const replaced = merged.map((task) => ({
      ...task,
      duration:
        timeFormat === TimeFormat.HOURS_AND_MINUTES
          ? formatTime(convertMinutes(task.duration))
          : ((task.duration / MINUTES_IN_HOUR).toFixed(2).toString().replace('.', ',')),
    }));
    const NEWLINE_CHAR = ";";
    const SPACE_CHAR = ".";
    const longestTaskNameLen =
      Math.max(...merged.map((task) => task.taskName.length)) + 3
    replaced.forEach((task) => {
      const nameLength = task.taskName.length;
      const spacesToPut = longestTaskNameLen - nameLength;
      const space = Array.from({ length: spacesToPut }, (_) => SPACE_CHAR).join(
        ""
      );
      result += task.taskName + space + task.duration;
      result += NEWLINE_CHAR;
    });
    const TOTAL = "TOTAL";
    const divider = Array.from(
      { length: longestTaskNameLen + (timeFormat === TimeFormat.HOURS_AND_MINUTES ? 6 : 4) },
      (_) => "-"
    ).join("");
    result += divider;
    result += NEWLINE_CHAR;
    const spaceDots = Array.from(
      { length: longestTaskNameLen - TOTAL.length },
      (_) => SPACE_CHAR
    ).join("");
    result +=
      TOTAL +
      spaceDots +
      (timeFormat === TimeFormat.HOURS_AND_MINUTES
        ? formatTime(convertMinutes(totalTime))
        : ((totalTime / MINUTES_IN_HOUR).toFixed(2).toString().replace('.', ','))
      )
    return result;
  }
  return "Invalid input";
};

export const exampleInput = `Cześć,

Dnia 05.05.2025
9:15 – 9:30     Daily                   N/A
9:30 – 10:30    GCP Courses             IN_PROGRESS
10:30 - 12:00   Project Task            IN_PROGRESS
12:00 - 12:45   Rubber Duck Debugging   DONE

13:15 – 15:15   Project Task            IN_PROGRESS
15:15 – 16:00   GCP Courses             IN_PROGRESS

Dalszy Plan                             IN_PROGRESS
Project Task                            IN_PROGRESS
GCP Courses                             

Pozdrawiam
XYZ
`;
