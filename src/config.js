export const CONFIG = {
  sisterName: "Didi",
  brotherName: "Prabal",
  brotherWhatsApp: "919369638397", // Format: Country code + 10-digit number without '+' or space (e.g. 919005118833)
  locations: {
    sister: "Mathura",
    brother: "Lucknow",
  },
  driveAlbumUrl:
    "https://drive.google.com/drive/folders/1uYirAZ1CQnHCsgOrtfFljwIJrCm4FCxK?usp=drive_link",

  // Generate 24 generic memory placeholders matching folder order:
  // photo1 (slot 1), photo2 (slot 2), photo3 (slot 3), etc.
  memories: Array.from({ length: 24 }, (_, i) => {
    const filename = `photo${i + 1}`;
    return {
      id: `preload_mem_${i + 1}`,
      title: `Memory Snapshot #${i + 1}`,
      image: `/memories/${filename}.jpg`,
      date: "Memories Archive",
      isPreloaded: true,
    };
  }),
};
