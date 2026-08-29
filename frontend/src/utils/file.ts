export function getFileExtension(fileUrl: string): string {
  const clean = fileUrl.split("?")[0].split("#")[0];
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "" : clean.slice(dot + 1).toUpperCase();
}

export function getFileName(fileUrl: string): string {
  return fileUrl.split("/").pop() ?? fileUrl;
}
