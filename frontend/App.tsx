import { StatusBar } from 'expo-status-bar';
import { View, ScrollView } from 'react-native';
import "./global.css" 
import { PaperProvider, Text } from 'react-native-paper';
import { LightTheme } from './constants/theme';
import SignInScreen from './pages/SignInScreen';
import SignUpScreen from './pages/SIgnUpScreen';

export default function App() {
  return (
    <SignInScreen></SignInScreen>
  );
}


// <PaperProvider theme={LightTheme}>
//           <View className="flex-1 bg-gray-50">
//             <ScrollView
//               contentContainerStyle={{ padding: 16 }}
//               showsVerticalScrollIndicator={false}
//             >
//               <SignInScreen/> 
              
//             </ScrollView>
//             <StatusBar style="auto" />
//           </View>
//         </PaperProvider>


