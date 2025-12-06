import React from "react";


import { createStackNavigator } from "@react-navigation/stack";
import CreateEditEvent from "../pages/MyEvent/AddEvent";
import EditProfile from "../pages/Profile/EditProfile";
import Notification from "../pages/Notification_Review/Notification";
import Search from "../pages/Search_Filter/Search";
import Filter from "../pages/Search_Filter/Filter";
import Events from "../pages/MyEvent/Events";
import EventDetails from "../pages/MyEvent/EventDetails";
import OrganizerProfile from "../pages/Profile/OrganizerProfile";
import InviteFriend from "../pages/Communication/InviteFriend";
import DrawerNavigation from "../components/Navigators_UI/Navigators";
import Home from "../pages/Home";
import Message from "../pages/Communication/Message";
import Chat from "../pages/Communication/Chat";
import BuyTicket from "../pages/Checkout/BuyTicket";
import TicketScreen from "../pages/Checkout/Ticket";
import Ticket from "../pages/Checkout/Ticket";
import ScanCardScreen from "../pages/Checkout/ScanCard";
import AddCard from "../pages/Checkout/AddCard";
import PaymentScreen from "../pages/Checkout/Payment";
import Payment from "../pages/Checkout/Payment";
import ScanCard from "../pages/Checkout/ScanCard";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Drawer + Tabs */}
      <Stack.Screen name="Drawer" component={DrawerNavigation} />

      {/* GLOBAL SCREENS */}
      <Stack.Screen name="Notifications" component={Notification} />
      <Stack.Screen name="CreateEditEvent" component={CreateEditEvent} />
      <Stack.Screen name="BookMark" component={Home} />
      <Stack.Screen name="Message" component={Message} />
      <Stack.Screen name="Setting" component={Home} />
      <Stack.Screen name="SignOut" component={Home} />

      
      
      <Stack.Screen name="Search" component={Search} />  
      <Stack.Screen name="Filter" component={Filter} />
      <Stack.Screen name="EventDetails" component={EventDetails}/>
      <Stack.Screen name="InviteFriend" component={InviteFriend}/>
      <Stack.Screen name="Chat" component={Chat}/>
      <Stack.Screen name="MyEvent" component={Events} />
      <Stack.Screen name="EditProfile" component={EditProfile}/>
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfile}/>

      <Stack.Screen name="BuyTicket" component={BuyTicket}/>
      <Stack.Screen name="Payment" component={Payment}/>
      <Stack.Screen name="AddCard" component={AddCard}/>
      <Stack.Screen name="ScanCard" component={ScanCard}/>
      <Stack.Screen name="Ticket" component={Ticket}/>
    </Stack.Navigator>
  );
}
