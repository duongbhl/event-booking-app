import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Switch,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

export default function SignIn() {
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login: saveAuth } = useAuth();

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password");
            return;
        }

        try {
            setLoading(true);

            const data = await login({ email, password });

            await saveAuth(
                {
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role,
                },
                data.token
            );


            Alert.alert("Success", "Login successfully");



        } catch (error: any) {
            console.log("LOGIN ERROR:", error?.response?.data);

            Alert.alert(
                "Login failed",
                error?.response?.data?.message || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mt-2">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="chevron-back" size={26} color="#111827" />
                        </TouchableOpacity>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* Title */}
                    <Text className="text-3xl font-semibold text-center mt-4 text-gray-900">
                        Sign in
                    </Text>
                    <Text className="text-center text-gray-500 mt-2">
                        Give credential to sign in your account
                    </Text>

                    {/* Email */}
                    <View className="mt-8">
                        <Text className="text-gray-600 mb-2">Email</Text>
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                            <Ionicons name="mail-outline" size={20} color="#999" />
                            <TextInput
                                placeholder="Type your email"
                                className="ml-3 flex-1"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View className="mt-5">
                        <Text className="text-gray-600 mb-2">Password</Text>
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                            <Ionicons name="lock-closed-outline" size={20} color="#999" />
                            <TextInput
                                placeholder="Type your password"
                                className="ml-3 flex-1"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={22}
                                    color="#999"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Remember + Forgot */}
                    <View className="flex-row items-center justify-between mt-4">
                        <View className="flex-row items-center">
                            <Switch
                                value={remember}
                                onValueChange={setRemember}
                                thumbColor={remember ? "#f97316" : "#fff"}
                                trackColor={{ true: "#fcae74", false: "#ccc" }}
                            />
                            <Text className="ml-2 text-gray-600">Remember Me</Text>
                        </View>

                        <TouchableOpacity>
                            <Text className="text-orange-500 font-medium">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        className="mt-8"
                        onPress={handleSignIn}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={["#383838", "#121212"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="justify-center items-center"
                            style={{ height: 56, borderRadius: 28 }}
                        >
                            <Text className="text-white text-center mt-4 text-lg font-semibold tracking-wider">
                                {loading ? "LOADING..." : "SIGN IN"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View className="flex-row items-center mt-10 mb-4">
                        <View className="flex-1 h-[1px] bg-gray-300" />
                        <Text className="mx-3 text-gray-500">or continue with</Text>
                        <View className="flex-1 h-[1px] bg-gray-300" />
                    </View>

                    {/* Social */}
                    <View className="flex-row justify-center gap-x-4">
                        <TouchableOpacity className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center">
                            <FontAwesome name="facebook" size={32} color="#1877F2" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center">
                            <FontAwesome name="google" size={32} color="#DB4437" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center">
                            <FontAwesome name="apple" size={32} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View className="flex-row justify-center mt-10">
                        <Text className="text-gray-500">Don't have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("SignUp")}
                        >
                            <Text className="text-orange-500 font-semibold">
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
