import { StatusBar } from 'expo-status-bar';
import { View, ScrollView } from 'react-native';
import "./global.css" 
import { PaperProvider } from 'react-native-paper';
import { LightTheme } from './constants/theme';

export default function App() {
  return (
    <PaperProvider theme={LightTheme}>
          <View className="flex-1 bg-gray-50">
            <ScrollView
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              
              
            </ScrollView>
            <StatusBar style="auto" />
          </View>
        </PaperProvider>
  );
}


