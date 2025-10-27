import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    return { status: 'undetermined' as const };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return { status: existingStatus };
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return { status };
}

export async function scheduleWeeklyReminder(minutes: number) {
  if (minutes <= 0) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tu meta semanal',
      body: `Dedica ${minutes} minutos esta semana a construir tu trayecto Inclick.`,
    },
    trigger: {
      repeats: true,
      weekday: 1,
      hour: 9,
      minute: 0,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
