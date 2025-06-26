export const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date");
  }
  return date.toISOString().split("T")[0];
};

export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
