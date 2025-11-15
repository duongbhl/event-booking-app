type RootStackParamList = {
    HomeScreen: undefined;
    ProfileScreen: { userId: string }| undefined;
    NotificationScreen: undefined ;
    CreateEventScreen: { date?: string } | undefined;
    CalendarScreen: undefined;
    SelectLocationScreen: undefined;    
};