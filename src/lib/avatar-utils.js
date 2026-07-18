// src/lib/avatar-utils.js

const AVATAR_COLORS = [
  "#6366F1", "#10B981", "#F59E0B",
  "#EF4444", "#20970B", "#818CF8",
  "#0EA5E9", "#EC4899", "#8B5CF6",
  "#14B8A6",
];

const hashName = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const getAvatarColor = (name) => {
  return AVATAR_COLORS[hashName(name || "") % AVATAR_COLORS.length];
};