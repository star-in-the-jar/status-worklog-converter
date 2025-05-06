"use strict";
const MINUTES_IN_HOUR = 60;
const input = `
diCześć,

Dnia 05.05.2025
9:15 – 9:30      Kwestie bieżące                          N/A
9:30 – 10:45     LPP – dump bazy                          IN_PROGRESS
10:45 – 11:00    Kwestie bieżące                          N/A
11:00 – 12:15    LPP – dump bazy                          IN_PROGRESS
12:15 – 13:15    Kwestie bieżące                          N/A
13:15 – 14:30    LPP – dump bazy                          IN_PROGRESS
14:30 – 15:15    Confluence poprawki                      DONE
15:15 – 15:45    LPP – dump bazy                          IN_PROGRESS
15:45 – 17:00    Kursy GCP                                IN_PROGRESS 2/10

Dalszy Plan 
Zadanie LPP – Jenkins - dump bazy                         IN_PROGRESS
Kursy GCP                                                 IN_PROGRESS 2/10

Pozdrawiam
Stanisław


`;
const timeRangeToDuration = (range) => {
    const [from, to] = range.split(/-|–/).map((el) => el.trim());
    const [startH, startM] = from.split(":").map(Number);
    const [endH, endM] = to.split(":").map(Number);
    const startMinutes = startH * MINUTES_IN_HOUR + startM;
    const endMinutes = endH * MINUTES_IN_HOUR + endM;
    const durationMinutes = endMinutes - startMinutes;
    return durationMinutes;
};
const formatTime = ({ hours, minutes }) => `${hours}h ${minutes}m`;
function getWords(str) {
    return str.toLowerCase().split(/\s+/);
}
function wordOverlap(a, b) {
    const wordsA = new Set(getWords(a));
    const wordsB = new Set(getWords(b));
    const common = [...wordsA].filter((word) => wordsB.has(word));
    return common.length >= 3;
}
function similarity(a, b) {
    let matches = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        if (a[i] === b[i])
            matches++;
    }
    return matches / Math.max(a.length, b.length);
}
const convertMinutes = (minutes) => {
    return {
        hours: Math.floor(minutes / MINUTES_IN_HOUR),
        minutes: minutes % MINUTES_IN_HOUR,
    };
};
function mergeSimilarTasks(tasks) {
    const merged = [];
    for (const task of tasks) {
        const match = merged.find((existing) => wordOverlap(task.taskName, existing.taskName) ||
            similarity(task.taskName, existing.taskName) >= 0.75);
        if (match) {
            match.duration += task.duration;
        }
        else {
            merged.push({ ...task });
        }
    }
    return merged;
}
const main = (input) => {
    const regex = /^Dnia.*(?:\n(?!.*Pozdrawiam).*)*/gm;
    const match = input.match(regex);
    if (match) {
        const lines = match[0].split("\n");
        const data = lines.reduce((acc, line) => {
            if (isNaN(Number(line.at(0)))) {
                return acc;
            }
            const [timeRange, taskName] = line.split(/[ ]{2,}|\t+/);
            const duration = timeRangeToDuration(timeRange);
            return [...acc, { timeRange, duration, taskName }];
        }, []);
        const merged = mergeSimilarTasks(data);
        const totalTime = merged.reduce((acc, task) => acc + task.duration, 0);
        const replaced = merged.map((task) => ({
            ...task,
            duration: formatTime(convertMinutes(task.duration)),
        }));
        const longestTaskNameLen = Math.max(...merged.map((task) => task.taskName.length)) + 3;
        replaced.forEach((task) => {
            const nameLength = task.taskName.length;
            const spacesToPut = longestTaskNameLen - nameLength;
            const space = Array.from({ length: spacesToPut }, (_) => " ").join("");
            console.log(task.taskName + space + task.duration);
        });
        const TOTAL = "TOTAL";
        const divider = Array.from({ length: longestTaskNameLen + 6 }, (_) => "-").join("");
        console.log(divider);
        console.log(TOTAL +
            Array.from({ length: longestTaskNameLen - TOTAL.length - 1 }, (_) => " ").join(""), formatTime(convertMinutes(totalTime)));
    }
};
main(input);
