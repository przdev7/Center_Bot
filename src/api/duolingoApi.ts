import fetch from "node-fetch";

export interface DuolingoUser {
  username: string;
  created: string;
  streak: number | "None";
  totalXp: number;
  weeklyXp: number | "None";
  courses: { language: string; xp: number }[];
  streakExtendedToday: boolean;
}

interface Course {
  learningLanguage: string;
  xp: number;
}

export async function getDuolingoUser(username: string): Promise<DuolingoUser | null> {
  try {
    const response = await fetch(`https://www.duolingo.com/2017-06-30/users?username=${username}`);

    if (!response.ok) {
      throw new Error(`User not found or API blocked (Status: ${response.status})`);
    }

    const data = await response.json();
    if (!data.users || data.users.length === 0) return null;

    const user = data.users[0];

    const creationDate = user.creationDate * 1000;
    const formattedCreationDate = new Date(creationDate).toLocaleDateString();

    return {
      username: user.username,
      created: formattedCreationDate,
      streak: user.streak || "None",
      totalXp: user.totalXp,
      weeklyXp: user.weeklyXp || "None",
      courses: user.courses.map((course: Course) => ({
        language: course.learningLanguage,
        xp: course.xp,
      })),
      streakExtendedToday: user.streakExtendedToday || false,
    };
  } catch (error) {
    console.error(`❌ Error fetching Duolingo user: ${error}`);
    return null;
  }
}
