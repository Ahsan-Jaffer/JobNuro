import fs from "fs/promises";

export const deleteFile = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fs.access(filePath);
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete file: ${filePath}`, error.message);
    }
  }
};