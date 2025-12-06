import { createStackNavigator } from "@react-navigation/stack";
import Home from "../pages/Home";


const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      {/* <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Filter" component={Filter} />
      <Stack.Screen name="MyEvent" component={Events} />       */}
    </Stack.Navigator>
  );
}
