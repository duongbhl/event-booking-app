import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useLocalization } from '../../context/LocalizationContext';

export default function Settings() {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { language, setLanguage, t } = useLocalization();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      t('settings.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t('settings.logout'),
          onPress: async () => {
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLanguageChange = async (lang: 'en' | 'vi') => {
    await setLanguage(lang);
  };

  return (
    <ScrollView className="flex-1 bg-white mt-10">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 pb-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-4">{t('settings.settings')}</Text>
      </View>

      {/* Language Section */}
      <View className="px-5 py-6 border-b border-gray-100">
        <Text className="text-lg font-semibold mb-4 text-gray-900">
          {t('settings.language')}
        </Text>

        {/* English Option */}
        <TouchableOpacity
          onPress={() => handleLanguageChange('en')}
          className={`flex-row items-center p-4 rounded-lg mb-3 border-2 ${
            language === 'en' ? 'border-orange-500 bg-orange-50' : 'bg-gray-50'
          }`}
        >
          <View
            className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
              language === 'en' ? 'border-orange-500' : 'border-gray-300'
            }`}
          >
            {language === 'en' && (
              <View className="w-3 h-3 rounded-full bg-orange-500" />
            )}
          </View>
          <Text className="text-base font-medium">{t('settings.english')}</Text>
        </TouchableOpacity>

        {/* Vietnamese Option */}
        <TouchableOpacity
          onPress={() => handleLanguageChange('vi')}
          className={`flex-row items-center p-4 rounded-lg border-2 ${
            language === 'vi' ? 'border-orange-500 bg-orange-50' : 'bg-gray-50'
          }`}
        >
          <View
            className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
              language === 'vi' ? 'border-orange-500' : 'border-gray-300'
            }`}
          >
            {language === 'vi' && (
              <View className="w-3 h-3 rounded-full bg-orange-500" />
            )}
          </View>
          <Text className="text-base font-medium">{t('settings.vietnamese')}</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View className="px-5 py-6 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-900">
            {t('settings.notifications')}
          </Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#FF7A00' }}
            thumbColor={notificationsEnabled ? '#FF7A00' : '#f4f3f4'}
          />
        </View>
        <Text className="text-sm text-gray-500 mt-2">
          {notificationsEnabled
            ? t('settings.enableNotifications')
            : 'Notifications are currently disabled'}
        </Text>
      </View>

      {/* About Section */}
      <View className="px-5 py-6 border-b border-gray-100">
        <Text className="text-lg font-semibold mb-3 text-gray-900">
          {t('settings.about')}
        </Text>
        <Text className="text-sm text-gray-600 mb-2">
          <Text className="font-semibold">Version:</Text> 1.0.0
        </Text>
        <Text className="text-sm text-gray-600">
          <Text className="font-semibold">Build:</Text> 1.0.0
        </Text>
      </View>

      {/* Danger Zone - Logout */}
      

      {/* Bottom padding */}
      <View className="h-10" />
    </ScrollView>
  );
}
