import React from 'react';
import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import "./global.css";
import CalendarScreen from './pages/Calendar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './pages/Home';
import ProfileScreen from './pages/Profile';
import NotificationScreen from './pages/Notification';
import CreateEventScreen from './pages/CreateEvent';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';


//const Drawer = createDrawerNavigator();
// const Stack = createStackNavigator();
const RootStack = createStackNavigator({
  screens: {
    // Home: {
    //   screen: HomeScreen,
    //   options: { title: 'Welcome' },
    // },
    Calendar: {
      screen: CalendarScreen,
    },
    Notification: {
      screen: NotificationScreen,
    },
    Profile: {
      screen: ProfileScreen,
    },
    CreateEvent: {
      screen: CreateEventScreen,
    },
  },
});

const Navigation = createStaticNavigation(RootStack);


export default function App() {
  return (
    <>
      <Navigation></Navigation>
    </>



  )
}


// //bottom tab navigator
// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={{
//         headerShown: false,
//         tabBarShowLabel: false,
//         tabBarStyle: {
//           height: 65,
//           borderTopLeftRadius: 25,
//           borderTopRightRadius: 25,
//           backgroundColor: "#fff",
//         },
//       }}
//     >
//       <Tab.Screen
//         name="Home"
//         component={HomeScreenStack}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Ionicons
//               name={focused ? "home" : "home-outline"}
//               size={25}
//               color={focused ? "#FF7A00" : "#999"}
//             />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="Calendar"
//         component={CalendarScreen}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Ionicons
//               name={focused ? "calendar" : "calendar-outline"}
//               size={25}
//               color={focused ? "#FF7A00" : "#999"}
//             />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="Notification"
//         component={NotificationScreen}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Ionicons
//               name={focused ? "notifications" : "notifications-outline"}
//               size={25}
//               color={focused ? "#FF7A00" : "#999"}
//             />
//           ),
//         }}
//       />

//       <Tab.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           tabBarIcon: ({ focused }) => (
//             <Ionicons
//               name={focused ? "person" : "person-outline"}
//               size={25}
//               color={focused ? "#FF7A00" : "#999"}
//             />
//           ),
//         }}
//       />
//     </Tab.Navigator>
//   );
// }


// function HomeScreenStack() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="HomeMain" component={HomeScreen} />
//       <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
//     </Stack.Navigator>
//   );
// }




