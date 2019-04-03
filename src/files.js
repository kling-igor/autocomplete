export const RECENT_FILES = [
  { fileName: "login.js", path: "controllers", dirty: true },
  { fileName: "login.json", path: "views" }
].sort((a, b) => {
  const aText = `${a.path}/${a.fileName} `;
  const bText = `${b.path}/${b.fileName}`;
  return aText.localeCompare(bText);
});

export const FILES = [
  { fileName: "login.js", path: "controllers", dirty: true },
  { fileName: "login.json", path: "views" },
  { fileName: "detailview.js", path: "controllers" },
  { fileName: "README.md", path: "" } // root
].sort((a, b) => {
  const aText = `${a.path}/${a.fileName} `;
  const bText = `${b.path}/${b.fileName}`;
  return aText.localeCompare(bText);
});
