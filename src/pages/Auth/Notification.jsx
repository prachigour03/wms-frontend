import React from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import { CheckCircle, Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  markAsRead,
  removeNotification,
  clear,
} from "../../features/notificationSlice";

const Notification = () => {
  const dispatch = useDispatch();
  const { list } = useSelector((s) => s.notifications);
  console.log(list)

  return (
    <Box p={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>

        {list.length > 0 && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => dispatch(clear())}
          >
            Clear All
          </Button>
        )}
      </Stack>

      <Paper elevation={2}>
        {list.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">
              No notifications available
            </Typography>
          </Box>
        ) : (
          <List>
            {list.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: item.read ? "transparent" : "#f5faff",
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {!item.read && (
                        <IconButton
                          color="success"
                          onClick={() =>
                            dispatch(markAsRead(item.id))
                          }
                        >
                          <CheckCircle />
                        </IconButton>
                      )}

                      <IconButton
                        color="error"
                        onClick={() =>
                          dispatch(removeNotification(item.id))
                        }
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>
                          {item.title}
                        </Typography>
                        {!item.read && (
                          <Chip size="small" label="New" color="primary" />
                        )}
                      </Stack>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">
                          {item.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(item.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>

                {index !== list.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default Notification;
