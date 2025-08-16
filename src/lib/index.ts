import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

export const dateTimeHandler = () => {
  return dayjs(Date.now()).format("YYYY-MM-DD HH:mm");
};
