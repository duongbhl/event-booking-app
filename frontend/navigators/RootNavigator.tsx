import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";

// AUTH SCREENS
import SignIn from "../pages/Registration/SignIn";
import SignUp from "../pages/Registration/SignUp";
import Verification from "../pages/Registration/Verification";
import ResetPassword from "../pages/Registration/ResetPassword";
import SelectInterest from "../pages/Registration/SelectInterest";
import SelectLocation from "../pages/Registration/SelectLocation";
import { SelectionCountry } from "../pages/Registration/SelectCountry";

// APP SCREENS
import DrawerNavigation from "../components/Navigators_UI/Navigators";
import Notification from "../pages/Notification_Review/Notification";
import CreateEditEvent from "../pages/MyEvent/AddEvent";
import Search from "../pages/Search_Filter/Search";
import Filter from "../pages/Search_Filter/Filter";
import Events from "../pages/MyEvent/Events";
import EventDetails from "../pages/MyEvent/EventDetails";
import OrganizerProfile from "../pages/Profile/OrganizerProfile";
import InviteFriend from "../pages/Communication/InviteFriend";
import Message from "../pages/Communication/Message";
import Chat from "../pages/Communication/Chat";
import BuyTicket from "../pages/Checkout/BuyTicket";
import Ticket from "../pages/Checkout/Ticket";
import AddCard from "../pages/Checkout/AddCard";
import Payment from "../pages/Checkout/Payment";
import ScanCard from "../pages/Checkout/ScanCard";
import EditProfile from "../pages/Profile/EditProfile";

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  // ⏳ Đang auto-login
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ---------- CHƯA LOGIN ---------- */}
      {!user ? (
        <>
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="Verification" component={Verification} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
          <Stack.Screen name="SelectCountry" component={SelectionCountry} />
          <Stack.Screen name="SelectInterest" component={SelectInterest} />
          <Stack.Screen name="SelectLocation" component={SelectLocation} />
        </>
      ) : (
        <>
          {/* ---------- ĐÃ LOGIN ---------- */}
          <Stack.Screen name="Drawer" component={DrawerNavigation} />

          {/* GLOBAL SCREENS */}
          <Stack.Screen name="Notifications" component={Notification} />
          <Stack.Screen name="CreateEditEvent" component={CreateEditEvent} />
          <Stack.Screen name="Message" component={Message} />
          {/* <Stack.Screen name="BookMark" component={Home} />
          <Stack.Screen name="Setting" component={Home} /> */}
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Filter" component={Filter} />
          <Stack.Screen name="EventDetails" component={EventDetails} />
          <Stack.Screen name="InviteFriend" component={InviteFriend} />
          <Stack.Screen name="Chat" component={Chat} />
          <Stack.Screen name="MyEvent" component={Events} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="OrganizerProfile" component={OrganizerProfile} />
          <Stack.Screen name="BuyTicket" component={BuyTicket} />
          <Stack.Screen name="Payment" component={Payment} />
          <Stack.Screen name="AddCard" component={AddCard} />
          <Stack.Screen name="ScanCard" component={ScanCard} />
          <Stack.Screen name="Ticket" component={Ticket} />
        </>
      )}
    </Stack.Navigator>
  );
}
