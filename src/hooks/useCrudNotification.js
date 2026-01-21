import { useDispatch } from 'react-redux';
import { increment } from '../features/notificationSlice';

export const useCrudNotification = () => {
  const dispatch = useDispatch();

  const notifySuccess = (message) => {
    dispatch(increment({
      id: Date.now(),
      message,
      title: 'Success',
    }));
  };

  return { notifySuccess };
};