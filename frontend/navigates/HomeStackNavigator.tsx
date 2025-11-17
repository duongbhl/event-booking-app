import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../pages/Home";
import SearchScreen from "../pages/Search";
import FilterScreen from "../pages/Filter";
import NotificationScreen from "../pages/Notification";
import EventsScreen from "../pages/MyEvent/EventsScreen";
import CreateEditEventScreen from "../pages/AddEvent";

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Filter" component={FilterScreen} />
      <Stack.Screen name="MyEvent" component={EventsScreen} />
      <Stack.Screen name="CreateEditEvent" component={CreateEditEventScreen} />

    </Stack.Navigator>
  );
}
