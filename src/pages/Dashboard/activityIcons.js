import {
  Assignment,
  PersonAdd,
  Update,
  CheckCircle,
} from "@mui/icons-material";

export const getActivityIcon = (type) => {
  switch (type) {
    case "profile":
      return <Assignment color="primary" />;
    case "user":
      return <PersonAdd color="success" />;
    case "update":
      return <Update color="warning" />;
    case "complete":
      return <CheckCircle color="success" />;
    default:
      return <Assignment />;
  }
};
