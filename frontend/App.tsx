import React from 'react';
import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import "./global.css";
import MainTabs from './components/MainTabs';
import CustomDrawer from './components/CustomDrawer';


const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerType: "front",
            overlayColor: "rgba(0,0,0,0.3)",
            swipeEdgeWidth: 200, // vuốt từ mép trái 200px
            drawerStyle: {
              width: 280,
              backgroundColor: "#fff",
            },
          }}
          drawerContent={(props) => <CustomDrawer {...props} />}
        >
          <Drawer.Screen name="MainTabs" component={MainTabs} />
        </Drawer.Navigator>

      </NavigationContainer>
    </>
  )
}






